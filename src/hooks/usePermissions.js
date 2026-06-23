// src/hooks/usePermissions.js — Phase 6A/6B
// The current user's roles + permissions for the active business, used to hide
// actions they aren't allowed to take. The server is the real enforcement; this
// is UX so people don't click buttons that would 403.
import { useQuery } from '@tanstack/react-query'
import teamService from '@/services/team.service'

export function usePermissions() {
  const { data } = useQuery({
    queryKey: ['my-access'],
    queryFn: () => teamService.me().then(r => r.data?.data || { permissions: [], roles: [] }),
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
  const permissions = data?.permissions || []
  const roles = data?.roles || []
  // While loading (no data yet) default to allow, so the UI never flickers actions
  // away from a legitimate user; the server still enforces.
  const loaded = !!data
  const can = (perm) => !loaded || permissions.includes('*') || permissions.includes(perm)
  return { can, permissions, roles, isOwner: roles.includes('owner'), loaded }
}
