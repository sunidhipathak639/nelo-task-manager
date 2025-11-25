export const setSession = (token) => {
  sessionStorage.setItem('token', token)
}

export const getSession = () => {
  return sessionStorage.getItem('token')
}

export const clearSession = () => {
  sessionStorage.removeItem('token')
}

