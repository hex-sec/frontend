import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { v4 as uuid } from 'uuid'
import type { CreateSiteInput, InviteInput, Site, UpdateSiteInput, Member } from './sites.types'
import sitesSeed from '../../mocks/sites.json'

const MOCK_API_DELAY_MS = 200

const SITES_QUERY_KEY = ['sites'] as const

function readSites(): Site[] {
  const raw = localStorage.getItem('mock.sites')
  if (!raw) {
    // Load default seed from mocks/sites.json compiled into the bundle
    try {
      const seed = sitesSeed as Array<Record<string, unknown>>
      return seed.map((s) => ({
        id: String(s.id),
        name: String(s.name),
        slug: String(s.slug),
        plan: (s.plan as Site['plan']) ?? undefined,
        status: (s.status as Site['status']) ?? 'active',
        createdAt: String(s.createdAt),
        updatedAt: String(s.updatedAt),
      }))
    } catch {
      return []
    }
  }
  try {
    return JSON.parse(raw) as Site[]
  } catch {
    return []
  }
}

function writeSites(sites: Site[]): void {
  localStorage.setItem('mock.sites', JSON.stringify(sites))
}

function seedIfEmpty() {
  const existing = readSites()
  if (existing.length > 0) return
  // When no data is present in localStorage, populate from mocks/sites.json and write to localStorage
  try {
    const seed = sitesSeed as Array<Record<string, unknown>>
    const now = new Date().toISOString()
    const mapped = seed.map((s) => ({
      id: String(s.id) || uuid(),
      name: String(s.name),
      slug: String(s.slug),
      plan: (s.plan as Site['plan']) ?? 'free',
      status: (s.status as Site['status']) ?? 'active',
      createdAt: String(s.createdAt) || now,
      updatedAt: String(s.updatedAt) || now,
    })) as Site[]
    writeSites(mapped)
    mapped.forEach((s, idx) => {
      const members = (seed[idx]?.members as Member[] | undefined) ?? []
      writeMembers(
        s.id,
        members.map((m) => ({ ...m })),
      )
    })
  } catch {
    // fallback: do nothing
  }
}

function readMembers(siteId: string): Member[] {
  const raw = localStorage.getItem(`mock.members.${siteId}`)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Member[]
  } catch {
    return []
  }
}
function writeMembers(siteId: string, members: Member[]) {
  localStorage.setItem(`mock.members.${siteId}`, JSON.stringify(members))
}

export function useSitesQuery() {
  return useQuery({
    queryKey: SITES_QUERY_KEY,
    queryFn: async () => {
      seedIfEmpty()
      return readSites()
    },
  })
}

export function useCreateSiteMutation() {
  const qc = useQueryClient()
  return useMutation<Site, unknown, CreateSiteInput>({
    mutationFn: async (input: CreateSiteInput) => {
      const now = new Date().toISOString()
      const sites = readSites()
      const site: Site = {
        id: uuid(),
        name: input.name,
        slug: input.slug,
        plan: input.plan ?? 'free',
        status: 'active',
        createdAt: now,
        updatedAt: now,
      }
      writeSites([site, ...sites])
      writeMembers(site.id, [])
      return site
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: SITES_QUERY_KEY })
    },
  })
}

export function useInviteMutation() {
  const qc = useQueryClient()
  return useMutation<boolean, unknown, { siteId: string } & InviteInput>({
    mutationFn: async (input: { siteId: string } & InviteInput) => {
      const members = readMembers(input.siteId)
      const now = new Date().toISOString()
      members.push({ id: uuid(), email: input.email, role: input.role, createdAt: now })
      writeMembers(input.siteId, members)
      await new Promise((r) => setTimeout(r, MOCK_API_DELAY_MS))
      return true
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: SITES_QUERY_KEY })
    },
  })
}

export function useSiteBySlugQuery(slug: string | undefined) {
  return useQuery({
    queryKey: [...SITES_QUERY_KEY, 'bySlug', slug],
    enabled: !!slug,
    queryFn: async () => {
      seedIfEmpty()
      const sites = readSites()
      return sites.find((s) => s.slug === slug) ?? null
    },
  })
}

export function useUpdateSiteMutation() {
  const qc = useQueryClient()
  return useMutation<Site, unknown, { id: string } & UpdateSiteInput>({
    mutationFn: async (input: { id: string } & UpdateSiteInput) => {
      const sites = readSites()
      const idx = sites.findIndex((s) => s.id === input.id)
      if (idx === -1) throw new Error('Site not found')
      const existing = sites[idx]
      const updated: Site = {
        ...existing,
        name: input.name ?? existing.name,
        plan: input.plan ?? existing.plan,
        status: input.status ?? existing.status,
        themePrimary: input.themePrimary ?? existing.themePrimary,
        updatedAt: new Date().toISOString(),
      }
      sites[idx] = updated
      writeSites(sites)
      return updated
    },
    onSuccess: (_data: Site, variables: { id: string } & UpdateSiteInput) => {
      void qc.invalidateQueries({ queryKey: SITES_QUERY_KEY })
      void qc.invalidateQueries({ queryKey: [...SITES_QUERY_KEY, 'bySlug'] })
      void qc.invalidateQueries({ queryKey: [...SITES_QUERY_KEY, 'members', variables.id] })
    },
  })
}

export function useMembersQuery(siteId: string | undefined) {
  return useQuery({
    queryKey: [...SITES_QUERY_KEY, 'members', siteId],
    enabled: !!siteId,
    queryFn: async () => (siteId ? readMembers(siteId) : []),
  })
}

export function useRemoveMemberMutation() {
  const qc = useQueryClient()
  return useMutation<boolean, unknown, { siteId: string; memberId: string }>({
    mutationFn: async (input: { siteId: string; memberId: string }) => {
      const members = readMembers(input.siteId).filter((m) => m.id !== input.memberId)
      writeMembers(input.siteId, members)
      return true
    },
    onSuccess: (data: boolean, variables: { siteId: string; memberId: string }) => {
      void qc.invalidateQueries({ queryKey: [...SITES_QUERY_KEY, 'members', variables.siteId] })
    },
  })
}
