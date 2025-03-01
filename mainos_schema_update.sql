-- Mise à jour du schéma pour intégrer l'API Mainos

-- Ajout d'une colonne pour stocker l'ID du rapport Mainos
ALTER TABLE reports ADD COLUMN mainos_report_id TEXT;

-- Création d'un index pour les recherches efficaces par ID Mainos
CREATE INDEX idx_reports_mainos_id ON reports(mainos_report_id); 