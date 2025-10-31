import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Box, Button, Stack, Typography, Paper, Alert } from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import RefreshIcon from '@mui/icons-material/Refresh'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary Component
 * Catches React errors in component tree and displays a fallback UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            bgcolor: 'background.default',
          }}
        >
          <Paper sx={{ p: 4, maxWidth: 600, width: '100%' }}>
            <Stack spacing={3} alignItems="center">
              <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main' }} />
              <Typography variant="h4" component="h1" textAlign="center">
                Algo salió mal
              </Typography>
              <Alert severity="error" sx={{ width: '100%' }}>
                <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                  {this.state.error?.message || 'Error desconocido'}
                </Typography>
              </Alert>
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <Box sx={{ width: '100%', maxHeight: 200, overflow: 'auto' }}>
                  <Typography variant="caption" component="pre" sx={{ fontSize: '0.75rem' }}>
                    {this.state.errorInfo.componentStack}
                  </Typography>
                </Box>
              )}
              <Stack direction="row" spacing={2}>
                <Button variant="contained" startIcon={<RefreshIcon />} onClick={this.handleReset}>
                  Reintentar
                </Button>
                <Button variant="outlined" onClick={() => window.location.reload()}>
                  Recargar página
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Box>
      )
    }

    return this.props.children
  }
}
