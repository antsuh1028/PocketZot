-- Add type column to accessories (default 'hat' for existing)
ALTER TABLE accessories ADD COLUMN IF NOT EXISTS type VARCHAR(50) NOT NULL DEFAULT 'hat';

-- Set all hats to price 1 ant (optional: adjust existing)
UPDATE accessories SET price = 1 WHERE type = 'hat';

-- Insert Plumber and Merrier hats (1 ant each) if not exists
INSERT INTO accessories (name, price, type, image_url, description)
SELECT 'Plumber', 1, 'hat', 'dist/anteaterchar/assets/Plumber.png', 'Plumber hat'
WHERE NOT EXISTS (SELECT 1 FROM accessories WHERE name = 'Plumber');

INSERT INTO accessories (name, price, type, image_url, description)
SELECT 'Merrier', 1, 'hat', 'dist/anteaterchar/assets/Merrier.png', 'Merrier hat'
WHERE NOT EXISTS (SELECT 1 FROM accessories WHERE name = 'Merrier');
