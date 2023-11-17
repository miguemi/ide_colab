import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Add Bootstrap CSS

const Client = ({ username }) => {
  // Función para generar un color hexadecimal aleatorio
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Estado para almacenar el color aleatorio
  const [userColor, setUserColor] = useState('');

  // Efecto que se ejecuta solo una vez al montar el componente
  useEffect(() => {
    // Genera un color aleatorio y almacénalo en el estado
    const color = getRandomColor();
    setUserColor(color);
  }, []); // El array vacío asegura que este efecto se ejecute solo una vez

  return (
    <div className="client d-flex align-items-center" style={{ color: userColor }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-person-circle me-2" viewBox="0 0 16 16">
        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
        <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
      </svg>
      <span className="userName">{username}</span>
    </div>
  );
};

export default Client;
