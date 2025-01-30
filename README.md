🚗 Avis Rent A Car - Rental Platform
This project is a car rental platform developed using React.js (Frontend) and Node.js + Express + SQLite (Backend).
It allows users to view nearby rental offices on a map, filter available cars, and complete rental transactions.

📌 Table of Contents
📌 General Information
🛠️ Technologies Used
🚀 Features
💻 Installation
🌐 Deployment Status
📅 Roadmap
🤝 Contributing
📌 General Information
This project allows users to view nearby car rental offices on a map, filter available cars based on various criteria, and complete rental transactions.
However, at the moment, it has not been deployed and does not support multiple languages (EN & TR).

🛠️ Technologies Used
Category	Technology
Frontend	React.js, Bootstrap, Google Maps API
Backend	Node.js, Express.js, SQLite
Database	SQLite
Authentication	Passport.js, JWT
🚀 Features
✅ Displays nearby car rental offices on a map
✅ Filters available cars (by brand, transmission, price, etc.)
✅ Allows users to complete rental transactions
✅ Uses Google Maps API for location-based recommendations
❌ Not deployed (Failed on Render.com)
❌ Does not support language switching (EN & TR)

💻 Installation
1️⃣ Clone the Repository:

bash
Kopyala
Düzenle
git clone https://github.com/DogaTan/SE3355-FINAL.git
cd SE3355-FINAL
2️⃣ Setup the Backend:

bash
Kopyala
Düzenle
cd carRental_backend
npm install
npm start
3️⃣ Setup the Frontend:

bash
Kopyala
Düzenle
cd ../carRental_frontend
npm install
npm start
🌐 Deployment Status 🚨
⚠ This project is currently not deployed!
🔴 Deployment on Render.com failed.

Why?

Render.com does not support monorepo structures well (having both frontend and backend in the same repository).
Render requires separate root directories for frontend and backend, which caused configuration issues.
In the future, separating frontend and backend into different repositories may solve this issue.
