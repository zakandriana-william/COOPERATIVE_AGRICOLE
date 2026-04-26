const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const pool    = require('../config/db')

// Génère un token JWT
const genToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

// ── POST /api/auth/register ─────────────────────────────────────
const register = async (req, res) => {
  try {
    const { nom, prenom, email, password } = req.body
    if (!nom || !prenom || !email || !password)
      return res.status(400).json({ message: 'Tous les champs sont requis.' })

    if (password.length < 8)
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères.' })

    // Vérifier email unique
    const [existing] = await pool.query('SELECT id FROM utilisateur WHERE email = ?', [email])
    if (existing.length > 0)
      return res.status(409).json({ message: 'Cet email est déjà utilisé.' })

    // Hasher le mot de passe
    const hash = await bcrypt.hash(password, 12)

    // Rôle "membre" par défaut (admin, gestionnaire, membre)
    const [result] = await pool.query(
      'INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, role, actif) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, prenom, email, hash, 'membre', 1]
    )

    res.status(201).json({
      message: 'Compte créé avec succès.',
      id: result.insertId,
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// ── POST /api/auth/login ────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ message: 'Email et mot de passe requis.' })

    // Chercher l'utilisateur
    const [rows] = await pool.query(
      `SELECT id, nom, prenom, email, mot_de_passe, role, actif, created_at
       FROM utilisateur
       WHERE email = ?`,
      [email]
    )

    if (rows.length === 0)
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' })

    const user = rows[0]

    // Vérifier si compte actif
    if (user.actif === 0)
      return res.status(403).json({ message: 'Votre compte est désactivé. Contactez l\'administrateur.' })

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.mot_de_passe)
    if (!isMatch)
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' })

    const token = genToken(user.id, user.role)

    res.json({
      message: 'Connexion réussie.',
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        actif: user.actif,
        created_at: user.created_at
      }
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// ── GET /api/auth/me ────────────────────────────────────────────
const getMe = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Non authentifié' })
  }
  res.json({ user: req.user })
}

// ── POST /api/auth/reset-password ──────────────────────────────
const resetPassword = async (req, res) => {
  const { email } = req.body
  const [rows] = await pool.query('SELECT id FROM utilisateur WHERE email = ?', [email])
  res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' })
}

module.exports = { register, login, getMe, resetPassword }
