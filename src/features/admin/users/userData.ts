export type RoleKey = 'admin' | 'guard' | 'resident'

export type UserStatus = 'active' | 'pending' | 'suspended'

export type UserRecord = {
  id: string
  name: string
  email: string
  role: RoleKey
  status: UserStatus
  avatar?: string
  sites: { name: string; slug: string }[]
  lastActive: string
  phone?: string
  position?: string
  joinedOn?: string
  address?: string
  notes?: string
}

import usersSeed from '../../../mocks/users.json'

export const USERS: UserRecord[] = (usersSeed as Array<Record<string, unknown>>).map((u) => ({
  id: String(u.id),
  name: String(u.name),
  email: String(u.email),
  role: u.role as UserRecord['role'],
  status: u.status as UserRecord['status'],
  avatar: u.avatar as string | undefined,
  sites:
    (u.sites as Array<Record<string, unknown>>)?.map((s) => ({
      name: String(s.name),
      slug: String(s.slug),
    })) || [],
  lastActive: String(u.lastActive),
  phone: u.phone as string | undefined,
  position: u.position as string | undefined,
  joinedOn: u.joinedOn as string | undefined,
  address: u.address as string | undefined,
  notes: u.notes as string | undefined,
}))

export type RoleFilter = 'all' | RoleKey

export type RoleViewMeta = {
  title: string
  description: string
  inviteCta: string
  emptyTitle: string
  emptyDescription: string
  siteHint: (siteName: string) => string
}

export const ROLE_LABEL: Record<RoleKey, string> = {
  admin: 'Admin',
  guard: 'Guard',
  resident: 'Resident',
}

export const STATUS_COLOR: Record<UserStatus, 'success' | 'warning' | 'error'> = {
  active: 'success',
  pending: 'warning',
  suspended: 'error',
}

export const ROLE_VIEW_META: Record<RoleFilter, RoleViewMeta> = {
  all: {
    title: 'Users',
    description: 'View and manage admins, guards, and residents across your workspace.',
    inviteCta: 'Invite user',
    emptyTitle: 'No users found',
    emptyDescription: 'Adjust your filters or invite someone new to get started.',
    siteHint: (siteName) =>
      `Managing members scoped to ${siteName}. Removing access keeps their enterprise account but revokes permissions for this property.`,
  },
  admin: {
    title: 'Admins',
    description: 'Control administrator and staff permissions for this property.',
    inviteCta: 'Invite admin',
    emptyTitle: 'No admins assigned',
    emptyDescription: 'Invite site admins to help run daily operations.',
    siteHint: (siteName) =>
      `Showing admins with permissions for ${siteName}. Removing access keeps enterprise credentials but removes this site role.`,
  },
  guard: {
    title: 'Guards',
    description: 'Track guard staffing, shifts, and certifications for the gate team.',
    inviteCta: 'Add guard',
    emptyTitle: 'No guards assigned',
    emptyDescription: 'Invite your security team or sync from your staffing partner.',
    siteHint: (siteName) =>
      `Only guards assigned to ${siteName} appear here. Update shifts from this view to adjust coverage.`,
  },
  resident: {
    title: 'Residents',
    description: 'Directory of households and their portal adoption status.',
    inviteCta: 'Invite resident',
    emptyTitle: 'No residents yet',
    emptyDescription:
      'Invite households to activate their portal access and start using amenities.',
    siteHint: (siteName) =>
      `Only residents for ${siteName} are shown. Removing them keeps their login but removes portal access for this property.`,
  },
}

export const PATH_ROLE_SEGMENT_MAP: Record<string, RoleKey> = {
  admins: 'admin',
  guards: 'guard',
  residents: 'resident',
}

export function parseRoleFilter(value: string | null): RoleFilter {
  if (value === 'admin' || value === 'guard' || value === 'resident') {
    return value
  }
  return 'all'
}

export function findUserById(id: string): UserRecord | undefined {
  return USERS.find((user) => user.id === id)
}
