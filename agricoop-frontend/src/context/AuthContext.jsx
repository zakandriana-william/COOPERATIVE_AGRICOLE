import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Vérifier le token au démarrage
  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])

  // Connexion
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token, user } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    return user
  }

  // Inscription
  const register = async (nom, prenom, email, password) => {
    const res = await api.post('/auth/register', { nom, prenom, email, password })
    return res.data
  }

  // Déconnexion
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  // Vérifier le rôle
  const hasRole = (role) => user?.role === role
  const isAdmin = () => hasRole('administrateur')
  const isGestionnaire = () => hasRole('gestionnaire') || isAdmin()
  const isMembre = () => hasRole('membre')

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isGestionnaire, isMembre }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
