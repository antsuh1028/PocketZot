-- Create user table first (can't use "user" unquoted because it's reserved)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    ants INT NOT NULL DEFAULT 0
);

CREATE TABLE anteater (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    health INTEGER NOT NULL DEFAULT 100,
    is_dead BOOLEAN NOT NULL DEFAULT FALSE,
    uid INTEGER NOT NULL,
    CONSTRAINT fk_anteater_user
        FOREIGN KEY (uid)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE accessories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price INT NOT NULL,
    image_url TEXT,
    description TEXT
);

CREATE TABLE has_accessory (
    id SERIAL PRIMARY KEY,
    uid INT NOT NULL,
    accessory_id INT NOT NULL,
    anteater_id INT,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uid) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (accessory_id) REFERENCES accessories(id),
    FOREIGN KEY (anteater_id) REFERENCES anteater(id) ON DELETE SET NULL
);