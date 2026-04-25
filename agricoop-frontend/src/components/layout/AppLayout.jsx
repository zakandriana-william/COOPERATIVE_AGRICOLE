import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from './Sidebar'
import Topbar  from './Topbar'

// Route protégée — redirige vers /login si non connecté
export function PrivateRoute({ allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontSize:'1.2rem' }}>
      🌾 Chargement...
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/dashboard" replace />

  return <Outlet />
}

// Layout principal avec sidebar + topbar
export function AppLayout({ onAdd, addLabel }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Topbar onAdd={onAdd} addLabel={addLabel} />
        <div className="app-content slide-up">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
