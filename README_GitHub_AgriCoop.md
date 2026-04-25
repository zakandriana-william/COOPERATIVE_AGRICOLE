# 🌾 AgriCoop – Application de Gestion de Coopérative Agricole

![Version](https://img.shields.io/badge/version-1.0.0-green)
![Statut](https://img.shields.io/badge/statut-en%20production-brightgreen)
![Licence](https://img.shields.io/badge/licence-MIT-blue)

> Application web complète pour digitaliser et automatiser la gestion d'une coopérative agricole : membres, stocks, récoltes, finances et tableau de bord.

---

## 📋 Table des matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Installation](#installation)
- [Structure du projet](#structure-du-projet)
- [API Endpoints](#api-endpoints)
- [Déploiement](#déploiement)
- [Tests](#tests)
- [Auteur](#auteur)

---

## 🖥️ Aperçu

AgriCoop permet aux coopératives agricoles de :
- Gérer les **membres** et leurs cotisations
- Suivre les **stocks** (semences, engrais, équipements) avec alertes critiques
- Enregistrer les **récoltes** et calculer les rendements automatiquement
- Gérer les **transactions financières** et générer des bilans
- Visualiser les données via un **tableau de bord** interactif

---

## ✅ Fonctionnalités

| Module | Fonctionnalités |
|--------|----------------|
| 🔐 **Authentification** | Connexion JWT, rôles (admin / gestionnaire / membre) |
| 👥 **Membres** | CRUD complet, statuts, cotisations, recherche/filtres |
| 📦 **Stocks** | Inventaire, entrées/sorties, alertes seuil critique |
| 🌾 **Récoltes** | Enregistrement par saison, calcul rendement (kg/ha) |
| 💰 **Finances** | Recettes, dépenses, bilan mensuel/annuel |
| 📊 **Dashboard** | KPIs, graphiques recharts, alertes en temps réel |

---

## 🛠️ Stack technique

### Frontend
| Technologie | Rôle |
|-------------|------|
| React 18 + Vite | Framework UI / Build |
| React Router v6 | Navigation SPA |
| Axios | Appels HTTP API |
| Recharts | Graphiques interactifs |
| React Hot Toast | Notifications |

### Backend
| Technologie | Rôle |
|-------------|------|
| Node.js + Express | Serveur API REST |
| MySQL2 | Base de données relationnelle |
| bcryptjs | Hachage des mots de passe |
| jsonwebtoken | Authentification JWT |
| express-validator | Validation des données |

---

## ⚙️ Installation locale

### Prérequis
- Node.js >= 18.x
- MySQL >= 8.x
- Git

### 1. Cloner le dépôt
```bash
git clone https://github.com/VOTRE_USERNAME/agricoop.git
cd agricoop
```

### 2. Configurer la base de données
```bash
mysql -u root -p < agricoop-backend/sql/schema.sql
```

### 3. Configurer le backend
```bash
cd agricoop-backend
cp .env.example .env
# Éditer .env avec vos paramètres MySQL
npm install
npm run dev
```

### 4. Configurer le frontend
```bash
cd ../agricoop-frontend
npm install
npm run dev
```

### 5. Accéder à l'application
```
Frontend : http://localhost:3000
Backend  : http://localhost:5000
```

### Compte de test par défaut
```
Email    : admin@agricoop.com
Password : Admin1234!
```

---

## 📁 Structure du projet

```
agricoop/
├── agricoop-frontend/          # Application React
│   ├── src/
│   │   ├── App.jsx             # Routes + protection JWT
│   │   ├── context/            # AuthContext (état global)
│   │   ├── services/api.js     # Tous les appels API
│   │   ├── components/
│   │   │   ├── layout/         # Sidebar + Topbar
│   │   │   └── shared/         # Modal réutilisable
│   │   └── pages/              # Dashboard, Membres, Stocks...
│   └── vite.config.js
│
└── agricoop-backend/           # API Node.js + Express
    ├── src/
    │   ├── server.js           # Point d'entrée
    │   ├── config/db.js        # Connexion MySQL
    │   ├── middleware/auth.js  # Vérification JWT
    │   ├── controllers/        # Logique métier
    │   └── routes/             # Définition des endpoints
    └── sql/schema.sql          # Script BDD + données test
```

---

## 🔌 API Endpoints

### Authentification
```
POST   /api/auth/login       Connexion → retourne JWT
POST   /api/auth/register    Inscription
GET    /api/auth/me          Profil connecté
```

### Membres
```
GET    /api/membres          Liste (filtre: search, statut)
POST   /api/membres          Créer un membre
GET    /api/membres/:id      Détail d'un membre
PUT    /api/membres/:id      Modifier
DELETE /api/membres/:id      Supprimer
POST   /api/membres/:id/cotisation  Enregistrer cotisation
```

### Stocks
```
GET    /api/stocks           Inventaire complet
POST   /api/stocks           Ajouter produit
PUT    /api/stocks/:id       Modifier produit
DELETE /api/stocks/:id       Supprimer
POST   /api/stocks/entree    Mouvement entrée
POST   /api/stocks/sortie    Mouvement sortie
GET    /api/stocks/alertes   Produits sous seuil
```

### Récoltes
```
GET    /api/recoltes         Liste (filtre: saison, culture)
POST   /api/recoltes         Enregistrer récolte
PUT    /api/recoltes/:id     Modifier
DELETE /api/recoltes/:id     Supprimer
GET    /api/recoltes/saisons Liste des saisons
```

### Finances
```
GET    /api/finances         Liste transactions
POST   /api/finances         Créer transaction
GET    /api/finances/bilan   Bilan (recettes/dépenses/solde)
```

### Dashboard
```
GET    /api/dashboard/stats  Tous les KPIs
```

---

## 🚀 Déploiement

| Service | Plateforme | URL |
|---------|-----------|-----|
| Frontend | GitHub Pages | `https://VOTRE_USERNAME.github.io/agricoop` |
| Backend  | Render      | `https://agricoop-api.onrender.com` |

Voir le [Guide de déploiement complet](./DEPLOIEMENT.md) pour les instructions détaillées.

---

## 🧪 Tests

Les tests manuels couvrent :
- Authentification (connexion, JWT, déconnexion)
- CRUD pour chaque module
- Alertes de stock
- Calcul des rendements
- Bilan financier

Voir le [Guide de tests manuels](./TESTS.md) pour la checklist complète.

---

## 👤 Auteur

Projet développé dans le cadre d'un mini-projet académique.

- **Stack** : React · Node.js · MySQL · JWT
- **Phase** : Développement → Déploiement

---

## 📄 Licence

MIT License — libre d'utilisation et de modification.
