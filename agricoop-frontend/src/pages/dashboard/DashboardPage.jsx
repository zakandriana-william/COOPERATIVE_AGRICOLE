import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { dashboardAPI } from '../../api/services'
import toast from 'react-hot-toast'

const MOIS = ['Jan','Fév','Mar','Avr','Mai','Jui','Jul','Aoû','Sep','Oct','Nov','Déc']

const PIE_COLORS = ['#4A8C3F','#E8A020','#2563AB','#C0392B']

// Données de démo (remplacées par l'API en prod)
const demoStats = {
  membresActifs: 124, produitsStock: 38,
  recoltesTotal: 1248, soldeFinancier: 2400000,
  alertesStock: 2, cotisationsEnRetard: 3,
}
const demoRecoltes = MOIS.map((m, i) => ({ mois: m, tonnes: [55,70,45,85,95,75,88,60,72,90,80,65][i] }))
const demoCultures = [
  { name: 'Maïs', value: 40 }, { name: 'Manioc', value: 30 },
  { name: 'Mil',  value: 18 }, { name: 'Autres', value: 12 },
]
const demoAlertes = [
  { niveau: 'critique', nom: 'Engrais NPK',    stock: 12, seuil: 50, unite: 'kg' },
  { niveau: 'bas',      nom: 'Semences Maïs',  stock: 45, seuil: 100, unite: 'kg' },
]
const demoCotisations = [
  { nom: 'Koné Ibrahim',    date: '18 avr.', montant: 25000, statut: 'payé' },
  { nom: 'Diallo Mamadou',  date: '17 avr.', montant: 25000, statut: 'payé' },
  { nom: 'Traoré Fatou',    date: '—',       montant: 25000, statut: 'retard' },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats]   = useState(demoStats)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Décommenter quand le backend est prêt :
    // dashboardAPI.getStats().then(r => setStats(r.data)).catch(() => {})
  }, [])

  const statCards = [
    { icon: '👥', label: 'Membres actifs',    value: stats.membresActifs,  delta: '+8 ce mois', deltaType: 'up',   color: 'var(--green)',  bg: 'var(--green-light)' },
    { icon: '📦', label: 'Produits en stock', value: stats.produitsStock,  delta: `⚠️ ${stats.alertesStock} critiques`, deltaType: 'down', color: 'var(--orange)', bg: 'var(--orange-light)' },
    { icon: '🌽', label: 'Tonnes récoltées',  value: `${stats.recoltesTotal}t`, delta: '+12% vs N-1', deltaType: 'up', color: 'var(--blue)', bg: 'var(--blue-light)' },
    { icon: '💰', label: 'Solde (FCFA)',       value: `${(stats.soldeFinancier/1000000).toFixed(1)}M`, delta: 'Bilan positif', deltaType: 'up', color: 'var(--purple)', bg: 'var(--purple-light)' },
  ]

  return (
    <div className="slide-up">
      {/* KPIs */}
      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-top-bar" style={{ background: s.color }} />
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-delta delta-${s.deltaType}`}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">📈 Récoltes 2024 (tonnes)</div>
            <span className="card-link" onClick={() => navigate('/recoltes')}>Voir tout →</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={demoRecoltes} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="mois" tick={{ fontSize: 10, fill: 'var(--text3)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text3)' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.75rem' }}
                  formatter={(v) => [`${v}t`, 'Récoltes']}
                />
                <Bar dataKey="tonnes" fill="var(--green)" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">🥧 Cultures</div></div>
          <div className="card-body" style={{ display:'flex', alignItems:'center', gap:16 }}>
            <PieChart width={90} height={90}>
              <Pie data={demoCultures} cx={40} cy={40} innerRadius={24} outerRadius={40} dataKey="value" paddingAngle={2}>
                {demoCultures.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
            </PieChart>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {demoCultures.map((c, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.73rem', color:'var(--text2)' }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background: PIE_COLORS[i], flexShrink:0 }} />
                  {c.name} {c.value}%
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Alertes + Cotisations */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">⚠️ Alertes Stock</div>
            <span className="card-link" onClick={() => navigate('/stocks')}>Gérer →</span>
          </div>
          <div className="card-body">
            {demoAlertes.map((a, i) => (
              <div key={i} className={`alert-item alert-${a.niveau === 'critique' ? 'red' : 'orange'}`}>
                <div className="alert-icon">{a.niveau === 'critique' ? '🔴' : '🟠'}</div>
                <div className="alert-text">
                  <strong>{a.nom}</strong>
                  <span>{a.stock} {a.unite} restants — seuil : {a.seuil} {a.unite}</span>
                </div>
                <span className={`badge badge-${a.niveau === 'critique' ? 'red' : 'orange'}`}>
                  {a.niveau === 'critique' ? 'Critique' : 'Bas'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">💳 Cotisations récentes</div>
            <span className="card-link" onClick={() => navigate('/membres')}>Voir tout →</span>
          </div>
          <div className="card-body" style={{ padding:'10px 16px' }}>
            {demoCotisations.map((c, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-dot" style={{ background: c.statut === 'retard' ? 'var(--red)' : 'var(--green)' }} />
                <div className="timeline-content">
                  <div className="timeline-title">{c.nom}</div>
                  <div className="timeline-meta">{c.statut === 'retard' ? 'En retard · Échéance dépassée' : `Cotisation 2024 · ${c.date}`}</div>
                </div>
                <div className="timeline-amount" style={{ color: c.statut === 'retard' ? 'var(--red)' : 'var(--green)' }}>
                  {c.statut === 'retard' ? '⚠️ Impayé' : `+${c.montant.toLocaleString()} F`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
