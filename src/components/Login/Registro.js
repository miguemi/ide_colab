// Registro.js
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

const Registro = ({ show }) => {
  const navigate = useNavigate();
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registrationError, setRegistrationError] = useState('');

  const handleRegistration = (e) => {
    e.preventDefault();

    if (!newUsername.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setRegistrationError('Por favor, completa todos los campos.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setRegistrationError('Las contraseñas no coinciden.');
      return;
    }

    // Aquí puedes realizar la lógica de registro, por ejemplo, enviar datos al servidor.

    // Después de un registro exitoso, puedes redirigir al usuario a la página de inicio de sesión.
    navigate('/login');
  };

  return (
    <div className={`modal fade ${show ? 'show' : ''}`} id="registroModal" tabIndex="-1" aria-labelledby="registroModalLabel" aria-hidden={!show}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="registroModalLabel">Registro</h5>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleRegistration}>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre de usuario"
                  onChange={(e) => setNewUsername(e.target.value)}
                  value={newUsername}
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Contraseña"
                  onChange={(e) => setNewPassword(e.target.value)}
                  value={newPassword}
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Confirmar contraseña"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  value={confirmPassword}
                />
              </div>
              {registrationError && <p className="text-danger">{registrationError}</p>}
              <button
                type="submit"
                className="btn btn-primary w-100"
              >
                Registrarse
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registro;
