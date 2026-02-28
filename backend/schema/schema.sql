-- Create user table first (can't use "user" unquoted because it's reserved)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
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

CREATE TABLE ants (
    id SERIAL PRIMARY KEY,
    uid INTEGER NOT NULL UNIQUE,
    count INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (uid) REFERENCES users(id) ON DELETE CASCADE
);