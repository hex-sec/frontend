import { useQuery } from '@tanstack/react-query'
import type { AnalyticsOverview, AnalyticsParams } from './analytics.types'

// Mock mode for development - always enabled for now
const MOCK_MODE = true

async function fetchAnalyticsOverview(params: AnalyticsParams): Promise<AnalyticsOverview> {
  // In real implementation, replace with actual API call
  // const res = await http.get<AnalyticsOverview>('/analytics/overview', { params })
  // return res.data

  // Mock data for development
  if (MOCK_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate network delay

    return {
      generated_at: new Date().toISOString(),
      params_echo: params,
      accessFlow: {
        buckets: [
          { ts: '2024-01-01', value: 1200, series: 'entries' },
          { ts: '2024-01-02', value: 1450, series: 'entries' },
          { ts: '2024-01-03', value: 1100, series: 'entries' },
          { ts: '2024-01-04', value: 1650, series: 'entries' },
          { ts: '2024-01-05', value: 1800, series: 'entries' },
          { ts: '2024-01-06', value: 1950, series: 'entries' },
          { ts: '2024-01-01', value: 800, series: 'exits' },
          { ts: '2024-01-02', value: 950, series: 'exits' },
          { ts: '2024-01-03', value: 750, series: 'exits' },
          { ts: '2024-01-04', value: 1000, series: 'exits' },
          { ts: '2024-01-05', value: 1200, series: 'exits' },
          { ts: '2024-01-06', value: 1350, series: 'exits' },
        ],
        total: 16100,
      },
      peaks: {
        hours: Array.from({ length: 24 }, (_, i) => i),
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        matrix: [
          [
            12, 15, 18, 22, 35, 45, 52, 58, 62, 58, 52, 48, 55, 62, 65, 58, 52, 45, 38, 28, 18, 12,
            8, 5,
          ],
          [
            14, 18, 20, 25, 38, 48, 55, 60, 64, 60, 55, 50, 58, 65, 68, 60, 55, 48, 40, 30, 20, 14,
            9, 6,
          ],
          [
            10, 12, 16, 20, 32, 42, 48, 55, 58, 55, 50, 45, 52, 58, 62, 55, 50, 42, 35, 25, 15, 10,
            7, 4,
          ],
          [
            16, 20, 22, 28, 40, 50, 58, 62, 66, 62, 58, 52, 60, 66, 70, 62, 58, 50, 42, 32, 22, 16,
            11, 7,
          ],
          [
            18, 22, 25, 30, 42, 52, 60, 65, 70, 65, 60, 55, 62, 70, 75, 65, 60, 52, 45, 35, 25, 18,
            12, 8,
          ],
          [
            8, 10, 12, 15, 20, 25, 28, 30, 32, 28, 25, 22, 28, 35, 38, 32, 28, 25, 20, 15, 10, 8, 5,
            3,
          ],
          [
            6, 8, 10, 12, 18, 22, 25, 28, 30, 25, 22, 18, 25, 30, 35, 28, 25, 22, 18, 12, 8, 6, 4,
            2,
          ],
        ],
      },
      visitsFunnel: {
        steps: [
          { name: 'Scheduled', value: 1200 },
          { name: 'Admitted', value: 950 },
          { name: 'Completed', value: 820 },
        ],
      },
      incidents: {
        categories: ['Gate Access', 'Noise', 'Maintenance', 'Other'],
        series: [
          { name: 'Critical', data: [12, 8, 15, 5] },
          { name: 'Medium', data: [35, 28, 42, 18] },
          { name: 'Low', data: [55, 42, 68, 32] },
        ],
      },
      financeAR: {
        periods: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        bars: [45000, 52000, 48000, 55000, 60000, 58000],
        line: [2500, 2100, 3200, 1800, 1400, 1600],
      },
      topPlates: {
        items: [
          { label: 'ABC-1234', value: 45 },
          { label: 'XYZ-5678', value: 38 },
          { label: 'DEF-9012', value: 32 },
          { label: 'GHI-3456', value: 28 },
          { label: 'JKL-7890', value: 22 },
        ],
        total: 165,
      },
    }
  }

  throw new Error('Analytics API endpoint not implemented')
}

export function useAnalyticsOverview(params: AnalyticsParams) {
  return useQuery<AnalyticsOverview>({
    queryKey: ['analytics_overview', params],
    queryFn: () => fetchAnalyticsOverview(params),
    staleTime: 60_000, // 1 min
    gcTime: 5 * 60_000, // 5 min
    refetchOnWindowFocus: false,
  })
}
