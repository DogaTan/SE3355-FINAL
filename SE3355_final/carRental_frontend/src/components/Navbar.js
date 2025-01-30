import React, { useState, useEffect } from "react";
import "../assets/styles/Navbar.css";
import logo from "../assets/images/avis-logo.png";


const Navbar = () => {
  const [user, setUser] = useState(null);


   useEffect(() => {
     const fetchUserInfo = async () => {
     try {
       const response = await fetch("http://localhost:5000/auth/user-info", {
         method: "GET",
           credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
          console.log("User Info:", data);
         } else {
           setUser(null);
        }
       } catch (error) {
         console.error("Error fetching user info:", error);
        setUser(null);
       }
     };
  
     fetchUserInfo();
   }, []);



  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        setUser(null);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container">
        <a className="navbar-brand" href="/">
          <img src={logo} alt="AVIS" className="navbar-logo" />
        </a>
        <div className="navbar-right d-flex align-items-center">
          {user ? (
            <div className="user-info d-flex align-items-center">
              {user.photo ? (
                <img src={user.photo} alt="Profile" className="profile-photo nav-photo" />
              ) : (
                <div className="placeholder-photo nav-placeholder">👤</div>
              )}
              <span className="user-name me-4">{user.firstName}</span>
              <button onClick={handleLogout} className="logout-button me-3">
                Çıkış Yap
              </button>
            </div>
          ) : (
            <a href="/login" className="btn me-3">
              Üye Girişi
              <i className="bi bi-box-arrow-in-right ms-3"></i>
            </a>
          )}
          <div className="dropdown">
            <button
              className="btn dropdown-toggle"
              type="button"
              id="languageDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-flag"></i> EN
            </button>
            <ul className="dropdown-menu" aria-labelledby="languageDropdown">
              <li>
                <a className="dropdown-item" href="/">
                  <i className="bi bi-flag"></i> Türkçe
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="/">
                  <i className="bi bi-flag"></i> English
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
