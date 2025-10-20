import { useAuthStore } from '@app/auth/auth.store'

type RequestInitLike = Omit<RequestInit, 'headers'> & { headers?: Record<string, string> }

async function baseFetch(input: string, init?: RequestInitLike) {
  // read current site from store synchronously
  const currentSite = useAuthStore.getState().currentSite
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init?.headers ?? {}),
  }
  if (currentSite?.id) headers['x-tenant-id'] = currentSite.id

  const res = await fetch(input, { ...init, headers })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const err = new Error(`HTTP ${res.status}: ${text || res.statusText}`) as Error & {
      status?: number
    }
    err.status = res.status
    throw err
  }
  return res
}

export async function getJson<T = unknown>(input: string) {
  const res = await baseFetch(input, { method: 'GET' })
  return (await res.json()) as T
}

export async function postJson<T = unknown>(input: string, body?: unknown) {
  const res = await baseFetch(input, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'Content-Type': 'application/json' },
  })
  return (await res.json()) as T
}

export default baseFetch
