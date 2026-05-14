import { createContext, useContext, useState } from 'react'
import api from '../services/api'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lumen_user')) } catch { return null }
  })

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    const { token, role, user: u } = res.data
    // Merge role into the user object so Guards and pages can read user.role
    const profile = { ...u, role }
    localStorage.setItem('lumen_token', token)
    localStorage.setItem('lumen_user', JSON.stringify(profile))
    setUser(profile)
    return profile
  }

  function logout() {
    localStorage.removeItem('lumen_token')
    localStorage.removeItem('lumen_user')
    setUser(null)
  }

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
