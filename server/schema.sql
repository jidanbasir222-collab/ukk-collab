CREATE DATABASE IF NOT EXISTS ukkprojek;
USE ukkprojek;

-- 1. Tabel Users / Admins
-- NOTE: kolom passwordHash (bukan password), role pakai 'admin'/'user'
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    avatar_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Tabel Categories (Kategori Genre / Event)
-- NOTE: kolom icon & color (backend pakai ini)
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NULL,
    icon VARCHAR(50) DEFAULT 'music',
    color VARCHAR(20) DEFAULT 'pink',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Artists (Kelola Artis)
-- NOTE: kolom genre, instagram, activeEvents, avatarIndex
CREATE TABLE artists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    genre VARCHAR(50) DEFAULT 'SYNTHWAVE',
    instagram VARCHAR(100) NULL,
    activeEvents INT NOT NULL DEFAULT 0,
    avatarIndex INT NOT NULL DEFAULT 0,
    avatar_url VARCHAR(255) NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel Events (Daftar Event / Add Event)
-- NOTE: name/artist/category/date/time/ticketPrice/quota/sold/poster/banner,
-- artist & category berupa teks (bukan FK) karena dikirim sebagai string dari form
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    artist VARCHAR(100) NULL,
    category VARCHAR(50) NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    ticketPrice DECIMAL(12, 2) NOT NULL DEFAULT 0,
    quota INT NOT NULL DEFAULT 5000,
    sold INT NOT NULL DEFAULT 0,
    status ENUM('ACTIVE', 'SOLD OUT', 'CLOSED', 'DRAFT') DEFAULT 'ACTIVE',
    poster VARCHAR(255) NULL,
    banner VARCHAR(255) NULL,
    description TEXT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabel Payments / Transactions (Riwayat Pembayaran)
-- NOTE: kolom orderId, totalBayar, verifiedAt, createdAt; event_id nullable (order bisa dibuat tanpa event id)
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orderId VARCHAR(50) UNIQUE NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NULL,
    event_id INT NULL,
    ticket_qty INT NOT NULL DEFAULT 1,
    totalBayar DECIMAL(12, 2) NOT NULL,
    proof_of_transfer VARCHAR(255) NULL,
    status ENUM('PENDING', 'PAID', 'REJECTED') DEFAULT 'PENDING',
    verifiedAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
);

-- 6. Tabel Activity Logs (Aktivitas Terakhir Dashboard)
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    action_type ENUM('PURCHASE', 'ARTIST_REGISTER', 'EVENT_APPROVED', 'PAYMENT_VERIFIED') NOT NULL,
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
