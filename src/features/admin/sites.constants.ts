import type { SitePlan } from './sites.types'

export const PLAN_OPTIONS: SitePlan[] = ['free', 'basic', 'pro', 'enterprise']

export const PLAN_LABELS: Record<SitePlan, string> = {
  free: 'Free',
  basic: 'Basic',
  pro: 'Pro',
  enterprise: 'Enterprise',
}
