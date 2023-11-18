import React, { useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaGithub } from 'react-icons/fa';
import './Home.scss';

// Importa los estilos específicos de react-toastify para la posición
import 'react-toastify/dist/ReactToastify.css';

const Home = () => {
  const navigate = useNavigate();

  const [meetingId, setMeetingId] = useState('');
  const [username, setUsername] = useState('');

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setMeetingId(id);
    toast.success('¡Se ha creado una nueva sala!', {
      autoClose: 1000, // 1 segundo
    });
  };

  const joinRoom = () => {
    if (!meetingId && !username) {
      toast.error('Se requiere el ID de la sala y el nombre de usuario', {
        autoClose: 2000, // 1.5 segundos
      });
      return;
    }
    if (!meetingId) {
      toast.error('Se requiere el ID de la sala', {
        autoClose: 1000, // 1 segundo
      });
      return;
    }
    if (!username) {
      toast.error('Se requiere el nombre de usuario', {
        autoClose: 1000, // 1 segundo
      });
      return;
    }
    if (meetingId && username) {
      toast.success('Te has unido a la sala', {
        autoClose: 1000, // 1 segundo
      });
      navigate(`/ide/${meetingId}`, {
        state: {
          username,
        },
      });
    }
  };

  const handleInputEnter = (e) => {
    if (e.code === 'Enter') {
      joinRoom();
    }
  };

  return (
      <>
        {/* Configura la posición en la parte superior del centro */}
        <ToastContainer position="top-center" />
  
        <div
          className="d-flex flex-column min-vh-100"
          style={{
            fontFamily: 'Arial, sans-serif',
            backgroundImage: 'url(https://i.imgur.com/TPC8KjL.jpg)', // Agrega la imagen de fondo
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="hom">
            <div>
              <img
                className="homImage"
                src="https://i.imgur.com/imbS8L0.png"
                alt="Logo"
                style={{ maxWidth: '80px', height: 'auto' }}
              />
            </div>
            <span className="textHome">¡Bienvenido! </span>
          </div>
          <div className="homePageWrapper">
            <div className="formWrapper">
              <div style={{ textAlign: 'center' }}>
                <img
                  className="homImage"
                  src="https://i.imgur.com/imbS8L0.png"
                  alt="Logo"
                  style={{ maxWidth: '80px', height: 'auto', margin: 'auto' }}
                />
              </div>
              <p className="text">Conéctate y programa con tu equipo.</p>
              <div className="inputGroup">
                <input
                  type="text"
                  className="inputBox"
                  placeholder="Id de sala"
                  onChange={(e) => setMeetingId(e.target.value)}
                  value={meetingId}
                  onKeyUp={handleInputEnter}
                />
                <input
                  type="text"
                  className="inputBox"
                  placeholder="Nombre usuario"
                  onChange={(e) => setUsername(e.target.value)}
                  value={username}
                  onKeyUp={handleInputEnter}
                />
  
                <button className="joinBtn" onClick={joinRoom}>
                  Unirme
                </button>
                <span className="createInfo">
                  ¿No tienes un ID?&nbsp;
                  <button onClick={createNewRoom} className="createNewBtn">
                    ¡Crea tu ID ahora!
                  </button>
                </span>
              </div>
            </div>
          </div>
          <section className="bg-secondary text-light fixed-bottom w-100 d-flex flex-column align-items-center justify-content-center">
            <div className="container">
              <div className="row">
                <div className="col-12 text-center">
                  <p className="m-0">Manuel Miguel Miguel</p>
                </div>
              </div>
              <div className="row mt-2">
                <div className="col-12 text-center">
                  <a
                    href="https://github.com/miguemi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-light"
                  >
                    <FaGithub /> IDE colaborativo - 2023
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </>
    );
  };

export default Home;
