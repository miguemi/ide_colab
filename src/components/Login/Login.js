import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError('Por favor, ingresa nombre de usuario y contraseña');
      return;
    }

    // Verifica las credenciales
    if (username === 'migue' && password === 'miguel') {
      setError('');
      onLogin(username);

      // Redirige a la página Home después del inicio de sesión exitoso
      navigate('/home');
    } else {
      setError('Credenciales incorrectas. Por favor, verifica tu nombre de usuario y contraseña.');
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex flex-column" style={{ backgroundImage: 'url("tu-imagen-de-fondo.jpg")', backgroundSize: 'cover' }}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container">
        <a className="navbar-brand" href="/">
        <img
          src="https://i.imgur.com/imbS8L0.png"
          alt="Tu Logo"
          style={{ maxWidth: '60px', height: 'auto' }}
        />
      </a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <a className="nav-link" href="/">Inicio</a>
              </li>
              {/* Agrega más elementos de menú según tus necesidades */}
            </ul>
          </div>
        </div>
      </nav>

      {/* Contenido del centro */}
      <div className="flex-grow-1 d-flex justify-content-center align-items-center">
        <div className="card">
          <div className="card-body">
            <h2 className="text-center mb-4">Iniciar Sesión</h2>
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre de usuario"
                  onChange={(e) => setUsername(e.target.value)}
                  value={username}
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Contraseña"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
              </div>
              {error && <p className="text-danger">{error}</p>}
              <button type="submit" className="btn btn-success w-100">
                Iniciar sesión
              </button>
              <p className="mt-3">
                ¿No tienes una cuenta?{' '}
                <a href="#registro" data-toggle="modal" data-target="#registroModal">
                  Regístrate aquí
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-secondary text-center py-3 fixed-bottom w-100">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <a
                href="https://github.com/miguemi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark"
              >
                <i className="bi bi-github"></i> {' '} IDE colaborativo - 2023
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
