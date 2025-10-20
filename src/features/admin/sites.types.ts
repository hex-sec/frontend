export type SiteStatus = 'active' | 'trial' | 'suspended'
export type SitePlan = 'free' | 'basic' | 'pro' | 'enterprise'

export type Site = {
  id: string
  name: string
  slug: string
  plan?: SitePlan
  status: SiteStatus
  createdAt: string
  updatedAt: string
  themePrimary?: string
}

export type CreateSiteInput = {
  name: string
  slug: string
  plan?: SitePlan
}

export type UserRole = 'admin' | 'subadmin' | 'guard' | 'resident'

export type InviteInput = {
  email: string
  role: UserRole
}

export type UpdateSiteInput = Partial<Pick<Site, 'name' | 'plan' | 'status'>> & {
  themePrimary?: string
}
export type Member = { id: string; email: string; role: UserRole; createdAt: string }
