import { Link as RouterLink } from 'react-router-dom'
import { Container, Box, Typography, Button, Grid, Card, CardContent, Stack } from '@mui/material'

export default function LandingPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          HEX Portal
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 720, mx: 'auto' }}>
          Secure visitor and access management for residential communities and gated facilities.
          Fast setup, role-based controls, and audit-ready logs — built for operators and residents.
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
          <Button component={RouterLink} to="/auth/login" variant="contained" size="large">
            Get started
          </Button>
          <Button component={RouterLink} to="/auth/register" variant="outlined" size="large">
            Create an account
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={2} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6">Visitor Kiosk</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Self-service check-in for visitors with plate recognition and QR codes to speed
                entry.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6">Role-based Access</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Granular roles and gates for guards, admins and residents. Assign permissions in
                seconds.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6">Live Dashboard</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Real-time KPIs, recent activity and quick actions for incident response and audits.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}
