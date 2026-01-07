-- USERS
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  profile_image TEXT,
  points INTEGER DEFAULT 0 CHECK (points >= 0)
);

-- CAR GROUPS (e.g. SUV, Electric)
CREATE TABLE IF NOT EXISTS car_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT
);

-- CARS
CREATE TABLE IF NOT EXISTS cars (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  specs TEXT, -- JSON with detailed specs (AC, seats, fuel, etc.)
  price_per_day REAL CHECK (price_per_day >= 0),
  image_url TEXT,
  FOREIGN KEY (group_id) REFERENCES car_groups(id) ON DELETE CASCADE
);

-- BRANCHES (pickup/drop-off locations)
CREATE TABLE IF NOT EXISTS branches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  opening_time TEXT,
  closing_time TEXT,
  phone TEXT
);

-- RESERVATIONS
CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  car_id INTEGER NOT NULL,
  pickup_branch_id INTEGER NOT NULL,
  dropoff_branch_id INTEGER NOT NULL,
  pickup_datetime TEXT NOT NULL,
  dropoff_datetime TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  driver_age INTEGER CHECK (driver_age BETWEEN 18 AND 75),
  status TEXT DEFAULT 'saved' CHECK (status IN ('saved', 'paid', 'cancelled', 'quoted')),
  total_price REAL CHECK (total_price >= 0),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (car_id) REFERENCES cars(id),
  FOREIGN KEY (pickup_branch_id) REFERENCES branches(id),
  FOREIGN KEY (dropoff_branch_id) REFERENCES branches(id)
);

-- SERVICES (extra options like GPS, insurance)
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL CHECK (price >= 0),
  category TEXT NOT NULL -- e.g. 'fuel', 'insurance', 'equipment'
);

-- RESERVATION ↔ SERVICES (many-to-many)
CREATE TABLE IF NOT EXISTS reservation_services (
  reservation_id INTEGER,
  service_id INTEGER,
  PRIMARY KEY (reservation_id, service_id),
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reservation_id INTEGER NOT NULL,
  payment_method TEXT NOT NULL, -- e.g. 'credit', 'location'
  status TEXT CHECK (status IN ('saved', 'paid', 'cancelled', 'quoted')) NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
);

-- INVOICES
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reservation_id INTEGER NOT NULL,
  invoice_url TEXT NOT NULL,
  issued_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id)
);

-- REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  stars INTEGER CHECK (stars BETWEEN 1 AND 5),
  comment TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- POINTS
CREATE TABLE IF NOT EXISTS points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  reservation_id INTEGER NOT NULL,
  earned_points INTEGER DEFAULT 0 CHECK (earned_points >= 0),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (reservation_id) REFERENCES reservations(id)
);

-- INVOICES
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reservation_id INTEGER NOT NULL,
  invoice_url TEXT NOT NULL,
  issued_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
);
