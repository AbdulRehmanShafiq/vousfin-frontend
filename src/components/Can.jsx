// src/components/Can.jsx — Phase 6A/6B
// Renders children only if the current user has the permission. Server still enforces.
//   <Can perm="transaction:create"><NewInvoiceButton/></Can>
import { usePermissions } from '@/hooks/usePermissions'

export default function Can({ perm, children, fallback = null }) {
  const { can } = usePermissions()
  return can(perm) ? children : fallback
}
