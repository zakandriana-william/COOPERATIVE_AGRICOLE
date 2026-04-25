import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'

const demoTransactions = [
  { id:1,  numero:'T-0142', description:'Cotisation Koné Ibrahim',     categorie:'Cotisation', date:'2024-04-18', montant:25000,   type:'recette' },
  { id:2,  numero:'T-0141', description:'Achat Engrais NPK',            categorie:'Achat stock',date:'2024-04-17', montant:180000,  type:'dépense' },
  { id:3,  numero:'T-0140', description:'Vente Maïs – Marché Bouaké',  categorie:'Vente',      date:'2024-04-15', montant:850000,  type:'recette' },
  { id:4,  numero:'T-0139', description:'Salaire Gestionnaire',         categorie:'Salaire',    date:'2024-04-01', montant:120000,  type:'dépense' },
  { id:5,  numero:'T-0138', description:'Cotisation Diallo Mamadou',    categorie:'Cotisation', date:'2024-03-28', montant:25000,   type:'recette' },
]

const bilanHebdo = [
  { semaine:'S1', recette:350000, depense:80000 },
  { semaine:'S2', recette:520000, depense:180000 },
  { semaine:'S3', recette:280000, depense:120000 },
  { semaine:'S4', recette:800000, depense:160000 },
]

const emptyForm = { type:'recette', categorie:'Cotisation', description:'', montant:'', date:'', id_membre:'' }

export default function FinancesPage() {
  const [transactions, setTransactions] = useState(demoTransactions)
  const [modal, setModal]   = useState(false)
  const [form,  setForm]    = useState(emptyForm)
  const [filterType, setFilterType] = useState('')
  const [search, setSearch] = useState('')

  const totalRecettes = transactions.filter(t=>t.type==='recette').reduce((a,t)=>a+t.montant,0)
  const totalDepenses = transactions.filter(t=>t.type==='dépense').reduce((a,t)=>a+t.montant,0)
  const solde = totalRecettes - totalDepenses

  const filtered = transactions.filter(t => {
    const q = search.toLowerCase()
    return (!q || t.description.toLowerCase().includes(q) || t.numero.toLowerCase().includes(q))
        && (!filterType || t.type === filterType)
  })

  const handleSave = () => {
    if (!form.description || !form.montant) return toast.error('Description et montant requis')
    const t = { id:Date.now(), numero:`T-${String(transactions.length+200).padStart(4,'0')}`, ...form, montant:+form.montant }
    setTransactions(prev=>[t,...prev])
    toast.success('Transaction enregistrée !')
    setModal(false); setForm(emptyForm)
  }

  const handleRecu = (t) => toast.success(`🧾 Reçu #R-${t.numero} généré en PDF !`)

  const fmt = (n) => n.toLocaleString('fr-FR') + ' F'

  return (
    <div className="slide-up">
      {/* KPIs */}
      <div className="kpi-row">
        {[
          { label:'Recettes',       value: fmt(totalRecettes), color:'var(--green)' },
          { label:'Dépenses',       value: fmt(totalDepenses), color:'var(--red)' },
          { label:'Solde net',      value: fmt(solde),         color: solde>=0?'var(--blue)':'var(--red)' },
          { label:'Transactions',   value: transactions.length, color:'var(--text)' },
        ].map((k,i)=>(
          <div className="kpi-card" key={i}>
            <div className="kpi-value" style={{color:k.color,fontSize:'1.1rem'}}>{k.value}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-32">
        {/* Transactions */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">💰 Transactions Récentes</div>
            <button className="btn btn-primary btn-sm" onClick={()=>{setModal(true);setForm(emptyForm)}}>+ Transaction</button>
          </div>
          <div className="card-body">
            <div className="filters-bar">
              <div className="search-wrap">
                <span className="search-icon">🔍</span>
                <input className="search-input" placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>
              <select className="form-select" style={{height:36,fontSize:'0.78rem'}} value={filterType} onChange={e=>setFilterType(e.target.value)}>
                <option value="">Tous types</option>
                <option value="recette">Recettes</option>
                <option value="dépense">Dépenses</option>
              </select>
            </div>
            <table className="data-table">
              <thead><tr><th>N°</th><th>Description</th><th>Catégorie</th><th>Date</th><th>Montant</th><th>Type</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(t=>(
                  <tr key={t.id}>
                    <td><span style={{fontFamily:'monospace',fontSize:'0.7rem',color:'var(--text3)'}}>{t.numero}</span></td>
                    <td className="bold">{t.description}</td>
                    <td><span className="badge badge-blue">{t.categorie}</span></td>
                    <td>{new Date(t.date).toLocaleDateString('fr-FR')}</td>
                    <td style={{fontWeight:700,color:t.type==='recette'?'var(--green)':'var(--red)'}}>
                      {t.type==='recette'?'+':'-'}{fmt(t.montant)}
                    </td>
                    <td><span className={`badge ${t.type==='recette'?'badge-green':'badge-red'}`}>{t.type}</span></td>
                    <td>
                      <div className="action-btns">
                        <div className="action-btn" title="Générer reçu" onClick={()=>handleRecu(t)}>🧾</div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination">
              <div className="page-btn">‹</div>
              <div className="page-btn active">1</div>
              <div className="page-btn">2</div>
              <div className="page-btn">›</div>
            </div>
          </div>
        </div>

        {/* Bilan */}
        <div className="card">
          <div className="card-header"><div className="card-title">📊 Bilan Avril 2024</div></div>
          <div className="card-body">
            <div style={{marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.75rem',marginBottom:4}}>
                <span>Recettes</span><span style={{color:'var(--green)',fontWeight:700}}>+{fmt(totalRecettes)}</span>
              </div>
              <div className="progress-bar" style={{height:8}}>
                <div className="progress-fill" style={{width:'70%',background:'var(--green)'}}/>
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.75rem',marginBottom:4}}>
                <span>Dépenses</span><span style={{color:'var(--red)',fontWeight:700}}>-{fmt(totalDepenses)}</span>
              </div>
              <div className="progress-bar" style={{height:8}}>
                <div className="progress-fill" style={{width:'30%',background:'var(--red)'}}/>
              </div>
            </div>
            <div style={{background:'var(--green-light)',borderRadius:8,padding:'12px',textAlign:'center',marginBottom:12}}>
              <div style={{fontSize:'0.68rem',color:'var(--text2)',marginBottom:2}}>Solde net</div>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:'1.5rem',color:'var(--green)'}}>{fmt(solde)}</div>
            </div>
            <ResponsiveContainer width="100%" height={90}>
              <BarChart data={bilanHebdo} margin={{top:0,right:0,left:-20,bottom:0}}>
                <XAxis dataKey="semaine" tick={{fontSize:9,fill:'var(--text3)'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:9}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{fontSize:'0.68rem',borderRadius:8}} formatter={v=>[fmt(v)]}/>
                <Bar dataKey="recette" fill="var(--green)" radius={[2,2,0,0]}/>
                <Bar dataKey="depense" fill="var(--red-light)" radius={[2,2,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={modal} onClose={()=>setModal(false)} title="💰 Nouvelle Transaction"
        footer={<><button className="btn btn-ghost" onClick={()=>setModal(false)}>Annuler</button><button className="btn btn-primary" onClick={handleSave}>Enregistrer</button></>}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Type *</label>
            <select className="form-select" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
              <option value="recette">Recette</option>
              <option value="dépense">Dépense</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Catégorie *</label>
            <select className="form-select" value={form.categorie} onChange={e=>setForm({...form,categorie:e.target.value})}>
              {['Cotisation','Vente','Subvention','Achat','Salaire','Transport','Autre'].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group full">
            <label className="form-label">Description *</label>
            <input className="form-input" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Ex: Cotisation 2024 – Koné Ibrahim"/>
          </div>
          <div className="form-group">
            <label className="form-label">Montant (FCFA) *</label>
            <input className="form-input" type="number" value={form.montant} onChange={e=>setForm({...form,montant:e.target.value})} placeholder="Ex: 25000"/>
          </div>
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input className="form-input" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
          </div>
          <div className="form-group full">
            <label className="form-label">Membre concerné (optionnel)</label>
            <select className="form-select" value={form.id_membre} onChange={e=>setForm({...form,id_membre:e.target.value})}>
              <option value="">-- Aucun --</option>
              {['Koné Ibrahim','Diallo Mamadou','Traoré Fatou'].map(m=><option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}
