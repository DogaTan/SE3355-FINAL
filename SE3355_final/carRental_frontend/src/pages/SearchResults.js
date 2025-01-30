import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // URL'deki parametreleri okumak için
import Navbar from "../components/Navbar";

const SearchResults = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [cars, setCars] = useState([]);

  // 📌 Home.js'den gelen parametreleri alıyoruz
  const pickupOffice = queryParams.get("pickupOffice");
  const returnOffice = queryParams.get("returnOffice");
  const pickupDate = queryParams.get("pickupDate");
  const returnDate = queryParams.get("returnDate");

  useEffect(() => {
    fetch(
      `http://localhost:5000/api/available-cars?pickupOffice=${pickupOffice}&returnOffice=${returnOffice}&pickupDate=${pickupDate}&returnDate=${returnDate}`
    )
      .then((res) => res.json())
      .then((data) => setCars(data))
      .catch((err) => console.error("Araçlar yüklenemedi:", err));
  }, [pickupOffice, returnOffice, pickupDate, returnDate]);

  return (
    <div>
      <Navbar />
      <section className="searchResults-section bg-dark text-white py-4">
        <div className="container mt-4">
          <h2>Kiralamaya Uygun Araçlar</h2>
          <div className="row">
            {cars.length > 0 ? (
              cars.map((car) => (
                <div key={car.id} className="col-md-4">
                  <div className="card">
                    <img src={car.image} alt={car.make} className="card-img-top" />
                    <div className="card-body">
                      <h5 className="card-title">
                        {car.make} - {car.model}
                      </h5>
                      <p>Fiyat: {car.price} TL</p>
                      <p>Şanzıman: {car.transmission}</p>
                      <button className="btn btn-primary">Hemen Kirala</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Bu tarihlerde uygun araç bulunamadı.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SearchResults;
