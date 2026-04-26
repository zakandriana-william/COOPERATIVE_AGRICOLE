-- ============================================================
--  AgriCoop – Script de création de la base de données MySQL
--  Exécuter : mysql -u root -p < sql/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS agricoop
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE agricoop;

-- ── UTILISATEURS (comptes de connexion) ──────────────────────
CREATE TABLE IF NOT EXISTS utilisateurs (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  nom          VARCHAR(100) NOT NULL,
  prenom       VARCHAR(100) NOT NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL,
  role         ENUM('admin','gestionnaire','membre') DEFAULT 'membre',
  actif        BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── MEMBRES (adhérents de la coopérative) ────────────────────
CREATE TABLE IF NOT EXISTS membres (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id  INT NULL,                          -- lien optionnel vers compte
  nom             VARCHAR(100) NOT NULL,
  prenom          VARCHAR(100) NOT NULL,
  email           VARCHAR(150),
  telephone       VARCHAR(20),
  localisation    VARCHAR(200),
  culture         VARCHAR(100),
  statut          ENUM('actif','suspendu','retraite') DEFAULT 'actif',
  date_adhesion   DATE DEFAULT (CURDATE()),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
);

-- ── COTISATIONS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cotisations (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  membre_id   INT NOT NULL,
  montant     DECIMAL(12,2) NOT NULL,
  annee       YEAR NOT NULL,
  date_paiement DATE NOT NULL,
  mode_paiement VARCHAR(50) DEFAULT 'espèces',
  note        TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (membre_id) REFERENCES membres(id) ON DELETE CASCADE
);

-- ── PRODUITS STOCK ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stocks (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nom           VARCHAR(150) NOT NULL,
  categorie     ENUM('Semences','Engrais','Pesticides','Équipements','Autre') DEFAULT 'Autre',
  quantite      DECIMAL(12,3) DEFAULT 0,
  unite         VARCHAR(20) DEFAULT 'kg',
  seuil_alerte  DECIMAL(12,3) DEFAULT 0,
  description   TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── MOUVEMENTS DE STOCK ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS mouvements_stock (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  stock_id    INT NOT NULL,
  type        ENUM('entree','sortie') NOT NULL,
  quantite    DECIMAL(12,3) NOT NULL,
  membre_id   INT NULL,                          -- bénéficiaire si sortie
  fournisseur VARCHAR(200),                      -- si entrée
  date_mouvement DATE NOT NULL,
  note        TEXT,
  created_by  INT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stock_id)  REFERENCES stocks(id)  ON DELETE CASCADE,
  FOREIGN KEY (membre_id) REFERENCES membres(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES utilisateurs(id) ON DELETE SET NULL
);

-- ── SAISONS AGRICOLES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saisons (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nom         VARCHAR(100) NOT NULL,
  date_debut  DATE NOT NULL,
  date_fin    DATE,
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── RÉCOLTES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recoltes (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  membre_id     INT NOT NULL,
  saison_id     INT,
  culture       VARCHAR(100) NOT NULL,
  quantite_kg   DECIMAL(12,3) NOT NULL,
  superficie_ha DECIMAL(8,3) DEFAULT 0,
  date_recolte  DATE NOT NULL,
  note          TEXT,
  created_by    INT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (membre_id)  REFERENCES membres(id)  ON DELETE CASCADE,
  FOREIGN KEY (saison_id)  REFERENCES saisons(id)  ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES utilisateurs(id) ON DELETE SET NULL
);

-- ── TRANSACTIONS FINANCIÈRES ──────────────────────────────────
CREATE TABLE IF NOT EXISTS finances (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  type        ENUM('recette','depense') NOT NULL,
  categorie   VARCHAR(100),
  montant     DECIMAL(14,2) NOT NULL,
  date        DATE NOT NULL,
  description TEXT,
  membre_id   INT NULL,
  created_by  INT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (membre_id)  REFERENCES membres(id)  ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES utilisateurs(id) ON DELETE SET NULL
);

-- ============================================================
--  DONNÉES DE TEST
-- ============================================================

-- Admin par défaut : admin@agricoop.com / Admin1234!
INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role) VALUES
('Admin', 'Système', 'admin@agricoop.com',
 '$2a$10$XvCcYpMHi.9E0PGvdMbnUuKzLHPiJGfPT8FT.iT5gFVXyYAaFQJrK', 'admin'),
('Koné', 'Ibrahim', 'kone@agricoop.com',
 '$2a$10$XvCcYpMHi.9E0PGvdMbnUuKzLHPiJGfPT8FT.iT5gFVXyYAaFQJrK', 'gestionnaire');

-- Membres exemples
INSERT INTO membres (nom, prenom, telephone, localisation, culture, statut) VALUES
('Koné',    'Ibrahim',  '0701234567', 'Bouaké Nord',   'Maïs',    'actif'),
('Diallo',  'Mamadou',  '0702345678', 'Bouaké Sud',    'Manioc',  'actif'),
('Traoré',  'Fatou',    '0703456789', 'Yamoussoukro',  'Maïs',    'actif'),
('Coulibaly','Seydou',  '0704567890', 'Korhogo',       'Mil',     'actif'),
('Bamba',   'Aïcha',    '0705678901', 'Daloa',         'Manioc',  'actif'),
('Ouattara','Moussa',   '0706789012', 'Abidjan Nord',  'Maïs',    'suspendu');

-- Stocks exemples
INSERT INTO stocks (nom, categorie, quantite, unite, seuil_alerte) VALUES
('Semences Maïs',   'Semences',   45,   'kg',    100),
('Semences Manioc', 'Semences',   280,  'kg',    80),
('Engrais NPK',     'Engrais',    12,   'kg',    50),
('Urée 46%',        'Engrais',    320,  'kg',    60),
('Herbicide Total', 'Pesticides', 18,   'litre', 20),
('Machettes',       'Équipements',40,   'unité', 10);

-- Saison active
INSERT INTO saisons (nom, date_debut, date_fin, active) VALUES
('Saison 2024-A', '2024-03-01', '2024-08-31', TRUE),
('Saison 2024-B', '2024-09-01', '2024-12-31', FALSE);

-- Récoltes
INSERT INTO recoltes (membre_id, saison_id, culture, quantite_kg, superficie_ha, date_recolte) VALUES
(1, 1, 'Maïs',   1200, 2.5, '2024-07-15'),
(2, 1, 'Manioc', 3500, 1.8, '2024-07-20'),
(3, 1, 'Maïs',   980,  2.0, '2024-07-18'),
(4, 1, 'Mil',    650,  1.5, '2024-07-22'),
(5, 1, 'Manioc', 2800, 1.2, '2024-07-25');

-- Finances
INSERT INTO finances (type, categorie, montant, date, description) VALUES
('recette',  'Cotisation',     25000, '2024-04-18', 'Cotisation 2024 – Koné Ibrahim'),
('recette',  'Cotisation',     25000, '2024-04-17', 'Cotisation 2024 – Diallo Mamadou'),
('recette',  'Vente récolte', 480000, '2024-04-10', 'Vente maïs campagne 2024-A'),
('depense',  'Achat semences', 85000, '2024-03-05', 'Achat semences maïs – saison A'),
('depense',  'Transport',      32000, '2024-03-10', 'Transport distribution engrais');
