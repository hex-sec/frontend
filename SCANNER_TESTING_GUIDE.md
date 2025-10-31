# Hand Scanner Testing Guide

## Overview
This guide explains how to test the hand scanner input functionality in the Guard Access page and Kiosk Scan page.

## How the Scanner Works

The scanner uses **keyboard wedge mode**, which means:
1. The scanner acts like a keyboard
2. It sends rapid sequential keystrokes for each character in the code
3. It sends an `Enter` key at the end to indicate completion
4. The `useKeyboardWedge` hook captures these rapid keystrokes and assembles them into a complete code

## Testing with Physical Scanner

### Step 1: Navigate to Access Page
1. Log in as a guard user
2. Navigate to `/guard/access`

### Step 2: Enable Debug Mode (Development Only)
- Click the "Show Scanner Debug" button in the bottom-left corner (only visible in dev mode)
- This will show a debug panel displaying:
  - Current buffer (characters being typed)
  - Recent scans (last 10 scanned codes)

### Step 3: Test Scanner Input
1. Make sure the text input field is focused (it should auto-focus on page load)
2. Scan a barcode/QR code with your hand scanner
3. You should see:
   - Console logs showing `[Scanner] Buffer: ...` for each character
   - Console log showing `[Scanner] Detected code: ...` when Enter is pressed
   - The code appearing in the debug panel
   - The code being automatically submitted to check access

### Step 4: Verify Behavior
- ✅ The code should be captured automatically (no need to type manually)
- ✅ The code should appear in the input field
- ✅ Access check should be triggered automatically
- ✅ Result should appear in the AccessResultCard

## Testing in Kiosk Mode

1. Navigate to `/kiosk/scan`
2. The scanner input works the same way
3. Scan a code - it should automatically navigate to the Confirm page

## Debug Console

Open browser DevTools (F12) and watch the Console tab. You'll see:
- `[Scanner] Buffer: A` - Each character as it's typed
- `[Scanner] Buffer: AB` - Buffer accumulating
- `[Scanner] Detected code: ABC123` - Complete code detected

## Common Issues

### Scanner Not Detected
- **Issue**: Scanner inputs aren't being captured
- **Solution**: 
  - Make sure the input field is focused
  - Check that the scanner is in keyboard wedge mode (not HID mode)
  - Verify scanner settings match expected format

### Partial Codes
- **Issue**: Only part of the code is captured
- **Solution**:
  - Scanner may be sending codes too slowly
  - Adjust the `timeout` parameter in `useKeyboardWedge` (default: 120ms)
  - Check scanner speed settings

### Multiple Codes in One Scan
- **Issue**: Scanner sends multiple codes or extra characters
- **Solution**:
  - Check scanner configuration
  - Some scanners add prefix/suffix (configure scanner or trim in code)

### Codes Not Submitting
- **Issue**: Code is captured but not submitted
- **Solution**:
  - Verify Enter key is being sent by scanner
  - Check browser console for errors
  - Ensure access direction is selected (Enter/Exit toggle)

## Test Utilities

### Simulate Scanner Input (for automated testing)

```typescript
import { simulateScannerInput } from '@features/shared/utils/scannerTestUtils'

// Simulate scanning a code
simulateScannerInput('ABC123')

// With custom delay between characters
simulateScannerInput('ABC123', 20) // 20ms delay
```

### Generate Test Codes

```typescript
import { generateTestCode } from '@features/shared/utils/scannerTestUtils'

// Generate random test code
const code = generateTestCode('TEST', 8) // "TEST" + 8 random chars
```

## Unit Tests

Run tests with:
```bash
npm test
```

Or with UI:
```bash
npm run test:ui
```

The `useKeyboardWedge` hook has comprehensive unit tests covering:
- Basic scan detection
- Timeout handling
- Multiple rapid scans
- Modifier key filtering
- Empty buffer handling

## Manual Testing Checklist

- [ ] Scanner sends characters rapidly (< 120ms between chars)
- [ ] Scanner sends Enter at the end
- [ ] Code appears in debug panel
- [ ] Code appears in input field
- [ ] Access check is triggered automatically
- [ ] Result card displays correctly
- [ ] Works offline (queued for later)
- [ ] Works online (immediate submission)
- [ ] Multiple rapid scans work correctly
- [ ] Manual typing still works (not blocked)

## Scanner Configuration Tips

### Recommended Settings
- **Mode**: Keyboard Wedge / HID Keyboard
- **Transmit Speed**: Fast (10-20ms between characters)
- **Suffix**: Enter key (CR/LF)
- **Prefix**: None (or configure trim in code)
- **Beep**: Enabled for feedback

### Common Scanner Prefixes/Suffixes
Some scanners add prefixes like:
- Code 39: May include start/stop characters
- QR Code: Usually clean text
- EAN-13: May include check digit

Configure scanner or handle in code as needed.

## Troubleshooting

If scanner doesn't work:
1. Check browser console for errors
2. Verify scanner is sending keystrokes (type manually in Notepad to test)
3. Check focus - input field must be focused
4. Try adjusting timeout in `useKeyboardWedge` hook
5. Verify scanner is in keyboard wedge mode, not USB serial

## Need Help?

- Check browser console for detailed logs
- Enable debug panel for visual feedback
- Review unit tests for expected behavior
- Test with simulated input first: `simulateScannerInput('TEST123')`

