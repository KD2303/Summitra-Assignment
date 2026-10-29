-- Smart Event Booking System (Summitra)
-- Database Schema & Initial Seed Data

CREATE DATABASE IF NOT EXISTS event_booking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE event_booking;

-- Drop tables in reverse order of foreign keys
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS ticket_categories;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS admins;

-- Admins Table
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(200) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  date DATETIME NOT NULL,
  total_seats INT NOT NULL CHECK (total_seats >= 0),
  available_seats INT NOT NULL CHECK (available_seats >= 0),
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  img VARCHAR(500),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_date (date),
  INDEX idx_location (location),
  FULLTEXT idx_search (title, description)
) ENGINE=InnoDB;

-- Ticket Categories Table (Optional Tiered Pricing: Early Bird, Standard, VIP)
CREATE TABLE ticket_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  name VARCHAR(60) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  seat_limit INT NULL,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  INDEX idx_event_cat (event_id)
) ENGINE=InnoDB;

-- Bookings Table
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  category_id INT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(200) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  total_amount DECIMAL(10,2) NOT NULL,
  booking_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('confirmed','cancelled') NOT NULL DEFAULT 'confirmed',
  idempotency_key VARCHAR(100) NULL UNIQUE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES ticket_categories(id) ON DELETE SET NULL,
  INDEX idx_event (event_id),
  INDEX idx_email (email)
) ENGINE=InnoDB;

-- Seed Default Admin
-- Password is 'admin123' (bcrypt hash with cost factor 10)
INSERT INTO admins (email, password_hash) VALUES 
('admin@summitra.com', '$2b$10$wEkgc3q.TzMv1Qf08f1vSuJdg4i7P5bA5Kmsr5tKq2YFp.hV5XU6i')
ON DUPLICATE KEY UPDATE email=email;

-- Seed Sample Events
INSERT INTO events (id, title, description, location, date, total_seats, available_seats, price, img) VALUES
(1, 'India AI & Deep Tech Summit 2026', 'Join pioneering AI researchers, founders, and engineers exploring next-generation foundation models, autonomous agents, and production neural architectures. Keynotes from industry luminaries.', 'Bengaluru, Karnataka (BIEC Bengaluru)', '2026-11-15 09:00:00', 350, 48, 299.00, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'),
(2, 'NextGen Design Systems & Spatial UI', 'A masterclass symposium on scalable tokens, WCAG 2.2 accessibility, fluid motion, micro-interactions, and spatial design patterns for modern web ecosystems.', 'Mumbai, Maharashtra (Jio World Convention Centre, BKC)', '2026-11-20 10:00:00', 200, 12, 189.00, 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80'),
(3, 'Cloud Native & Distributed Systems India', 'Architecting resilient multi-cloud architectures, Kubernetes orchestration at scale, low-latency edge computing, and zero-trust security postures.', 'New Delhi (Bharat Mandapam, Pragati Maidan)', '2026-12-05 08:30:00', 500, 185, 249.00, 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80'),
(4, 'Summitra Founders & Tech Leadership Conclave', 'An exclusive evening connecting elite technology founders, venture partners, and visionary operators shaping the future of global enterprise and intelligence.', 'Hyderabad, Telangana (HICC Novotel, HITEC City)', '2026-12-12 18:00:00', 120, 4, 499.00, 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80'),
(5, 'Full-Stack Web Performance & Edge Architecture', 'Deep-dive into Vite, React Server Components, WebAssembly, edge caching, real-time WebSockets, and sub-second p95 latency optimization.', 'Pune, Maharashtra (Balewadi High Street Center)', '2026-12-18 09:30:00', 250, 92, 149.00, 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80'),
(6, 'Cybersecurity & Zero Trust Architecture Congress', 'Live threat mitigation war rooms, cryptosystems, enterprise hardening, and compliance governance for mission-critical digital infrastructure.', 'Chennai, Tamil Nadu (Chennai Trade Centre, Nandambakkam)', '2027-01-14 09:00:00', 300, 0, 279.00, 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80');

-- Seed Ticket Categories
INSERT INTO ticket_categories (id, event_id, name, price, seat_limit) VALUES
(1, 1, 'Early Bird Access', 249.00, 100),
(2, 1, 'Standard Admission', 299.00, 200),
(3, 1, 'VIP Executive Pass', 599.00, 50),
(4, 2, 'Early Bird Access', 149.00, 50),
(5, 2, 'Standard Admission', 189.00, 120),
(6, 2, 'VIP & Workshop Pass', 349.00, 30),
(7, 3, 'Standard Pass', 249.00, 400),
(8, 3, 'VIP Backstage Pass', 499.00, 100),
(9, 4, 'Executive Table Seat', 499.00, 120),
(10, 5, 'Developer Pass', 149.00, 200),
(11, 5, 'VIP All-Access', 299.00, 50),
(12, 6, 'Full Congress Pass', 279.00, 300);
