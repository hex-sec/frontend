import { Box, Typography } from '@mui/material'
import { AnalyticsSection } from './analytics'
import { useTranslate } from '../../i18n/useTranslate'
import { useI18nStore } from '@store/i18n.store'
import { useSiteBackNavigation } from '@app/layout/useSiteBackNavigation'

export default function AnalyticsPage() {
  const { t } = useTranslate()
  const language = useI18nStore((s) => s.language)
  const { activeSite, slug: derivedSlug } = useSiteBackNavigation()
  const siteName = activeSite?.name ?? derivedSlug ?? null
  const isSiteContext = Boolean(siteName)

  const pageTitle = t('admin.analytics.pageTitle', { lng: language, defaultValue: 'Analytics' })
  const pageDescription = isSiteContext
    ? t('admin.analytics.pageDescriptionSite', {
        lng: language,
        defaultValue: 'Analytics and insights for {siteName}',
        siteName,
      })
    : t('admin.analytics.pageDescription', {
        lng: language,
        defaultValue: 'Portfolio-wide analytics and operational insights',
      })

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          {pageTitle}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {pageDescription}
        </Typography>
      </Box>

      <AnalyticsSection />
    </Box>
  )
}
