import { Box } from '@mui/material'

interface LogoMarkProps {
  size?: number
}

export function LogoMark({ size = 36 }: LogoMarkProps) {
  return (
    <Box
      component="svg"
      viewBox="0 0 64 64"
      sx={{
        width: size,
        height: size,
        color: 'primary.main',
      }}
    >
      <polygon points="32 4 56 18 56 46 32 60 8 46 8 18" fill="currentColor" opacity={0.9} />
      <polygon points="32 16 44 23 44 41 32 48 20 41 20 23" fill="#ffffff" opacity={0.25} />
      <polygon points="32 24 38 28 38 36 32 40 26 36 26 28" fill="#ffffff" opacity={0.55} />
    </Box>
  )
}
