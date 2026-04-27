const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const pool   = require('../config/db')

const genToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

const register = async (req, res) => {
  try {
    const { nom, prenom, email, password } = req.body
    if (!nom || !prenom || !email || !password)
      return res.status(400).json({ message: 'Tous les champs sont requis.' })
    if (password.length < 8)
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères.' })
    const [existing] = await pool.query('SELECT * FROM utilisateurs WHERE email = ?', [email])
    if (existing.length > 0)
      return res.status(409).json({ message: 'Cet email est déjà utilisé.' })
    const hash = await bcrypt.hash(password, 12)
    // ✅ tsy misy JOIN roles
    const [result] = await pool.query(
      'INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, actif) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, prenom, email, hash, 'membre', 1]
    )
    res.status(201).json({ message: 'Compte créé avec succès.', id: result.insertId })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ message: 'Email et mot de passe requis.' })
    const [rows] = await pool.query('SELECT * FROM utilisateurs WHERE email = ?', [email])
    if (rows.length === 0)
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' })
    const user = rows[0]
    const suspended = user.statut === 'suspendu' || user.actif === 0
    if (suspended)
      return res.status(403).json({ message: 'Votre compte est désactivé.' })
    const passwordField = user.mot_de_passe || user.password
    const isMatch = await bcrypt.compare(password, passwordField)
    if (!isMatch)
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' })
    const userId = user.id_utilisateur || user.id
    const userRole = user.role || 'membre'
    const token = genToken(userId, userRole)
    res.json({
      message: 'Connexion réussie.',
      token,
      user: { id: userId, nom: user.nom, prenom: user.prenom, email: user.email, role: userRole, actif: 1 }
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

const getMe = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Non authentifié' })
  res.json({ user: req.user })
}

const resetPassword = async (req, res) => {
  res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' })
}

module.exports = { register, login, getMe, resetPassword }
