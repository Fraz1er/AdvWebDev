-- Create submissions table for Task J form data
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    booking_date DATE NOT NULL,
    purpose TEXT NOT NULL,
    accept_terms BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create resources table for Task I page
CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT,
    description TEXT,
    status TEXT DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for resources
INSERT INTO resources (name, type, description, status) VALUES
    ('Conference Room A', 'Meeting Room', 'Large room with projector, seats 20 people', 'available'),
    ('MacBook Pro', 'Laptop', '16-inch M3 Pro, 512GB', 'in-use'),
    ('4K Projector', 'AV Equipment', 'HDMI compatible, 4000 lumens', 'available'),
    ('Whiteboard', 'Office Supply', 'Mobile whiteboard, 4x6 feet', 'available')
ON CONFLICT (id) DO NOTHING;

-- Insert sample submissions
INSERT INTO submissions (name, email, booking_date, purpose, accept_terms) VALUES
    ('John Doe', 'john@example.com', '2026-04-10', 'Team meeting discussion', true),
    ('Jane Smith', 'jane@example.com', '2026-04-15', 'Client presentation', true)
ON CONFLICT (id) DO NOTHING;