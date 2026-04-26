import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + 'https://cooperative-agricole.onrender.com/api',         // proxy vers http://localhost:5000/api
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Intercepteur requête : ajoute le token JWT automatiquement
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// ── Intercepteur réponse : gère les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré → déconnexion automatique
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
