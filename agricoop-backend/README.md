# 🌾 AgriCoop – Application de Gestion de Coopérative Agricole

## 🗂 Structure du projet

```
agricoop/
├── agricoop-frontend/          ← React + Vite
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js        ← Instance Axios + intercepteurs JWT
│   │   │   └── services.js     ← Toutes les fonctions API
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Topbar.jsx
│   │   │   │   └── AppLayout.jsx  ← PrivateRoute + Layout
│   │   │   └── ui/
│   │   │       └── Modal.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx  ← Gestion JWT + rôles
│   │   ├── pages/
│   │   │   ├── auth/            ← LoginPage, RegisterPage
│   │   │   ├── dashboard/       ← DashboardPage
│   │   │   ├── membres/         ← MembresPage
│   │   │   ├── stocks/          ← StocksPage
│   │   │   ├── recoltes/        ← RecoltesPage
│   │   │   └── finances/        ← FinancesPage
│   │   ├── App.jsx              ← Router + Routes protégées
│   │   ├── main.jsx
│   │   └── index.css            ← Design system complet
│   └── package.json
│
└── agricoop-backend/           ← Node.js + Express + MySQL
    ├── config/
    │   ├── db.js               ← Pool MySQL
    │   └── initDB.js           ← Script création tables + données
    ├── middleware/
    │   └── auth.js             ← protect + authorize (RBAC)
    ├── controllers/
    │   ├── authController.js   ← register, login, getMe
    │   ├── membresController.js
    │   ├── stocksController.js
    │   ├── recoltesController.js
    │   └── financesController.js
    ├── routes/
    │   ├── auth.js
    │   ├── membres.js
    │   └── stocks.js
    ├── server.js               ← Point d'entrée Express
    └── .env                    ← Variables d'environnement
```

---

## ⚡ Installation & Démarrage

### Étape 1 — Backend

```bash
# 1. Aller dans le dossier backend
cd agricoop-backend

# 2. Installer les dépendances
npm install

# 3. Configurer le fichier .env
# Ouvrir .env et renseigner les infos MySQL :
#   DB_USER=root
#   DB_PASSWORD=votre_mot_de_passe_mysql

# 4. Initialiser la base de données (crée les tables + données de démo)
npm run db:init

# 5. Démarrer le serveur
npm run dev
# ✅ API disponible sur : http://localhost:5000
```

### Étape 2 — Frontend

```bash
# 1. Aller dans le dossier frontend (nouveau terminal)
cd agricoop-frontend

# 2. Installer les dépendances
npm install

# 3. Démarrer l'application
npm run dev
# ✅ App disponible sur : http://localhost:3000
```

---

## 🔑 Compte administrateur par défaut

| Email | Mot de passe |
|-------|-------------|
| admin@agricoop.ci | Admin1234! |

---

## 🌐 Endpoints API

| Méthode | Route | Rôle requis | Description |
|---------|-------|-------------|-------------|
| POST | /api/auth/register | Public | Créer un compte |
| POST | /api/auth/login | Public | Se connecter |
| GET | /api/auth/me | Tous | Infos utilisateur |
| GET | /api/membres | Admin/Gest. | Liste membres |
| POST | /api/membres | Admin | Créer un membre |
| PUT | /api/membres/:id | Admin | Modifier un membre |
| PATCH | /api/membres/:id/suspendre | Admin | Suspendre |
| GET | /api/produits | Admin/Gest. | Liste produits |
| POST | /api/mouvements | Admin/Gest. | Entrée/Sortie stock |
| GET | /api/recoltes | Admin/Gest. | Liste récoltes |
| POST | /api/recoltes | Admin/Gest. | Nouvelle récolte |
| GET | /api/transactions | Admin | Finances |
| POST | /api/transactions | Admin | Nouvelle transaction |
| GET | /api/dashboard/stats | Tous | Stats dashboard |

---

## 🔒 Gestion des Rôles (RBAC)

| Rôle | Dashboard | Membres | Stocks | Récoltes | Finances |
|------|-----------|---------|--------|----------|----------|
| **Administrateur** | ✅ Complet | ✅ CRUD | ✅ CRUD | ✅ CRUD | ✅ CRUD |
| **Gestionnaire** | ✅ Partiel | 👁 Lecture | ✅ Entrées/Sorties | ✅ Saisie | ❌ |
| **Membre** | ❌ | 👁 Son profil | ❌ | 👁 Ses récoltes | 👁 Ses transactions |

---

## 🔧 Connecter le Frontend au vrai Backend

Dans chaque page React, décommenter les appels API :

```jsx
// Exemple dans DashboardPage.jsx
useEffect(() => {
  // ❌ Avant (données de démo) :
  // setStats(demoStats)

  // ✅ Après (vraie API) :
  dashboardAPI.getStats()
    .then(r => setStats(r.data))
    .catch(err => toast.error('Erreur chargement'))
}, [])
```

---

## 🚀 Déploiement

| Service | Usage | Gratuit |
|---------|-------|---------|
| **Vercel** | Frontend React | ✅ |
| **Render** | Backend Node.js | ✅ |
| **PlanetScale / Clever Cloud** | MySQL en ligne | ✅ |

```bash
# Build frontend pour production
cd agricoop-frontend
npm run build

# Le dossier dist/ est prêt à déployer sur Vercel
```




