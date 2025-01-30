import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import LocalStrategy from "passport-local";
import bcrypt from "bcrypt";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import multer from "multer";

const app = express();
const PORT = 5000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // Frontend address
    credentials: true, // Allows sending cookies
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Dosya yükleme için multer
const upload = multer({ dest: "uploads/" });

// Session Ayarları
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // HTTPS kullanmıyorsanız "false"
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// SQLite Bağlantısı
let db;
(async () => {
  db = await open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });

  // Kullanıcılar tablosunu oluştur
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      country TEXT NOT NULL,
      city TEXT NOT NULL,
      photo TEXT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL
    );
  `);

  // Araç Kiralama (rentals) Tablosunu oluştur
  await db.exec(`
    CREATE TABLE IF NOT EXISTS rentals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      pickup_office TEXT NOT NULL,
      return_office TEXT NOT NULL,
      pickup_date TEXT NOT NULL,
      pickup_time TEXT NOT NULL,
      return_date TEXT NOT NULL,
      return_time TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
  `);

  await db.exec(`
 CREATE TABLE IF NOT EXISTS cars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    price INTEGER NOT NULL,
    discountedPrice INTEGER NOT NULL,
    deposit INTEGER NOT NULL,
    mileage INTEGER NOT NULL,
    ageLimit INTEGER NOT NULL,
    transmission TEXT NOT NULL,
    fuelType TEXT NOT NULL,
    discountAmount INTEGER NOT NULL,
    originalPrice INTEGER NOT NULL,
    image TEXT NOT NULL
  );

 `);
 
 // 🏗 Veritabanına Örnek Araçlar Ekleme
await db.exec(`
  INSERT INTO cars (make, model, price, discountedPrice, deposit, mileage, ageLimit, transmission, fuelType, discountAmount, originalPrice, image) VALUES
  ('BMW', '320i', 1000, 950, 2500, 1000, 21, 'Auto', 'Dizel', 50, 1000, 'https://via.placeholder.com/200'),
  ('Mercedes', 'C200', 1200, 1100, 3000, 1200, 21, 'Auto', 'Benzin', 100, 1200, 'https://via.placeholder.com/200'),
  ('Audi', 'A4', 1100, 1050, 2000, 1500, 21, 'Manual', 'Dizel', 50, 1100, 'https://via.placeholder.com/200');
`);

  console.log("Database connected.");
})();



// Passport.js Strategy
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await db.get("SELECT * FROM users WHERE email = ?", [
          email,
        ]);
        if (!user) {
          return done(null, false, { message: "Incorrect email" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ),

  new GoogleStrategy(
    {
      clientID: 500843165766-k50a17ujglcqaaj7gffmpj8krjac6egk.apps.googleusercontent.com,
      clientSecret: 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,
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const user = {
        id: profile.id,
        firstName: profile.displayName,
        photo: profile.photos[0].value,  // Kullanıcının fotoğrafını al
      };
      return done(null, user);
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serialize User:", user);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.get("SELECT * FROM users WHERE id = ?", [id]);
    console.log("Deserialize User:", user);
    done(null, user);
  } catch (error) {
    done(error);
  }
});




// Register Endpoint
app.post("/auth/register", upload.single("photo"), async (req, res) => {
  try {
    const { email, password, country, city, firstName, lastName } = req.body;
    const photo = req.file ? req.file.filename : null;

    if (!email || !password || !country || !city || !firstName || !lastName) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Password must be at least 8 characters, include a number, a special character, and a letter.
    if (!/^(?=.*[0-9])(?=.*[^a-zA-Z0-9])(?=.*[a-zA-Z]).{8,}$/.test(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters, include a number, and a special character.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run(
      `INSERT INTO users (email, password, country, city, photo, firstName, lastName) VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [email, hashedPassword, country, city, photo, firstName, lastName]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "An error occurred during registration" });
  }
});

// Login Endpoint
app.post("/auth/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Authentication error:", err);
      return res.status(500).json({ error: "An error occurred during login." });
    }
    if (!user) {
      console.error("Login failed:", info.message);
      return res.status(401).json({ error: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error("Login session error:", err);
        return res.status(500).json({ error: "Failed to log in user." });
      }
      console.log("User logged in successfully:", user);
      console.log("Session:", req.session);
      console.log("Is Authenticated:", req.isAuthenticated());
      return res.status(200).json({ message: `Welcome, ${user.firstName}!` });
    });
  })(req, res, next);
});


// Logout Endpoint
app.post("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "An error occurred during logout" });
    }
    res.status(200).json({ message: "Logged out successfully" });
  });
});



 app.get("/auth/user-info", (req, res) => {
  console.log("User in session:", req.user);
  console.log("Is Authenticated:", req.isAuthenticated());
  if (req.isAuthenticated()) {
    res.status(200).json({
      firstName: req.user.firstName || req.user.displayName,
      photo: req.user.photo || req.user.picture,
       
    });
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});


// Hata Yönlendirmesi
app.get("/auth/login-failed", (req, res) => {
  res.status(401).json({ error: "Login failed" });
});




// 🚗 Kiralamaya Uygun Araçları Getiren API
app.get("/api/available-cars", async (req, res) => {
  try {
    const { pickupOffice, returnOffice, pickupDate, returnDate } = req.query;

    if (!pickupOffice || !returnOffice || !pickupDate || !returnDate) {
      return res.status(400).json({ error: "Eksik parametreler" });
    }

    // 🔍 Veritabanında araçları ve kiralamaları kontrol et
    const rentedCars = await db.all(
      `SELECT car_id FROM rentals 
      WHERE NOT (
        (return_date < ?) OR (pickup_date > ?)
      )`,
      [pickupDate, returnDate]
    );

    // Kiralanmış araçların ID'lerini al
    const rentedCarIds = rentedCars.map((rental) => rental.car_id);

    // 🏎 Kiralamaya uygun araçları listele
    let query = "SELECT * FROM cars WHERE id NOT IN (?)";
    let params = [rentedCarIds.length > 0 ? rentedCarIds : [-1]]; // Eğer hiç kiralanmış araç yoksa tüm araçlar gelsin

    const availableCars = await db.all(query, params);

    res.json(availableCars);
  } catch (error) {
    console.error("🚨 Uygun araçları getirirken hata oluştu:", error);
    res.status(500).json({ error: "Araç listesi yüklenemedi." });
  }
});

// Araç Kiralama Endpoint
app.post("/api/rent", async (req, res) => {
  try {
    const { pickup_office, return_office, pickup_date, pickup_time, return_date, return_time } = req.body;

    if (!pickup_office || !return_office || !pickup_date || !pickup_time || !return_date || !return_time) {
      return res.status(400).json({ error: "Lütfen tüm alanları doldurun!" });
    }

    await db.run(
      `INSERT INTO rentals (pickup_office, return_office, pickup_date, pickup_time, return_date, return_time)
      VALUES (?, ?, ?, ?, ?, ?);`,
      [pickup_office, return_office, pickup_date, pickup_time, return_date, return_time]
    );

    
  } catch (error) {
    console.error("🚨 Araç kiralama hatası:", error);
    res.status(500).json({ error: "Kiralama sırasında bir hata oluştu." });
  }
});


// // 🛠 Güncellenmiş Araç Verileri
// const cars = [
//   {
//     id: 1, make: "BMW", model: "320i", fuelType: "Dizel", 
//     price: 1000, discountedPrice: 950, deposit: 2500, 
//     mileage: 1000, ageLimit: 21, transmission: "Auto", 
//     discountAmount: 50, originalPrice: 1000,
//     image: "https://via.placeholder.com/200"
//   },
//   {
//     id: 2, make: "Mercedes", model: "C200", fuelType: "Benzin", 
//     price: 1200, discountedPrice: 1100, deposit: 3000, 
//     mileage: 1200, ageLimit: 21, transmission: "Auto", 
//     discountAmount: 100, originalPrice: 1200,
//     image: "https://via.placeholder.com/200"
//   },
//   {
//     id: 3, make: "Audi", model: "A4", fuelType: "Dizel", 
//     price: 1100, discountedPrice: 1050, deposit: 2000, 
//     mileage: 1500, ageLimit: 21, transmission: "Manual", 
//     discountAmount: 50, originalPrice: 1100,
//     image: "https://via.placeholder.com/200"
//   }
// ];

// // Araçları Listeleme Endpoint'i
// app.get("/api/cars", (req, res) => {
//   res.json(cars);
// });

 app.get("/api/cars", async (req, res) => {
   try {
    const cars = await db.all("SELECT * FROM cars");
     res.json(cars);
   } catch (error) {
     console.error("Araçları alırken hata:", error);
     res.status(500).json({ error: "Araç listesi yüklenemedi." });
   }
 });



// Sunucuyu Başlat
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
