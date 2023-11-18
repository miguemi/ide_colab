import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaGithub } from 'react-icons/fa';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showRegistroModal, setShowRegistroModal] = useState(false);
  const [registroUsername, setRegistroUsername] = useState('');
  const [registroPassword, setRegistroPassword] = useState('');
  const [registroMessage, setRegistroMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError('Por favor, ingresa nombre de usuario y contraseña');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        setError('');
        onLogin(username);
        navigate('/home');
      } else {
        setError(data.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error al enviar la solicitud al servidor:', error);
      setError('Error de conexión');
    }
  };

  const handleRegistro = async () => {
    if (!registroUsername.trim() || !registroPassword.trim()) {
      setRegistroMessage('Por favor, completa todos los campos');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ registroUsername, registroPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setRegistroMessage(data.message || 'Registro exitoso');
        setError('');
        handleCloseRegistroModal();
        // Puedes hacer algo adicional después de un registro exitoso
      } else {
        setRegistroMessage(data.message || '');
        setError(''); // Limpia el mensaje de error global
      }
    } catch (error) {
      console.error('Error al enviar la solicitud al servidor:', error);
      setError('Error de conexión');
    }
  };

  const handleCloseRegistroModal = () => {
    setShowRegistroModal(false);
    setRegistroUsername('');
    setRegistroPassword('');
    setRegistroMessage('');
  };
  const handleShowRegistroModal = () => setShowRegistroModal(true);

  return (
    <div
    className="d-flex flex-column min-vh-100"
    style={{
      fontFamily: 'Arial, sans-serif',
      backgroundImage: `url(https://i.imgur.com/TPC8KjL.jpg)`, // Agrega la imagen de fondo
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  >
      <nav className="navbar navbar-expand-lg navbar-light bg-secondary">
        <a className="navbar-brand" href="/">
          <img
            src="https://i.imgur.com/imbS8L0.png"
            alt="Logo"
            height="30"
            className="d-inline-block align-top"
          />
        </a>
      </nav>

      <div className="flex-grow-1 d-flex justify-content-center align-items-center">
        <div className="card bg-light" style={{ maxWidth: '400px', width: '100%' }}>
          <div className="card-body p-4">
            <h5 className="text-center mb-4">Iniciar Sesión</h5>
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
                <button
                  type="button"
                  className="btn btn-link text-primary font-weight-bold"
                  onClick={handleShowRegistroModal}
                >
                  Regístrate aquí
                </button>
              </p>
            </form>
            <p className="text-center mt-4">
              Este es un IDE colaborativo. Ayuda y ayúdate a crear conocimiento en equipo.
            </p>
          </div>
        </div>
      </div>

            <footer className="bg-secondary text-light text-center py-3 fixed-bottom">
        <p className="m-0">
          Manuel Miguel
          <a href="https://github.com/miguemi" className="ml-2" target="_blank" rel="noopener noreferrer">
            <FaGithub />
          </a>
        </p>
      </footer>



      {/* Modal de Registro */}
      <Modal show={showRegistroModal} onHide={handleCloseRegistroModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Registro</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light">
          <Form>
            <Form.Group controlId="formRegistroUsername">
              <Form.Label>Nombre de usuario</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nombre de usuario"
                onChange={(e) => setRegistroUsername(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formRegistroPassword">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Contraseña"
                onChange={(e) => setRegistroPassword(e.target.value)}
              />
            </Form.Group>
            {registroMessage && <p className="text-danger">{registroMessage}</p>}
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={handleCloseRegistroModal}>
            Cerrar
          </Button>
          <Button variant="primary" onClick={handleRegistro}>
            Registrarse
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Login;
