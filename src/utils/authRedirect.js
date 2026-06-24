/** Where to send the user after login/register. Admins go to the admin panel. */
export function getPostAuthPath(user) {
  if (user?.role === 'admin') return '/admin'
  const businessId = user?.businessId
  return businessId ? '/dashboard' : '/business/setup'
}
