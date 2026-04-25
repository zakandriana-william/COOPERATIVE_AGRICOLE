// Script d'initialisation de la base de données
// Exécuter avec : node config/initDB.js

const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')
require('dotenv').config()

async function initDB() {
  let conn
  try {
    // Connexion sans spécifier la BDD pour la créer
    conn = await mysql.createConnection({
      host:     process.env.DB_HOST || 'localhost',
      user:     process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true,
    })

    console.log('🔧 Initialisation de la base de données...')

    // Créer la base de données
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
    await conn.query(`USE \`${process.env.DB_NAME}\``)

    // ── TABLES ──────────────────────────────────────────────────

    await conn.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id_role     INT AUTO_INCREMENT PRIMARY KEY,
        libelle     VARCHAR(50)  NOT NULL UNIQUE,
        description TEXT         NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS utilisateurs (
        id_utilisateur   INT          AUTO_INCREMENT PRIMARY KEY,
        id_role          INT          NOT NULL,
        nom              VARCHAR(100) NOT NULL,
        prenom           VARCHAR(100) NOT NULL,
        email            VARCHAR(150) NOT NULL UNIQUE,
        mot_de_passe     VARCHAR(255) NOT NULL,
        statut           ENUM('actif','suspendu') DEFAULT 'actif',
        date_inscription DATETIME DEFAULT NOW(),
        CONSTRAINT fk_util_role FOREIGN KEY (id_role) REFERENCES roles(id_role) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS membres (
        id_membre      INT          AUTO_INCREMENT PRIMARY KEY,
        id_utilisateur INT          NOT NULL UNIQUE,
        numero_membre  VARCHAR(20)  NOT NULL UNIQUE,
        telephone      VARCHAR(20)  NULL,
        localisation   VARCHAR(200) NULL,
        type_culture   VARCHAR(100) NULL,
        superficie_ha  DECIMAL(8,2) NULL,
        date_adhesion  DATE         NOT NULL,
        statut_membre  ENUM('actif','suspendu','retraité') DEFAULT 'actif',
        CONSTRAINT fk_membre_util FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS cotisations (
        id_cotisation   INT           AUTO_INCREMENT PRIMARY KEY,
        id_membre       INT           NOT NULL,
        annee           YEAR          NOT NULL,
        montant         DECIMAL(10,2) NOT NULL,
        date_paiement   DATE          NULL,
        statut_paiement ENUM('payé','en_attente','en_retard') DEFAULT 'en_attente',
        UNIQUE KEY uq_membre_annee (id_membre, annee),
        CONSTRAINT fk_cotis_membre FOREIGN KEY (id_membre) REFERENCES membres(id_membre) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS saisons (
        id_saison   INT         AUTO_INCREMENT PRIMARY KEY,
        nom_saison  VARCHAR(50) NOT NULL,
        date_debut  DATE        NOT NULL,
        date_fin    DATE        NOT NULL,
        description TEXT        NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS recoltes (
        id_recolte    INT           AUTO_INCREMENT PRIMARY KEY,
        id_membre     INT           NOT NULL,
        id_saison     INT           NOT NULL,
        type_culture  VARCHAR(100)  NOT NULL,
        quantite_kg   DECIMAL(10,2) NOT NULL,
        superficie_ha DECIMAL(8,2)  NOT NULL,
        rendement     DECIMAL(8,2)  GENERATED ALWAYS AS (quantite_kg / 1000 / superficie_ha) STORED,
        date_recolte  DATE          NOT NULL,
        CONSTRAINT fk_recolt_membre FOREIGN KEY (id_membre) REFERENCES membres(id_membre),
        CONSTRAINT fk_recolt_saison FOREIGN KEY (id_saison) REFERENCES saisons(id_saison)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS fournisseurs (
        id_fournisseur  INT          AUTO_INCREMENT PRIMARY KEY,
        nom_fournisseur VARCHAR(150) NOT NULL,
        contact         VARCHAR(100) NULL,
        telephone       VARCHAR(20)  NULL,
        adresse         TEXT         NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS produits (
        id_produit     INT           AUTO_INCREMENT PRIMARY KEY,
        nom_produit    VARCHAR(150)  NOT NULL,
        categorie      ENUM('semence','engrais','pesticide','équipement') NOT NULL,
        unite          VARCHAR(20)   NOT NULL,
        quantite_stock DECIMAL(10,2) DEFAULT 0,
        seuil_alerte   DECIMAL(10,2) NOT NULL,
        prix_unitaire  DECIMAL(10,2) NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS mouvements_stock (
        id_mouvement   INT           AUTO_INCREMENT PRIMARY KEY,
        id_produit     INT           NOT NULL,
        id_membre      INT           NULL,
        id_fournisseur INT           NULL,
        type_mouvement ENUM('entrée','sortie') NOT NULL,
        quantite       DECIMAL(10,2) NOT NULL,
        date_mouvement DATETIME      DEFAULT NOW(),
        motif          VARCHAR(200)  NULL,
        CONSTRAINT fk_mv_produit FOREIGN KEY (id_produit)     REFERENCES produits(id_produit),
        CONSTRAINT fk_mv_membre  FOREIGN KEY (id_membre)      REFERENCES membres(id_membre)      ON DELETE SET NULL,
        CONSTRAINT fk_mv_fourn   FOREIGN KEY (id_fournisseur) REFERENCES fournisseurs(id_fournisseur) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id_transaction   INT           AUTO_INCREMENT PRIMARY KEY,
        id_utilisateur   INT           NOT NULL,
        id_membre        INT           NULL,
        type_transaction ENUM('recette','dépense') NOT NULL,
        categorie        VARCHAR(100)  NOT NULL,
        montant          DECIMAL(12,2) NOT NULL,
        date_transaction DATETIME      DEFAULT NOW(),
        description      TEXT          NULL,
        CONSTRAINT fk_trans_util   FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id_utilisateur),
        CONSTRAINT fk_trans_membre FOREIGN KEY (id_membre)      REFERENCES membres(id_membre) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS recus (
        id_recu        INT          AUTO_INCREMENT PRIMARY KEY,
        id_transaction INT          NOT NULL UNIQUE,
        numero_recu    VARCHAR(30)  NOT NULL UNIQUE,
        date_emission  DATETIME     DEFAULT NOW(),
        fichier_pdf    VARCHAR(255) NULL,
        CONSTRAINT fk_recu_trans FOREIGN KEY (id_transaction) REFERENCES transactions(id_transaction) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    console.log('✅ Tables créées avec succès !')

    // ── DONNÉES PAR DÉFAUT ───────────────────────────────────────

    // Rôles
    await conn.query(`
      INSERT IGNORE INTO roles (libelle, description) VALUES
      ('administrateur', 'Accès complet à toutes les fonctionnalités'),
      ('gestionnaire',   'Gestion stocks et récoltes'),
      ('membre',         'Consultation espace personnel')
    `)

    // Admin par défaut
    const hash = await bcrypt.hash('Admin1234!', 12)
    await conn.query(`
      INSERT IGNORE INTO utilisateurs (id_role, nom, prenom, email, mot_de_passe)
      SELECT id_role, 'Admin', 'Principal', 'admin@agricoop.ci', ?
      FROM roles WHERE libelle = 'administrateur'
    `, [hash])

    // Saison de démonstration
    await conn.query(`
      INSERT IGNORE INTO saisons (nom_saison, date_debut, date_fin, description)
      VALUES ('Grande Saison 2024', '2024-03-01', '2024-07-31', 'Principale saison agricole 2024')
    `)

    // Produits de démonstration
    await conn.query(`
      INSERT IGNORE INTO produits (nom_produit, categorie, unite, quantite_stock, seuil_alerte, prix_unitaire) VALUES
      ('Engrais NPK',          'engrais',     'kg',    12,  50,  850),
      ('Semences Maïs',        'semence',     'kg',    45,  100, 1200),
      ('Pesticide Biopestol',  'pesticide',   'L',     156, 50,  2500),
      ('Semences Manioc',      'semence',     'kg',    920, 200, 600),
      ('Motopompe Irrigation', 'équipement',  'unité', 3,   2,   85000)
    `)

    console.log('✅ Données par défaut insérées !')
    console.log('')
    console.log('🎉 Base de données initialisée avec succès !')
    console.log('──────────────────────────────────────────')
    console.log('   Admin par défaut :')
    console.log('   Email    : admin@agricoop.ci')
    console.log('   Password : Admin1234!')
    console.log('──────────────────────────────────────────')

  } catch (err) {
    console.error('❌ Erreur initialisation :', err.message)
  } finally {
    if (conn) await conn.end()
    process.exit(0)
  }
}

initDB()
