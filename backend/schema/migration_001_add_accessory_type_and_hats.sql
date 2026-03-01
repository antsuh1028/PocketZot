-- Add type column to accessories (default 'hat' for existing)
ALTER TABLE accessories ADD COLUMN IF NOT EXISTS type VARCHAR(50) NOT NULL DEFAULT 'hat';

-- Remove Royal and any other extras (keep only Plumber, Merrier, Egg, Crown)
DELETE FROM has_accessory WHERE accessory_id IN (SELECT id FROM accessories WHERE name NOT IN ('Plumber', 'Merrier', 'Egg', 'Crown'));
DELETE FROM accessories WHERE name NOT IN ('Plumber', 'Merrier', 'Egg', 'Crown');

-- Insert Plumber (5), Merrier (5), Egg (10), Crown (25) if not exists
INSERT INTO accessories (name, price, type, image_url, description)
SELECT 'Plumber', 5, 'hat', 'dist/anteaterchar/assets/Plumber.png', 'Plumber hat'
WHERE NOT EXISTS (SELECT 1 FROM accessories WHERE name = 'Plumber');

INSERT INTO accessories (name, price, type, image_url, description)
SELECT 'Merrier', 5, 'hat', 'dist/anteaterchar/assets/Merrier.png', 'Merrier hat'
WHERE NOT EXISTS (SELECT 1 FROM accessories WHERE name = 'Merrier');

INSERT INTO accessories (name, price, type, image_url, description)
SELECT 'Egg', 10, 'hat', 'dist/anteaterchar/assets/Egg.png', 'Egg hat'
WHERE NOT EXISTS (SELECT 1 FROM accessories WHERE name = 'Egg');

INSERT INTO accessories (name, price, type, image_url, description)
SELECT 'Crown', 25, 'hat', 'dist/anteaterchar/assets/Crown.png', 'Crown hat'
WHERE NOT EXISTS (SELECT 1 FROM accessories WHERE name = 'Crown');

-- Set prices for existing
UPDATE accessories SET price = 5 WHERE name = 'Plumber';
UPDATE accessories SET price = 5 WHERE name = 'Merrier';
UPDATE accessories SET price = 10 WHERE name = 'Egg';
UPDATE accessories SET price = 25 WHERE name = 'Crown';
