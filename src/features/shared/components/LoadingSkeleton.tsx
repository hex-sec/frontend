import { Skeleton, Box, Stack } from '@mui/material'

interface LoadingSkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  count?: number
}

/**
 * Loading Skeleton Component
 * Shows placeholder skeletons while content is loading
 */
export function LoadingSkeleton({
  variant = 'rectangular',
  width,
  height,
  count = 1,
}: LoadingSkeletonProps) {
  return (
    <Stack spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} variant={variant} width={width} height={height} animation="wave" />
      ))}
    </Stack>
  )
}

/**
 * Table Row Skeleton
 * Skeleton for table rows
 */
export function TableRowSkeleton({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 2, p: 2 }}>
          <Skeleton variant="text" width="20%" />
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="text" width="25%" />
          <Skeleton variant="text" width="25%" />
        </Box>
      ))}
    </>
  )
}

/**
 * Card Skeleton
 * Skeleton for card components
 */
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <Stack spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Box key={index} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="rectangular" width="100%" height={120} sx={{ mt: 2 }} />
        </Box>
      ))}
    </Stack>
  )
}
