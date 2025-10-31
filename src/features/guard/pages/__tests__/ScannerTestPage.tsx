import { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material'
import { useKeyboardWedge } from '@features/shared/hooks/useKeyboardWedge'

/**
 * Manual Scanner Test Page
 * Use this page to test hand scanner input in development
 * Navigate to: /guard/scanner-test
 */
export default function ScannerTestPage() {
  const [scans, setScans] = useState<Array<{ code: string; timestamp: Date; method: string }>>([])
  const [lastScan, setLastScan] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')

  // Track manual input
  const handleManualInput = (value: string) => {
    const scan = {
      code: value,
      timestamp: new Date(),
      method: 'Manual Input',
    }
    setScans((prev) => [scan, ...prev].slice(0, 20)) // Keep last 20
    setLastScan(value)
    setInputValue('')
  }

  // Track scanner input via keyboard wedge
  useKeyboardWedge((scannedValue) => {
    const scan = {
      code: scannedValue,
      timestamp: new Date(),
      method: 'Scanner (HID)',
    }
    setScans((prev) => [scan, ...prev].slice(0, 20))
    setLastScan(scannedValue)
  }, 120)

  const clearHistory = () => {
    setScans([])
    setLastScan(null)
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Stack spacing={3}>
        <Typography variant="h4" fontWeight={600}>
          Scanner Test Page
        </Typography>

        <Alert severity="info">
          <Typography variant="body2">
            <strong>Instructions:</strong>
            <br />
            1. Focus on the input field below
            <br />
            2. Use your hand scanner to scan a code
            <br />
            3. The scanner should send keystrokes rapidly followed by Enter
            <br />
            4. Scanned codes will appear below automatically
            <br />
            5. You can also type manually and press Enter to test
          </Typography>
        </Alert>

        {/* Manual Input Test */}
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Manual Input Test</Typography>
            <TextField
              label="Type code manually (or scan with scanner)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputValue.trim()) {
                  handleManualInput(inputValue.trim())
                }
              }}
              fullWidth
              autoFocus
              helperText="Type and press Enter, or use scanner"
              inputProps={{
                style: { fontSize: 18 },
              }}
            />
            <Button variant="outlined" onClick={clearHistory} disabled={scans.length === 0}>
              Clear History
            </Button>
          </Stack>
        </Paper>

        {/* Last Scan Display */}
        {lastScan && (
          <Paper sx={{ p: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="h6">Last Scan:</Typography>
              <Chip
                label={lastScan}
                sx={{
                  fontSize: 20,
                  fontWeight: 600,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                }}
              />
              <Typography variant="caption">{scans[0]?.timestamp.toLocaleTimeString()}</Typography>
            </Stack>
          </Paper>
        )}

        {/* Scan History */}
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Scan History ({scans.length})</Typography>
            {scans.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No scans yet. Scan a code or type manually to test.
              </Typography>
            ) : (
              <List>
                {scans.map((scan, index) => (
                  <Box key={index}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Chip
                              label={scan.code}
                              color="primary"
                              variant="outlined"
                              sx={{ fontSize: 16, fontWeight: 600 }}
                            />
                            <Chip
                              label={scan.method}
                              size="small"
                              color={scan.method === 'Scanner (HID)' ? 'success' : 'default'}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {scan.timestamp.toLocaleTimeString()}
                            </Typography>
                          </Stack>
                        }
                      />
                    </ListItem>
                    {index < scans.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            )}
          </Stack>
        </Paper>

        {/* Test Statistics */}
        {scans.length > 0 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Statistics
            </Typography>
            <Stack direction="row" spacing={3}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total Scans
                </Typography>
                <Typography variant="h6">{scans.length}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Scanner Scans
                </Typography>
                <Typography variant="h6">
                  {scans.filter((s) => s.method === 'Scanner (HID)').length}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Manual Scans
                </Typography>
                <Typography variant="h6">
                  {scans.filter((s) => s.method === 'Manual Input').length}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Box>
  )
}
