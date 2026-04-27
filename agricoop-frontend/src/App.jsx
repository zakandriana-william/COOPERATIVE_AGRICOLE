import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PrivateRoute, AppLayout } from './components/layout/AppLayout'
import LoginPage     from './pages/auth/LoginPage'
import RegisterPage  from './pages/auth/RegisterPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import MembresPage   from './pages/membres/MembresPage'
import StocksPage    from './pages/stocks/StocksPage'
import { RecoltesPage } from './pages/recoltes/RecoltesPage'
import FinancesPage  from './pages/finances/FinancesPage'
import RapportsPage  from './pages/rapports/RapportsPage'
import UtilisateursPage from './pages/utilisateurs/UtilisateursPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ── Publiques ── */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/"         element={<Navigate to="/login" replace />} />

        {/* ── Register — Admin seulement ── */}
        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* ── Admin + Gestionnaire ── */}
        <Route element={<PrivateRoute allowedRoles={['admin', 'gestionnaire']} />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/membres"   element={<MembresPage />} />
            <Route path="/stocks"    element={<StocksPage />} />
            <Route path="/recoltes"  element={<RecoltesPage />} />
          </Route>
        </Route>

        {/* ── Admin seulement ── */}
        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          <Route element={<AppLayout />}>
            <Route path="/finances"     element={<FinancesPage />} />
            <Route path="/rapports"     element={<RapportsPage />} />
            <Route path="/utilisateurs" element={<UtilisateursPage />} />
          </Route>
        </Route>

        {/* ── Membre ── */}
        <Route element={<PrivateRoute allowedRoles={['membre']} />}>
          <Route element={<AppLayout />}>
            <Route path="/profil" element={<div style={{padding:24}}><h2>👤 Mon Profil – Bientôt disponible</h2></div>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}
