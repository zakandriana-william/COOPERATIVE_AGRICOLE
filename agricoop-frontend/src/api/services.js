import api from './axios'

// ══ AUTH ══════════════════════════════════════════════
export const authAPI = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me:       ()     => api.get('/auth/me'),
  resetPassword: (email) => api.post('/auth/reset-password', { email }),
}

// ══ MEMBRES ═══════════════════════════════════════════
export const membresAPI = {
  getAll:    (params) => api.get('/membres', { params }),
  getById:   (id)     => api.get(`/membres/${id}`),
  create:    (data)   => api.post('/membres', data),
  update:    (id, data) => api.put(`/membres/${id}`, data),
  delete:    (id)     => api.delete(`/membres/${id}`),
  suspendre: (id)     => api.patch(`/membres/${id}/suspendre`),
  reactiver: (id)     => api.patch(`/membres/${id}/reactiver`),
  cotisations: (id)   => api.get(`/membres/${id}/cotisations`),
  recoltes:  (id)     => api.get(`/membres/${id}/recoltes`),
}

// ══ COTISATIONS ═══════════════════════════════════════
export const cotisationsAPI = {
  getAll:  (params) => api.get('/cotisations', { params }),
  create:  (data)   => api.post('/cotisations', data),
  update:  (id, data) => api.put(`/cotisations/${id}`, data),
  delete:  (id)     => api.delete(`/cotisations/${id}`),
}

// ══ STOCKS ════════════════════════════════════════════
export const stocksAPI = {
  getProduits:    (params) => api.get('/produits', { params }),
  getProduitById: (id)     => api.get(`/produits/${id}`),
  createProduit:  (data)   => api.post('/produits', data),
  updateProduit:  (id, data) => api.put(`/produits/${id}`, data),
  deleteProduit:  (id)     => api.delete(`/produits/${id}`),

  getMouvements:  (params) => api.get('/mouvements', { params }),
  createMouvement:(data)   => api.post('/mouvements', data),

  getAlertesStock: ()      => api.get('/produits/alertes'),
}

// ══ FOURNISSEURS ══════════════════════════════════════
export const fournisseursAPI = {
  getAll:  ()       => api.get('/fournisseurs'),
  create:  (data)   => api.post('/fournisseurs', data),
  update:  (id, data) => api.put(`/fournisseurs/${id}`, data),
  delete:  (id)     => api.delete(`/fournisseurs/${id}`),
}

// ══ RÉCOLTES ══════════════════════════════════════════
export const recoltesAPI = {
  getAll:         (params) => api.get('/recoltes', { params }),
  getById:        (id)     => api.get(`/recoltes/${id}`),
  create:         (data)   => api.post('/recoltes', data),
  update:         (id, data) => api.put(`/recoltes/${id}`, data),
  delete:         (id)     => api.delete(`/recoltes/${id}`),
  getComparaison: (params) => api.get('/recoltes/comparaison', { params }),
}

// ══ SAISONS ═══════════════════════════════════════════
export const saisonsAPI = {
  getAll:   ()       => api.get('/saisons'),
  getActive:()       => api.get('/saisons/active'),
  create:   (data)   => api.post('/saisons', data),
  update:   (id, data) => api.put(`/saisons/${id}`, data),
  delete:   (id)     => api.delete(`/saisons/${id}`),
}

// ══ FINANCES ══════════════════════════════════════════
export const financesAPI = {
  getTransactions: (params) => api.get('/transactions', { params }),
  getById:         (id)     => api.get(`/transactions/${id}`),
  create:          (data)   => api.post('/transactions', data),
  update:          (id, data) => api.put(`/transactions/${id}`, data),
  delete:          (id)     => api.delete(`/transactions/${id}`),
  getBilan:        (params) => api.get('/transactions/bilan', { params }),
  genererRecu:     (id)     => api.post(`/transactions/${id}/recu`),
  getRecus:        ()       => api.get('/recus'),
}

// ══ DASHBOARD ═════════════════════════════════════════
export const dashboardAPI = {
  getStats:  () => api.get('/dashboard/stats'),
  getAlertes:() => api.get('/dashboard/alertes'),
}

// ══ UTILISATEURS ══════════════════════════════════════
export const utilisateursAPI = {
  getAll:  ()       => api.get('/utilisateurs'),
  create:  (data)   => api.post('/utilisateurs', data),
  update:  (id, data) => api.put(`/utilisateurs/${id}`, data),
  delete:  (id)     => api.delete(`/utilisateurs/${id}`),
  getRoles:()       => api.get('/roles'),
}
