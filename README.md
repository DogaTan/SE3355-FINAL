📌 SE3355 - Car Rental Platform
🚗 Avis Rent A Car - Araç Kiralama Platformu 🚗

Bu proje, React.js (Frontend) ve Node.js + Express + SQLite (Backend) kullanılarak geliştirilmiş bir araç kiralama platformudur.
Google Maps API ile yakın ofisleri gösterebilir, kullanıcıların araçları filtrelemesine ve kiralama işlemlerini gerçekleştirmesine olanak tanır.

📌 Kullanılan Teknolojiler
Kategori	Teknoloji
Frontend	React.js, Google Maps API, Bootstrap
Backend	Node.js, Express.js, SQLite
Veritabanı	SQLite (SQL)
Auth	Passport.js, JWT
📌 Özellikler
✅ Kullanıcı ofis konumlarını harita üzerinde görebilir
✅ Araçları filtreleyebilir (marka, şanzıman, fiyat sıralama vb.)
✅ Kiralama işlemlerini gerçekleştirebilir
✅ Google Maps API ile konum bazlı öneriler alabilir
❌ (Henüz yok) Dil değiştirme desteği (EN & TR)
❌ (Henüz yok) Deploy edilmiş sürüm

📌 Kurulum (Yerel Geliştirme İçin)
1️⃣ Depoyu Klonlayın
bash
Kopyala
Düzenle
git clone https://github.com/DogaTan/SE3355-FINAL.git
cd SE3355-FINAL
2️⃣ Backend Kurulumu
bash
Kopyala
Düzenle
cd carRental_backend
npm install
npm start
3️⃣ Frontend Kurulumu
bash
Kopyala
Düzenle
cd ../carRental_frontend
npm install
npm start

📌 Deploy Durumu 🚨
Şu an Render.com üzerinde deploy edilemedi!

Nedeni:
Root Directory ayarları nedeniyle backend ve frontend ayrı deploy edilemedi.
Bu proje monorepo (tek repoda hem frontend hem backend) yapısında olduğu için Render’ın varsayılan ayarlarına uygun değil.
Gelecekte backend ve frontend ayrı repolara taşınarak tekrar deploy edilebilir.
