import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Stack,
  useMediaQuery,
  ToggleButton,
  ToggleButtonGroup,
  Skeleton,
  Fade,
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import WarningIcon from '@mui/icons-material/Warning'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import PieChartIcon from '@mui/icons-material/PieChart'
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart'
import { LineChart } from '@mui/x-charts/LineChart'
import { useTranslate } from '../../../i18n/useTranslate'
import { useI18nStore } from '@store/i18n.store'
import { useAnalyticsOverview } from './analytics.api'
import { AnalyticsFilterBar } from './AnalyticsFilterBar'
import type {
  AnalyticsParams,
  AccessFlowDTO,
  FinanceARDTO,
  VisitsFunnelDTO,
  IncidentsDTO,
} from './analytics.types'
import { alpha, useTheme } from '@mui/material/styles'

interface ChartDatum {
  id: string
  label: string
  value: number
  color: string
}

const getDefaultParams = (): AnalyticsParams => {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 30)
  return {
    date_from: from.toISOString(),
    date_to: to.toISOString(),
    granularity: 'auto',
    site_scope: 'current',
  }
}

// Access Flow - Stats with Icons
function AccessFlowChart({ data }: { data: AccessFlowDTO }) {
  const { t } = useTranslate()
  const language = useI18nStore((s) => s.language)
  const theme = useTheme()
  const isTabletAndUp = useMediaQuery(theme.breakpoints.up('md'))
  const entries = data.buckets.filter((b) => b.series === 'entries')
  const exits = data.buckets.filter((b) => b.series === 'exits')
  const totalEntries = entries.reduce((sum: number, e) => sum + e.value, 0)
  const totalExits = exits.reduce((sum: number, e) => sum + e.value, 0)
  const avgEntries = totalEntries / (entries.length || 1)
  const avgExits = totalExits / (exits.length || 1)
  const maxValue = Math.max(...entries.map((e) => e.value), ...exits.map((e) => e.value), 1)
  const entryValues = entries.map((e) => e.value)
  const exitValues = exits.map((e) => e.value)
  const labels = entries.map((e) =>
    new Date(e.ts).toLocaleDateString('es', { month: 'short', day: 'numeric' }),
  )

  return (
    <Stack spacing={2} sx={{ py: 1, minHeight: 300 }}>
      <Stack direction="row" spacing={2}>
        <Box
          sx={{
            flex: 1,
            textAlign: 'center',
            p: 2,
            bgcolor: alpha(theme.palette.success.main, 0.1),
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" fontWeight={700} color="success.main">
            {totalEntries}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('admin.analytics.accessFlow.totalEntries', {
              lng: language,
              defaultValue: 'Total Entradas',
            })}
          </Typography>
        </Box>
        <Box
          sx={{
            flex: 1,
            textAlign: 'center',
            p: 2,
            bgcolor: alpha(theme.palette.error.main, 0.1),
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" fontWeight={700} color="error.main">
            {totalExits}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('admin.analytics.accessFlow.totalExits', {
              lng: language,
              defaultValue: 'Total Salidas',
            })}
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" spacing={2}>
        <Box sx={{ flex: 1, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('admin.analytics.accessFlow.avgEntries', {
              lng: language,
              defaultValue: 'Promedio Entradas/Día',
            })}
          </Typography>
          <Typography variant="h5" fontWeight={600} color="success.main">
            {Math.round(avgEntries)}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('admin.analytics.accessFlow.avgExits', {
              lng: language,
              defaultValue: 'Promedio Salidas/Día',
            })}
          </Typography>
          <Typography variant="h5" fontWeight={600} color="error.main">
            {Math.round(avgExits)}
          </Typography>
        </Box>
      </Stack>

      {isTabletAndUp && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            gutterBottom
            display="block"
            sx={{ mb: 1.5 }}
          >
            {t('admin.analytics.accessFlow.trend', {
              lng: language,
              defaultValue: 'Tendencia (Últimos 7 días)',
            })}
          </Typography>
          <Box sx={{ height: 120, display: 'flex', alignItems: 'flex-end', gap: 1.5, px: 1 }}>
            {entryValues.slice(-7).map((value: number, i: number) => (
              <Box
                key={i}
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <Stack
                  direction="column"
                  spacing={0.5}
                  sx={{ width: '100%', alignItems: 'center' }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: Math.max((value / maxValue) * 80, 4),
                      bgcolor: theme.palette.success.main,
                      borderRadius: '4px 4px 0 0',
                    }}
                  />
                  <Box
                    sx={{
                      width: '100%',
                      height: Math.max((exitValues.slice(-7)[i] / maxValue) * 80, 4),
                      bgcolor: theme.palette.error.main,
                      borderRadius: '0 0 4px 4px',
                    }}
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  {labels.slice(-7)[i]}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Stack>
  )
}

function FinanceChart({ data }: { data: FinanceARDTO }) {
  const { t } = useTranslate()
  const language = useI18nStore((s) => s.language)
  const theme = useTheme()
  const isTabletAndUp = useMediaQuery(theme.breakpoints.up('md'))
  const totalRevenue = data.bars.reduce((sum: number, val: number) => sum + val, 0)
  const totalDelinquency = data.line.reduce((sum: number, val: number) => sum + val, 0)
  const delinquentRate = ((totalDelinquency / totalRevenue) * 100).toFixed(1)
  const maxBarValue = Math.max(...data.bars, 1)
  const revenueData = data.bars.slice(-6)
  const delinquencyData = data.line.slice(-6)

  return (
    <Stack spacing={2} sx={{ py: 1, minHeight: 300 }}>
      <Box
        sx={{
          textAlign: 'center',
          p: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {t('admin.analytics.finance.totalRevenue', {
            lng: language,
            defaultValue: 'Ingresos Total',
          })}
        </Typography>
        <Typography variant="h3" fontWeight={700} color="primary.main">
          ${(totalRevenue / 1000).toFixed(0)}k
        </Typography>
      </Box>
      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Tasa de Morosidad
          </Typography>
          <Typography
            variant="h6"
            fontWeight={600}
            color={parseFloat(delinquentRate) > 5 ? 'error.main' : 'success.main'}
          >
            {delinquentRate}%
          </Typography>
        </Stack>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: 8,
            bgcolor: 'divider',
            borderRadius: 4,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: `${delinquentRate}%`,
              height: '100%',
              bgcolor: parseFloat(delinquentRate) > 5 ? 'error.main' : 'warning.main',
              borderRadius: 4,
            }}
          />
        </Box>
      </Box>

      {isTabletAndUp && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            gutterBottom
            display="block"
            sx={{ mb: 1.5 }}
          >
            {t('admin.analytics.finance.history', {
              lng: language,
              defaultValue: 'Historial (Últimos 6 meses)',
            })}
          </Typography>
          <Box sx={{ height: 120, display: 'flex', alignItems: 'flex-end', gap: 1.5, px: 1 }}>
            {revenueData.map((value: number, i: number) => (
              <Box
                key={i}
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: Math.max((value / maxBarValue) * 80, 4),
                    bgcolor: theme.palette.primary.main,
                    borderRadius: 1,
                  }}
                />
                <Box
                  sx={{
                    width: '100%',
                    height: Math.max((delinquencyData[i] / maxBarValue) * 80, 4),
                    bgcolor: theme.palette.error.main,
                    borderRadius: 1,
                    mt: 0.5,
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  M{i + 1}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Stack>
  )
}

function VisitsMetricsChart({ data }: { data: VisitsFunnelDTO }) {
  const { t } = useTranslate()
  const language = useI18nStore((s) => s.language)
  const theme = useTheme()
  const isTabletAndUp = useMediaQuery(theme.breakpoints.up('md'))
  const [scheduled, admitted, completed] = data.steps

  // Calculate today's metrics
  const expectedToday = scheduled.value
  const entered = admitted.value
  const gone = completed.value

  // Calculate percentages for progress bars
  const enteredRate = ((entered / expectedToday) * 100).toFixed(1)
  const goneRate = ((gone / expectedToday) * 100).toFixed(1)

  // Create realistic daily progression data over 7 days
  const xAxisData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Simulate realistic visit progression over a week
  // Always maintain: Expected >= Entered >= Gone at each point
  const baseExpected = expectedToday
  const baseEntered = entered
  const baseGone = gone

  const expectedData = [
    baseExpected * 1.0,
    baseExpected * 1.0,
    baseExpected * 1.0,
    baseExpected * 1.0,
    baseExpected * 1.0,
    baseExpected * 1.0,
    baseExpected * 1.0,
  ]

  const enteredData = [
    baseEntered * 0.1,
    baseEntered * 0.3,
    baseEntered * 0.5,
    baseEntered * 0.7,
    baseEntered * 0.85,
    baseEntered * 0.95,
    baseEntered * 1.0,
  ]

  const goneData = [
    0,
    baseGone * 0.1,
    baseGone * 0.2,
    baseGone * 0.4,
    baseGone * 0.6,
    baseGone * 0.8,
    baseGone * 1.0,
  ]

  return (
    <Stack spacing={2} sx={{ py: 1, minHeight: 300 }}>
      {/* Three main metric cards */}
      <Stack direction="row" spacing={1.5}>
        <Box
          sx={{
            flex: 1,
            textAlign: 'center',
            p: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" fontWeight={700} color="primary.main">
            {expectedToday}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            {t('admin.analytics.visitsMetrics.expectedToday', {
              lng: language,
              defaultValue: 'Expected Today',
            })}
          </Typography>
        </Box>
        <Box
          sx={{
            flex: 1,
            textAlign: 'center',
            p: 2,
            bgcolor: alpha(theme.palette.success.main, 0.1),
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" fontWeight={700} color="success.main">
            {entered}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            {t('admin.analytics.visitsMetrics.entered', { lng: language, defaultValue: 'Entered' })}
          </Typography>
        </Box>
        <Box
          sx={{
            flex: 1,
            textAlign: 'center',
            p: 2,
            bgcolor: alpha(theme.palette.info.main, 0.1),
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" fontWeight={700} color="info.main">
            {gone}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            {t('admin.analytics.visitsMetrics.gone', { lng: language, defaultValue: 'Gone' })}
          </Typography>
        </Box>
      </Stack>

      {/* Progress indicators */}
      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              {t('admin.analytics.visitsMetrics.entryRate', {
                lng: language,
                defaultValue: 'Entry Rate: {rate}%',
                rate: enteredRate,
              })}
            </Typography>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: 6,
                bgcolor: 'divider',
                borderRadius: 3,
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: `${enteredRate}%`,
                  height: '100%',
                  bgcolor: 'success.main',
                  borderRadius: 3,
                }}
              />
            </Box>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              {t('admin.analytics.visitsMetrics.exitRate', {
                lng: language,
                defaultValue: 'Exit Rate: {rate}%',
                rate: goneRate,
              })}
            </Typography>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: 6,
                bgcolor: 'divider',
                borderRadius: 3,
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: `${goneRate}%`,
                  height: '100%',
                  bgcolor: 'info.main',
                  borderRadius: 3,
                }}
              />
            </Box>
          </Box>
        </Stack>
      </Box>

      {/* Visit Types Subcard */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'background.default',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <PieChartIcon fontSize="small" color="secondary" />
          <Typography variant="subtitle2" fontWeight={600}>
            {t('admin.analytics.visitTypes.title', { lng: language, defaultValue: 'Visit Types' })}
          </Typography>
        </Stack>
        <AnimatedVisitTypesChart />
      </Box>

      {isTabletAndUp && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            gutterBottom
            display="block"
            sx={{ mb: 2 }}
          >
            {t('admin.analytics.visitsMetrics.weeklyTrend', {
              lng: language,
              defaultValue: 'Weekly Trend',
            })}
          </Typography>
          <LineChart
            series={[
              {
                data: expectedData,
                label: t('admin.analytics.visitsMetrics.expectedToday', {
                  lng: language,
                  defaultValue: 'Expected',
                }),
                area: true,
                stack: 'total',
                curve: 'catmullRom',
              },
              {
                data: enteredData,
                label: t('admin.analytics.visitsMetrics.entered', {
                  lng: language,
                  defaultValue: 'Entered',
                }),
                area: true,
                stack: 'total',
                curve: 'catmullRom',
              },
              {
                data: goneData,
                label: t('admin.analytics.visitsMetrics.gone', {
                  lng: language,
                  defaultValue: 'Gone',
                }),
                area: true,
                stack: 'total',
                curve: 'catmullRom',
              },
            ]}
            colors={[theme.palette.primary.main, theme.palette.success.main]}
            xAxis={[
              {
                data: xAxisData,
                scaleType: 'point',
              },
            ]}
            yAxis={[{ label: 'Visits' }]}
            grid={{ horizontal: true }}
            height={200}
            sx={{
              '& .MuiChartsGrid-line': {
                stroke: theme.palette.divider,
                strokeWidth: 1,
              },
            }}
            slotProps={{
              legend: {
                position: { vertical: 'top', horizontal: 'center' },
              },
            }}
          />
        </Box>
      )}
    </Stack>
  )
}

function AnimatedVisitTypesChart() {
  const { t } = useTranslate()
  const language = useI18nStore((s) => s.language)
  const theme = useTheme()
  const isTabletAndUp = useMediaQuery(theme.breakpoints.up('md'))
  const [animatedData, setAnimatedData] = useState<
    Array<{ id: string; label: string; value: number; color: string }>
  >([])
  const [currentRadius, setCurrentRadius] = useState(20)

  // Full data for visit types
  const visitTypes = [
    {
      id: 'business',
      label: t('admin.analytics.visitTypes.business', { lng: language, defaultValue: 'Business' }),
      value: 45,
      color: theme.palette.primary.main,
    },
    {
      id: 'personal',
      label: t('admin.analytics.visitTypes.personal', { lng: language, defaultValue: 'Personal' }),
      value: 35,
      color: theme.palette.success.main,
    },
    {
      id: 'delivery',
      label: t('admin.analytics.visitTypes.delivery', { lng: language, defaultValue: 'Delivery' }),
      value: 12,
      color: theme.palette.warning.main,
    },
    {
      id: 'maintenance',
      label: t('admin.analytics.visitTypes.maintenance', {
        lng: language,
        defaultValue: 'Maintenance',
      }),
      value: 8,
      color: theme.palette.info.main,
    },
  ]

  const total = visitTypes.reduce((sum, type) => sum + type.value, 0)

  // Animate data loading one by one with radius growth
  useEffect(() => {
    const timeoutIds: NodeJS.Timeout[] = []

    // Reset animation
    setAnimatedData([])
    setCurrentRadius(20)

    visitTypes.forEach((type, index) => {
      const timeoutId = setTimeout(() => {
        setAnimatedData((prev) => [...prev, type])
        // Grow radius with each new data point
        setCurrentRadius((prev) => Math.min(prev + 20, 100))
      }, index * 400) // 400ms delay between each data point

      timeoutIds.push(timeoutId)
    })

    return () => {
      timeoutIds.forEach((id) => clearTimeout(id))
    }
  }, [theme]) // Re-run when theme changes

  return (
    <Stack spacing={2} sx={{ py: 1, minHeight: 250 }}>
      {/* Mobile/Tablet view - show summary cards */}
      {!isTabletAndUp ? (
        <Stack spacing={1.5}>
          {animatedData.map((type, index) => {
            const percentage = ((type.value / total) * 100).toFixed(0)
            return (
              <Box
                key={type.id}
                sx={{
                  p: 1.5,
                  bgcolor: 'background.default',
                  borderRadius: 2,
                  transform: 'translateY(10px)',
                  opacity: 0,
                  animation: `slideUp 0.3s ease-out ${index * 0.1}s forwards`,
                  '@keyframes slideUp': {
                    to: {
                      transform: 'translateY(0)',
                      opacity: 1,
                    },
                  },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" fontWeight={500} sx={{ fontSize: '0.7rem' }}>
                    {type.label}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Typography variant="body2" fontWeight={600} color={type.color}>
                      {type.value}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: '0.65rem' }}
                    >
                      ({percentage}%)
                    </Typography>
                  </Stack>
                </Stack>
                <Box
                  sx={{
                    mt: 0.5,
                    position: 'relative',
                    width: '100%',
                    height: 3,
                    bgcolor: 'divider',
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: `${percentage}%`,
                      height: '100%',
                      bgcolor: type.color,
                      borderRadius: 2,
                      transform: 'scaleX(0)',
                      transformOrigin: 'left',
                      animation: `scaleX 0.8s ease-out ${index * 0.2 + 0.3}s forwards`,
                      '@keyframes scaleX': {
                        to: {
                          transform: 'scaleX(1)',
                        },
                      },
                    }}
                  />
                </Box>
              </Box>
            )
          })}
        </Stack>
      ) : (
        /* Desktop view - show animated pie chart */
        <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {animatedData.length > 0 && (
            <PieChart
              series={[
                {
                  data: animatedData,
                  innerRadius: 25,
                  outerRadius: currentRadius,
                  paddingAngle: 2,
                  cornerRadius: 3,
                  valueFormatter: ({ value }) => {
                    const percentage = ((value / total) * 100).toFixed(0)
                    return `${value} (${percentage}%)`
                  },
                  highlightScope: { fade: 'global', highlight: 'item' },
                },
              ]}
              width={260}
              height={220}
              skipAnimation={false}
              slotProps={{
                legend: {
                  position: { vertical: 'middle', horizontal: 'end' },
                },
              }}
              sx={{
                '& .MuiPieChart-root': {
                  transition: 'all 0.3s ease-in-out',
                },
              }}
            />
          )}
        </Box>
      )}
    </Stack>
  )
}

function IncidentsChart({ data }: { data: IncidentsDTO }) {
  const { t } = useTranslate()
  const language = useI18nStore((s) => s.language)
  const theme = useTheme()
  const isTabletAndUp = useMediaQuery(theme.breakpoints.up('md'))
  const [view, setView] = useState<'categories' | 'breakdown'>('categories')

  const totalByCategory = data.categories.map((cat: string, i: number) => ({
    name: cat,
    total: data.series.reduce((sum: number, s) => sum + s.data[i], 0),
  }))
  const grandTotal = totalByCategory.reduce((sum: number, item) => sum + item.total, 0)

  // Define colors for each category
  const categoryColors = [
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.success.main,
    theme.palette.primary.main,
  ]

  // Get unique colors for series
  const seriesColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.info.main,
    theme.palette.success.main,
    theme.palette.error.main,
  ]

  // Transform data for nested donut chart
  const categoryData: ChartDatum[] = totalByCategory.map((item, i) => ({
    id: item.name,
    label: item.name,
    value: item.total,
    color: categoryColors[i % categoryColors.length],
  }))

  // Create series total data (grouped by series name)
  const seriesTotal = data.series.map((series) => ({
    name: series.name,
    total: series.data.reduce((sum, val) => sum + val, 0),
  }))
  const seriesData: ChartDatum[] = seriesTotal.map((item, i) => ({
    id: item.name,
    label: item.name,
    value: item.total,
    color: seriesColors[i % seriesColors.length],
  }))

  // Detailed breakdown for categories view: inner ring shows breakdown by series
  // Order data to match the outer ring's category order
  // Make each label unique to avoid duplicates in legend
  const categoryBreakdown: ChartDatum[] = data.categories.flatMap((cat, catIndex) => {
    return data.series
      .map((series, seriesIndex) => {
        const value = series.data[catIndex]
        if (value === 0) return null

        // Create unique color for each series
        const colorIndex = seriesIndex % seriesColors.length
        return {
          id: `${cat}-${series.name}`,
          label: `${cat}: ${series.name}`, // Make label unique with both dimensions
          value,
          color: alpha(seriesColors[colorIndex], 0.6),
        }
      })
      .filter((item): item is ChartDatum => item !== null)
  })

  // Detailed breakdown for series view: inner ring shows breakdown by category
  // Order data to match the outer ring's series order
  // Make each label unique to avoid duplicates in legend
  const seriesBreakdown: ChartDatum[] = data.series.flatMap((series) => {
    return data.categories
      .map((cat, catIndex) => {
        const value = series.data[catIndex]
        if (value === 0) return null

        // Create unique color for each category
        const colorIndex = catIndex % categoryColors.length
        return {
          id: `${series.name}-${cat}`,
          label: `${series.name}: ${cat}`, // Make label unique with both dimensions
          value,
          color: alpha(categoryColors[colorIndex], 0.6),
        }
      })
      .filter((item): item is ChartDatum => item !== null)
  })

  const handleViewChange = (event: React.MouseEvent<HTMLElement>, newView: typeof view | null) => {
    if (newView !== null) {
      setView(newView)
    }
  }

  return (
    <Stack spacing={2} sx={{ py: 1, minHeight: 300 }}>
      {/* Full Width Layout with Chart and Summary */}
      {isTabletAndUp && (
        <Box>
          {/* Title */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            {t('admin.analytics.incidents.title', {
              lng: language,
              defaultValue: 'Incidentes por Categoría',
            })}
          </Typography>

          {/* Full Width Row: Summary Cards + Chart */}
          <Grid container spacing={3} sx={{ alignItems: 'center' }}>
            {/* Left: Summary Cards */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Stack spacing={2}>
                <Box
                  sx={{
                    p: 2.5,
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    borderRadius: 2,
                    borderLeft: `4px solid ${theme.palette.error.main}`,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('admin.analytics.incidents.total', {
                      lng: language,
                      defaultValue: 'Total Incidentes',
                    })}
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="error.main">
                    {grandTotal}
                  </Typography>
                </Box>

                {totalByCategory.map((item, i: number) => {
                  const percentage = ((item.total / grandTotal) * 100).toFixed(1)
                  return (
                    <Box
                      key={item.name}
                      sx={{
                        p: 2,
                        bgcolor: 'background.default',
                        borderRadius: 2,
                        borderLeft: `4px solid ${categoryColors[i] || theme.palette.primary.main}`,
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="body2" fontWeight={600} gutterBottom>
                            {item.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t('admin.analytics.incidents.percentageOfTotal', {
                              lng: language,
                              defaultValue: '{percentage}% del total',
                              percentage,
                            })}
                          </Typography>
                        </Box>
                        <Typography
                          variant="h5"
                          fontWeight={700}
                          color={categoryColors[i] || theme.palette.primary.main}
                        >
                          {item.total}
                        </Typography>
                      </Stack>
                      <Box
                        sx={{
                          mt: 1.5,
                          position: 'relative',
                          width: '100%',
                          height: 4,
                          bgcolor: 'divider',
                          borderRadius: 2,
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: `${percentage}%`,
                            height: '100%',
                            bgcolor: categoryColors[i] || theme.palette.primary.main,
                            borderRadius: 2,
                          }}
                        />
                      </Box>
                    </Box>
                  )
                })}
              </Stack>
            </Grid>

            {/* Right: Chart */}
            <Grid size={{ xs: 12, lg: 8 }}>
              {/* Toggle Buttons */}
              <Box sx={{ pt: 2 }}>
                <ToggleButtonGroup
                  color="primary"
                  size="small"
                  value={view}
                  exclusive
                  onChange={handleViewChange}
                  fullWidth
                >
                  <ToggleButton value="categories">
                    {t('admin.analytics.incidents.byCategory', {
                      lng: language,
                      defaultValue: 'Por Categoría',
                    })}
                  </ToggleButton>
                  <ToggleButton value="breakdown">
                    {t('admin.analytics.incidents.bySeverity', {
                      lng: language,
                      defaultValue: 'Por Severidad',
                    })}
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <Box sx={{ width: '100%', height: 420 }}>
                <PieChart
                  series={[
                    {
                      innerRadius: 70,
                      outerRadius: 120,
                      data: view === 'categories' ? categoryData : seriesData,
                      arcLabel: (item) => {
                        const label = (item as ChartDatum).label
                        const value = (item as ChartDatum).value
                        const percentage = ((value / grandTotal) * 100).toFixed(0)
                        return `${label} (${percentage}%)`
                      },
                      arcLabelRadius: 150,
                      arcLabelMinAngle: 15,
                      valueFormatter: ({ value }) => {
                        const percentage = ((value / grandTotal) * 100).toFixed(0)
                        return `${value} (${percentage}%)`
                      },
                      highlightScope: { fade: 'global', highlight: 'item' },
                      highlighted: { additionalRadius: 5 },
                      cornerRadius: 5,
                    },
                    {
                      innerRadius: 0,
                      outerRadius: 60,
                      data: view === 'categories' ? categoryBreakdown : seriesBreakdown,
                      arcLabel: (item) => {
                        const val = (item as ChartDatum).value
                        return val > 0 ? `${val}` : ''
                      },
                      arcLabelRadius: 80,
                      arcLabelMinAngle: 10,
                      valueFormatter: ({ value }) => value.toString(),
                      highlightScope: { fade: 'global', highlight: 'item' },
                      highlighted: { additionalRadius: 2 },
                      cornerRadius: 3,
                      paddingAngle: 2,
                    },
                  ]}
                  hideLegend
                  sx={{
                    [`& .${pieArcLabelClasses.root}`]: {
                      fontSize: '10px',
                      fontWeight: 600,
                    },
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Mobile view: Simple list */}
      {!isTabletAndUp && (
        <Stack spacing={1}>
          {totalByCategory.map((item, i: number) => {
            const percentage = ((item.total / grandTotal) * 100).toFixed(1)
            return (
              <Box key={item.name} sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 0.5 }}
                >
                  <Typography variant="body2" fontWeight={500}>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {item.total} ({percentage}%)
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: 6,
                    bgcolor: 'divider',
                    borderRadius: 3,
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: `${percentage}%`,
                      height: '100%',
                      bgcolor: categoryColors[i] || theme.palette.primary.main,
                      borderRadius: 3,
                    }}
                  />
                </Box>
              </Box>
            )
          })}
        </Stack>
      )}
    </Stack>
  )
}

export function AnalyticsSection() {
  const { t } = useTranslate()
  const language = useI18nStore((s) => s.language)
  const [params, setParams] = useState<AnalyticsParams>(getDefaultParams())
  const { data, isLoading, error } = useAnalyticsOverview(params)

  useEffect(() => {
    const saved = localStorage.getItem('analytics_filters')
    if (saved) {
      try {
        setParams(JSON.parse(saved))
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('analytics_filters', JSON.stringify(params))
  }, [params])

  if (error) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">
          {t('admin.analytics.error', {
            lng: language,
            defaultValue: 'Error al cargar los datos de analítica',
          })}
        </Typography>
      </Paper>
    )
  }

  return (
    <Box sx={{ width: '100%', position: 'relative', minHeight: 600 }}>
      <AnalyticsFilterBar value={params} onChange={setParams} />

      {isLoading && (
        <Fade in={isLoading} timeout={{ enter: 0, exit: 300 }} unmountOnExit>
          <Box
            sx={{ position: 'absolute', inset: 0, zIndex: 1, bgcolor: 'background.paper', pt: 3 }}
          >
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2}>
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={80}
                        sx={{ borderRadius: 2 }}
                      />
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={80}
                        sx={{ borderRadius: 2 }}
                      />
                    </Stack>
                    <Stack direction="row" spacing={2}>
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={80}
                        sx={{ borderRadius: 2 }}
                      />
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={80}
                        sx={{ borderRadius: 2 }}
                      />
                    </Stack>
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={120}
                      sx={{ borderRadius: 2 }}
                    />
                  </Stack>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
                  <Stack spacing={2}>
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={120}
                      sx={{ borderRadius: 2 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={80}
                      sx={{ borderRadius: 2 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={120}
                      sx={{ borderRadius: 2 }}
                    />
                  </Stack>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1.5}>
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={80}
                        sx={{ borderRadius: 2 }}
                      />
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={80}
                        sx={{ borderRadius: 2 }}
                      />
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={80}
                        sx={{ borderRadius: 2 }}
                      />
                    </Stack>
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={100}
                      sx={{ borderRadius: 2 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={80}
                      sx={{ borderRadius: 2 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={200}
                      sx={{ borderRadius: 2 }}
                    />
                  </Stack>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 8 }}>
                <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={420}
                    sx={{ borderRadius: 2 }}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      )}

      {data && !isLoading && (
        <Fade in={!isLoading} timeout={{ enter: 400, exit: 0 }} mountOnEnter unmountOnExit>
          <Box
            sx={{
              position: isLoading ? 'absolute' : 'static',
              top: 0,
              left: 0,
              right: 0,
              opacity: isLoading ? 0 : 1,
            }}
          >
            <Grid container spacing={3}>
              {data.accessFlow && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper
                    sx={{
                      p: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <TrendingUpIcon fontSize="small" color="primary" />
                      <Typography variant="h6" fontWeight={600}>
                        {t('admin.analytics.accessFlow.title', {
                          lng: language,
                          defaultValue: 'Access Flow',
                        })}
                      </Typography>
                    </Stack>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <AccessFlowChart data={data.accessFlow} />
                    </Box>
                  </Paper>
                </Grid>
              )}
              {data.financeAR && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper
                    sx={{
                      p: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <AttachMoneyIcon fontSize="small" color="success" />
                      <Typography variant="h6" fontWeight={600}>
                        {t('admin.analytics.finance.title', {
                          lng: language,
                          defaultValue: 'Monthly Collections',
                        })}
                      </Typography>
                    </Stack>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <FinanceChart data={data.financeAR} />
                    </Box>
                  </Paper>
                </Grid>
              )}
              {data.visitsFunnel && (
                <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                  <Paper
                    sx={{
                      p: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <CompareArrowsIcon fontSize="small" color="primary" />
                      <Typography variant="h6" fontWeight={600}>
                        {t('admin.analytics.visitsMetrics.title', {
                          lng: language,
                          defaultValue: 'Visits Metrics',
                        })}
                      </Typography>
                    </Stack>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <VisitsMetricsChart data={data.visitsFunnel} />
                    </Box>
                  </Paper>
                </Grid>
              )}
              {data.incidents && (
                <Grid size={{ xs: 12, md: 6, lg: 8 }}>
                  <Paper
                    sx={{
                      p: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <WarningIcon fontSize="small" color="error" />
                      <Typography variant="h6" fontWeight={600}>
                        {t('admin.analytics.incidents.title', {
                          lng: language,
                          defaultValue: 'Incidents by Category',
                        })}
                      </Typography>
                    </Stack>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <IncidentsChart data={data.incidents} />
                    </Box>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
        </Fade>
      )}
    </Box>
  )
}
