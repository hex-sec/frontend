import { Paper, Typography } from '@mui/material'

export default function UsersPage() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6">Users</Typography>
      <Typography sx={{ mt: 1 }}>
        Admins, subadmins, guards, residents; invitaciones (stub)
      </Typography>
    </Paper>
  )
}
