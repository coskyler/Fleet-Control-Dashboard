CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scans (
    scan_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL DEFAULT 'Untitled Scan',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    voxels INT[] NOT NULL,
    CHECK (mod(coalesce(array_length(voxels, 1),0), 3) = 0) --ensure voxels is a multiple of 3 (representing vector3s)
);

CREATE INDEX IF NOT EXISTS idx_user_scans ON scans(user_id, created_at DESC);