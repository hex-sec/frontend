"""Translate locale JSON files from English into multiple languages using the OpenAI API."""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Any

from openai import OpenAI, OpenAIError

BASE_LANGUAGE = "en"
DEFAULT_TARGETS = ["es", "fr", "de", "it", "ru", "zh", "ja"]
LOCALES_DIR = Path(__file__).resolve().parent.parent / "src" / "i18n" / "locales"
ENV_FILE = Path(__file__).resolve().parent.parent / ".env"
MODEL_NAME = os.getenv("OPENAI_TRANSLATION_MODEL", "gpt-4o-mini")
SYSTEM_PROMPT = """
You are an enterprise-grade localization engine. You receive JSON with translation keys in English. Translate only the string values into the target language while preserving keys, data structures, markdown, newline characters, punctuation, and interpolation tokens like {{variable}} exactly as provided. Return strictly valid JSON with the same shape. Do not add explanations.
""".strip()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Translate locale files using OpenAI",
        formatter_class=argparse.RawTextHelpFormatter,
    )
    parser.add_argument(
        "languages",
        nargs="*",
        help="Language codes to translate (default: es fr de it ru zh ja)",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing non-empty locale files",
    )
    return parser.parse_args()


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def has_non_empty_json(path: Path) -> bool:
    if not path.exists():
        return False
    try:
        data = load_json(path)
    except json.JSONDecodeError:
        return False
    return bool(data)


def load_env_file(env_path: Path) -> None:
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and value and key not in os.environ:
            os.environ[key] = value


def translate_dictionary(client: OpenAI, payload: Any, target_language: str) -> Any:
    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT,
        },
        {
            "role": "user",
            "content": (
                "Translate the following JSON from English to "
                f"{target_language}. Respond with JSON only.\n\n"
                f"{json.dumps(payload, ensure_ascii=False, indent=2)}"
            ),
        },
    ]

    completion = _create_chat_completion(client, messages)
    translated_text = _extract_message_content(completion)

    try:
        return json.loads(translated_text)
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            "Received invalid JSON from OpenAI. Enable --force to overwrite manually after fixing."
        ) from exc


def _create_chat_completion(client: OpenAI, messages: list[dict[str, Any]]):
    try:
        return client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            response_format={"type": "json_object"},
        )
    except TypeError:
        return client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
        )


def _extract_message_content(completion) -> str:
    choice = completion.choices[0]
    content = choice.message.content
    if isinstance(content, list):
        combined = "".join(part.get("text", "") for part in content if isinstance(part, dict))
        return combined
    if isinstance(content, str):
        return content
    raise RuntimeError("OpenAI returned an unexpected response format.")


def translate_locale(client: OpenAI, base_payload: Any, language: str, force: bool) -> None:
    destination = LOCALES_DIR / f"{language}.json"
    if has_non_empty_json(destination) and not force:
        print(f"Skipping {language}: existing translations detected (use --force to overwrite).")
        return

    print(f"Translating {language} → {destination} using {MODEL_NAME}...")
    attempt = 1
    while True:
        try:
            translated = translate_dictionary(client, base_payload, language)
            with destination.open("w", encoding="utf-8") as handle:
                json.dump(translated, handle, ensure_ascii=False, indent=2)
                handle.write("\n")
            print(f"✔ Wrote {destination}")
            return
        except (OpenAIError, RuntimeError) as error:
            if attempt >= 3:
                raise
            delay = attempt * 5
            print(
                f"Translation failed for {language} (attempt {attempt}): {error}. "
                f"Retrying in {delay}s...",
                file=sys.stderr,
            )
            time.sleep(delay)
            attempt += 1


def main() -> None:
    if not LOCALES_DIR.exists():
        raise SystemExit(f"Locales directory not found: {LOCALES_DIR}")

    load_env_file(ENV_FILE)

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise SystemExit("OPENAI_API_KEY environment variable is required.")

    args = parse_args()
    targets = args.languages or DEFAULT_TARGETS
    targets = [lang.lower() for lang in targets if lang.lower() != BASE_LANGUAGE]
    if not targets:
        print("No target languages selected. Nothing to do.")
        return

    base_path = LOCALES_DIR / f"{BASE_LANGUAGE}.json"
    base_payload = load_json(base_path)

    client = OpenAI(api_key=api_key)

    for language in targets:
        translate_locale(client, base_payload, language, args.force)


if __name__ == "__main__":
    try:
        main()
    except SystemExit as exit_exc:
        raise
    except KeyboardInterrupt:
        print("\nTranslation cancelled by user.")
        sys.exit(130)
    except Exception as error:  # noqa: BLE001
        print(f"Translation workflow failed: {error}", file=sys.stderr)
        sys.exit(1)
