import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Box, IconButton, Toolbar } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import TopBar from './TopBar'
import { scrollWindowToTop } from './scrollToTop'

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const parts = location.pathname.split('/').filter(Boolean)
  const hasBackPath = parts.length > 0 // Only show back button if we're not at the root
  const backHref = parts.length > 1 ? '/' + parts.slice(0, parts.length - 1).join('/') : '/'

  useEffect(() => {
    scrollWindowToTop()
  }, [location.pathname, location.search])

  return (
    <Box>
      <TopBar />
      <Toolbar sx={{ minHeight: 64 }} />
      <Box sx={{ p: 2 }}>
        {/* Simple back button - only shown when there's a path to go back to */}
        {hasBackPath && (
          <Box sx={{ mb: 1 }}>
            <IconButton
              onClick={() => navigate(backHref)}
              aria-label="Go back"
              size="small"
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Box>
        )}

        <Box>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
