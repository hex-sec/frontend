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

export const USERS: UserRecord[] = [
  {
    id: 'u1',
    name: 'Carla Jenkins',
    email: 'carla@vistaazul.com',
    role: 'admin',
    status: 'active',
    sites: [
      { name: 'Vista Azul', slug: 'vista-azul' },
      { name: 'Los Olivos', slug: 'los-olivos' },
    ],
    lastActive: '5m ago',
    phone: '+52 55 1234 5678',
    position: 'Regional Operations',
    joinedOn: 'Feb 12, 2022',
    notes: 'Leads onboarding for new sites and handles escalations.',
  },
  {
    id: 'u2',
    name: 'Miguel Serrano',
    email: 'miguel@vistaazul.com',
    role: 'guard',
    status: 'active',
    sites: [{ name: 'Vista Azul', slug: 'vista-azul' }],
    lastActive: 'On shift',
    phone: '+52 55 4321 9876',
    position: 'Day shift lead',
    joinedOn: 'Sep 5, 2021',
    notes: 'Certified in incident de-escalation. Prefers radio channel 3.',
  },
  {
    id: 'u3',
    name: 'Rhea Patel',
    email: 'rhea@losolivos.com',
    role: 'resident',
    status: 'pending',
    sites: [{ name: 'Los Olivos', slug: 'los-olivos' }],
    lastActive: 'Invited 2d ago',
    phone: '+1 (415) 555-0102',
    position: 'Homeowner',
    joinedOn: 'Pending activation',
    notes: 'Requested parking permits for two vehicles.',
  },
  {
    id: 'u4',
    name: 'Alex Mendez',
    email: 'alex@vistaazul.com',
    role: 'guard',
    status: 'suspended',
    sites: [{ name: 'Vista Azul', slug: 'vista-azul' }],
    lastActive: 'Suspended 3d ago',
    phone: '+52 55 9988 7766',
    position: 'Night shift',
    joinedOn: 'Jun 17, 2020',
    notes: 'Suspended pending badge audit. Needs supervisor review.',
  },
  {
    id: 'u5',
    name: 'Zoe Ramirez',
    email: 'zoe@skyview.com',
    role: 'admin',
    status: 'active',
    sites: [{ name: 'Los Olivos', slug: 'los-olivos' }],
    lastActive: '12h ago',
    phone: '+52 55 2233 4455',
    position: 'Finance liaison',
    joinedOn: 'Apr 8, 2023',
    notes: 'Coordinates billing notices and delinquency follow-ups.',
  },
]

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
