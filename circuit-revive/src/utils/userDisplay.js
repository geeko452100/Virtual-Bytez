export function getUserFullName(profile, user) {
  return profile?.full_name?.trim() || user?.user_metadata?.full_name?.trim() || ''
}

export function getUserGreeting(profile, user) {
  const fullName = getUserFullName(profile, user)
  if (fullName) return fullName
  return profile?.email ?? user?.email ?? 'there'
}
