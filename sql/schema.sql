-- ============================================================
--  AgriCoop – Schema MySQL (version unifiée)
-- ============================================================

CREATE DATABASE IF NOT EXISTS agricoop
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE agricoop;

-- ── UTILISATEURS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS utilisateurs (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  nom          VARCHAR(100) NOT NULL,
  prenom       VARCHAR(100) NOT NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL,
  role         ENUM('admin','gestionnaire','membre') DEFAULT 'membre',
  actif        BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── MEMBRES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS membres (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id  INT NULL,
  nom             VARCHAR(100) NOT NULL,
  prenom          VARCHAR(100) NOT NULL,
  email           VARCHAR(150),
  telephone       VARCHAR(20),
  localisation    VARCHAR(200),
  culture         VARCHAR(100),
  statut          ENUM('actif','suspendu','retraite') DEFAULT 'actif',
  date_adhesion   DATE DEFAULT (CURDATE()),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
);

-- ── COTISATIONS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cotisations (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  membre_id     INT NOT NULL,
  montant       DECIMAL(12,2) NOT NULL,
  annee         YEAR NOT NULL,
  date_paiement DATE NOT NULL,
  statut_paiement ENUM('payé','en_attente','en_retard') DEFAULT 'en_attente',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (membre_id) REFERENCES membres(id) ON DELETE CASCADE
);

-- ── STOCKS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stocks (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  nom          VARCHAR(150) NOT NULL,
  categorie    ENUM('Semences','Engrais','Pesticides','Équipements','Autre') DEFAULT 'Autre',
  quantite     DECIMAL(12,3) DEFAULT 0,
  unite        VARCHAR(20) DEFAULT 'kg',
  seuil_alerte DECIMAL(12,3) DEFAULT 0,
  description  TEXT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── MOUVEMENTS STOCK ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mouvements_stock (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  id_produit     INT NOT NULL,
  type_mouvement ENUM('entree','sortie') NOT NULL,
  quantite       DECIMAL(12,3) NOT NULL,
  id_membre      INT NULL,
  fournisseur    VARCHAR(200),
  motif          TEXT,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_produit) REFERENCES stocks(id) ON DELETE CASCADE,
  FOREIGN KEY (id_membre)  REFERENCES membres(id) ON DELETE SET NULL
);

-- ── SAISONS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saisons (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nom        VARCHAR(100) NOT NULL,
  date_debut DATE NOT NULL,
  date_fin   DATE,
  active     BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── RECOLTES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recoltes (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  membre_id     INT NOT NULL,
  saison_id     INT,
  culture       VARCHAR(100) NOT NULL,
  quantite_kg   DECIMAL(12,3) NOT NULL,
  superficie_ha DECIMAL(8,3) DEFAULT 0,
  date_recolte  DATE NOT NULL,
  note          TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (membre_id) REFERENCES membres(id) ON DELETE CASCADE,
  FOREIGN KEY (saison_id) REFERENCES saisons(id) ON DELETE SET NULL
);

-- ── FINANCES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS finances (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  type        ENUM('recette','depense') NOT NULL,
  categorie   VARCHAR(100),
  montant     DECIMAL(14,2) NOT NULL,
  date        DATE NOT NULL,
  description TEXT,
  membre_id   INT NULL,
  created_by  INT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (membre_id)  REFERENCES membres(id)        ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES utilisateurs(id)   ON DELETE SET NULL
);

-- ── DONNÉES PAR DÉFAUT ───────────────────────────────────────
-- Password: Admin1234! (bcrypt hash)
INSERT IGNORE INTO utilisateurs (nom, prenom, email, mot_de_passe, role) VALUES
('Admin', 'Système', 'admin@agricoop.com',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uoJe', 'admin');

INSERT IGNORE INTO membres (nom, prenom, telephone, localisation, culture) VALUES
('Koné',    'Ibrahim',  '0701234567', 'Bouaké Nord',  'Maïs'),
('Diallo',  'Mamadou',  '0702345678', 'Bouaké Sud',   'Manioc'),
('Traoré',  'Fatou',    '0703456789', 'Yamoussoukro', 'Maïs');

INSERT IGNORE INTO stocks (nom, categorie, quantite, unite, seuil_alerte) VALUES
('Semences Maïs',   'Semences',    45,  'kg',    100),
('Engrais NPK',     'Engrais',     12,  'kg',    50),
('Pesticide Bio',   'Pesticides',  156, 'L',     30),
('Semences Manioc', 'Semences',    920, 'kg',    200);

INSERT IGNORE INTO saisons (nom, date_debut, date_fin, active) VALUES
('Grande Saison 2024', '2024-03-01', '2024-08-31', TRUE);
