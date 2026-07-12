import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/landing/Landing";
import LoginPage from "./components/login/Login";
import Modal from "./components/modal/Modal";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, message: "" });
  const showModal = (msg) => setModal({ isOpen: true, message: msg });

  return (
    <BrowserRouter>
      {/* Si el modal está abierto, se renderiza globalmente */}
      {modal.isOpen && (
        <Modal 
          message={modal.message} 
          onClose={() => setModal({ isOpen: false, message: "" })} 
        />
      )}
      
      <Routes>
        <Route 
          path="/" 
          element={
            <LandingPage 
              isLoggedIn={isLoggedIn} 
              onLogout={() => setIsLoggedIn(false)} 
            />
          } 
        />
        
        <Route 
          path="/login" 
          element={
            <LoginPage 
              onLoginSuccess={() => setIsLoggedIn(true)} 
              onError={showModal}
            />
          } 
        />
        <Route 
          path="/buscarTurnos" 
          element={<BuscarTurnos/>} 
        />

        <Route 
          path="/mis-turnos" 
          element={<MisTurnos/>} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;