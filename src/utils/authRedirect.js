/** Where to send the user after login/register based on business linkage. */
export function getPostAuthPath(user) {
  const businessId = user?.businessId?._id || user?.businessId
  return businessId ? '/dashboard' : '/business/setup'
}
