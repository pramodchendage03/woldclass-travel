-- Worldclass-travel Supabase Schema

-- 1. Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    site_name TEXT DEFAULT 'WorldClass Travel',
    primary_color TEXT DEFAULT '#1e40af',
    secondary_color TEXT DEFAULT '#fbbf24',
    font_family TEXT DEFAULT 'Inter',
    logo TEXT DEFAULT 'https://picsum.photos/seed/travel-logo/200/80',
    seo_title TEXT DEFAULT 'WorldClass Travel - Explore the World',
    seo_description TEXT DEFAULT 'Premium international travel agency platform.',
    upi_id TEXT DEFAULT '7387625315-2@ybl',
    qr_code TEXT DEFAULT '',
    merchant_name TEXT DEFAULT 'WorldClass Travel',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Site Content Table
CREATE TABLE IF NOT EXISTS site_content (
    id TEXT PRIMARY KEY DEFAULT 'default',
    home_hero_title TEXT DEFAULT 'Discover Your Next Adventure',
    home_hero_subtitle TEXT DEFAULT 'Experience the world like never before with our curated luxury travel packages.',
    home_hero_image TEXT DEFAULT 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1920&q=80',
    about_title TEXT DEFAULT 'Our Story',
    about_content TEXT DEFAULT 'WorldClass Travel was founded with a simple mission: to make global exploration accessible and luxurious for everyone.',
    about_image TEXT DEFAULT 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Destinations Table
CREATE TABLE IF NOT EXISTS destinations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    image TEXT,
    images JSONB DEFAULT '[]',
    content TEXT,
    type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    content TEXT,
    date TEXT,
    author TEXT,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Services Table
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    userId TEXT,
    destinationId TEXT,
    destinationName TEXT,
    guests INTEGER,
    date TEXT,
    totalPrice NUMERIC,
    userEmail TEXT,
    userName TEXT,
    status TEXT DEFAULT 'pending',
    paymentStatus TEXT DEFAULT 'Pending',
    paidAmount NUMERIC DEFAULT 0,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Inquiries Table
CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT,
    email TEXT,
    subject TEXT,
    message TEXT,
    status TEXT DEFAULT 'new',
    replies JSONB DEFAULT '[]',
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    bookingId TEXT,
    userId TEXT,
    userEmail TEXT,
    amount NUMERIC,
    type TEXT,
    method TEXT,
    bankName TEXT,
    upiId TEXT,
    status TEXT DEFAULT 'Success',
    last4 TEXT,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Newsletter Table
CREATE TABLE IF NOT EXISTS newsletter (
    email TEXT PRIMARY KEY,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initial Data
INSERT INTO site_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;
INSERT INTO site_content (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

INSERT INTO destinations (id, name, description, price, image, type) VALUES 
('1', 'Santorini, Greece', 'Beautiful white buildings and blue domes.', 1200, 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80', 'Beach'),
('2', 'Kyoto, Japan', 'Historic temples and stunning gardens.', 1500, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', 'Cultural'),
('3', 'Swiss Alps, Switzerland', 'Majestic mountains and luxury ski resorts.', 2000, 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&w=800&q=80', 'Adventure')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title, description, icon) VALUES 
('1', 'Travel Planning', 'Customized itineraries tailored to your preferences.', 'Map'),
('2', 'Visa Assistance', 'Hassle-free visa processing for all countries.', 'FileText'),
('3', 'Hotel Booking', 'Exclusive deals at the world''s finest hotels.', 'Hotel')
ON CONFLICT (id) DO NOTHING;

INSERT INTO blog_posts (id, title, content, date, author, image) VALUES 
('1', 'Top 10 Travel Tips for 2026', 'Traveling in 2026 is all about sustainability and local experiences...', '2026-03-20', 'Travel Expert', 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (id) DO NOTHING;

-- Initial Users (Passwords are hashed)
-- admin@worldclass.travel / admin123
-- chendagepramod@gmail.com / user123
INSERT INTO users (id, email, password, role, name) VALUES 
('admin', 'admin@worldclass.travel', '$2b$10$em7CLdj7hGJK9kSdwSZvmOtFyLl4fxq9EzpOoWreNohL7I6LJCUX.', 'admin', 'Admin User'),
('1774499044771', 'chendagepramod@gmail.com', '$2b$10$Ts961Ztz0hchjWVZ/y6j5eF/FNxCc7dwdNxTcrDeme31n2C81pX9e', 'user', 'Pramod')
ON CONFLICT (id) DO NOTHING;
