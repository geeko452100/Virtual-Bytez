const AUTH_ERROR_MESSAGES = {
  'Invalid login credentials': 'Email or password is incorrect.',
  'Email not confirmed': 'Confirm your email before signing in. Check your inbox for the confirmation link.',
  'User already registered': 'An account with this email already exists. Sign in instead.',
  'Signup requires a valid password': 'Password must be at least 6 characters.',
  'Password should be at least 6 characters': 'Password must be at least 6 characters.',
  'Unable to validate email address: invalid format': 'Enter a valid email address.',
  'Email rate limit exceeded': 'Too many attempts. Wait a few minutes and try again.',
  'For security purposes, you can only request this once every 60 seconds':
    'Too many attempts. Wait a minute and try again.',
}

export function formatAuthError(error) {
  if (!error) return null
  const message = typeof error === 'string' ? error : error.message
  if (!message) return 'Something went wrong. Please try again.'
  return AUTH_ERROR_MESSAGES[message] ?? message
}

export function normalizeAuthInput(value) {
  return typeof value === 'string' ? value.trim() : value
}

export function isDuplicateSignup(data) {
  return Boolean(data?.user) && (data.user.identities?.length ?? 0) === 0
}
