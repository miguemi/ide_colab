import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Home from "./components/Home/Home";
import Ide from "./components/Ide/Ide";
import Login from "./components/Login/Login";
import './App.scss';

function App() {
  const handleLogin = (username) => {
    // Lógica para el inicio de sesión, por ejemplo, guardar el usuario en el estado global.
    console.log('Usuario logueado:', username);
  };
  return (
    <>
      <div className="toast">
        <Toaster pposition="top-center"
          toastOptions={{
            success: {
              style: {
                background: '0',
                border: '1px solid #a6a6a6',
                borderRadius: '2px',
                color: '#a6a6a6',
                fontSize: '13px',
                padding: '4px',
                letterSpacing: '1px',
              },
            },
            error: {
              style: {
                background: '0',
                border: '1px solid #a6a6a6',
                borderRadius: '2px',
                color: '#a6a6a6',
                fontSize: '13px',
                padding: '4px',
                letterSpacing: '1px',
              },
            },
          }}>
        </Toaster>
      </div>
      <Routes>
        <Route
          path="/"
          element={<Login onLogin={handleLogin} />}
        />
        <Route path="/home" element={<Home />} />
        <Route path="/ide/:meetingId" element={<Ide />} />
      </Routes>
    </>
  );
}

export default App;
