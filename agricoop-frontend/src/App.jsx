import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PrivateRoute, AppLayout } from './components/layout/AppLayout'

// Pages Auth
import LoginPage    from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Pages App
import DashboardPage from './pages/dashboard/DashboardPage'
import MembresPage   from './pages/membres/MembresPage'
import StocksPage    from './pages/stocks/StocksPage'
import { RecoltesPage }  from './pages/recoltes/RecoltesPage'
import FinancesPage  from './pages/finances/FinancesPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ── Publiques ── */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/"         element={<Navigate to="/login" replace />} />

        {/* ── Protégées : Admin + Gestionnaire ── */}
        <Route element={<PrivateRoute allowedRoles={['administrateur','gestionnaire']} />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/membres"   element={<MembresPage />} />
            <Route path="/stocks"    element={<StocksPage />} />
            <Route path="/recoltes"  element={<RecoltesPage />} />
          </Route>
        </Route>

        {/* ── Protégées : Admin seulement ── */}
        <Route element={<PrivateRoute allowedRoles={['administrateur']} />}>
          <Route element={<AppLayout />}>
            <Route path="/finances"     element={<FinancesPage />} />
            <Route path="/rapports"     element={<div style={{padding:24}}><h2>📄 Rapports – Bientôt disponible</h2></div>} />
            <Route path="/utilisateurs" element={<div style={{padding:24}}><h2>🛡 Utilisateurs – Bientôt disponible</h2></div>} />
          </Route>
        </Route>

        {/* ── Protégées : Membre ── */}
        <Route element={<PrivateRoute allowedRoles={['membre']} />}>
          <Route element={<AppLayout />}>
            <Route path="/profil" element={<div style={{padding:24}}><h2>👤 Mon Profil – Bientôt disponible</h2></div>} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}
