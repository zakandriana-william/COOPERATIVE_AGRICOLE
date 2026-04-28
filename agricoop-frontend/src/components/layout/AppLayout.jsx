import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from './Sidebar'
import Topbar  from './Topbar'

// Route protégée
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

// Layout principal avec sidebar + topbar + support mobile
export function AppLayout({ onAdd, addLabel }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => setSidebarOpen(prev => !prev)
  const closeSidebar  = () => setSidebarOpen(false)

  return (
    <div className="app-layout">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      <div className="app-main">
        <Topbar
          onAdd={onAdd}
          addLabel={addLabel}
          onMenuToggle={toggleSidebar}
        />
        <div className="app-content slide-up">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
