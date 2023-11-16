import React, { useState, useRef, useEffect } from 'react';
import Client from '../Client/Client';
import Editor from '../Editor/Editor';
import './Ide.scss';
import toast, { Toaster } from 'react-hot-toast';
import { initSocket } from '../socket';
import ACTIONS from '../Actions';
import {
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from 'react-router-dom';

const Ide = () => {
  const location = useLocation();
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const reactNavigator = useNavigate();
  const { meetingId } = useParams();

  const [clients, setClients] = useState([]);
  const [confirmationVisible, setConfirmationVisible] = useState(false);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));

      function handleErrors(e) {
        toast.error('La conexión del socket falló, inténtalo de nuevo en un momento');
        reactNavigator('/');
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        meetingId,
        username: location.state?.username,
      });

      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} Se unió a la sala.`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      socketRef.current.on(
        ACTIONS.DISCONNECTED,
        ({ socketId, username }) => {
          toast.success(`${username} Abandonó la reunión.`);
          setClients((prev) => {
            return prev.filter(
              (client) => client.socketId !== socketId
            );
          });
        }
      );
    };
    init();
    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, [location.state?.username, meetingId, reactNavigator]);

  async function copyMeetingId() {
    try {
      await navigator.clipboard.writeText(meetingId);
      toast.success('Se copió el ID de la sala con éxito');
    } catch (err) {
      toast.error('No se pudo copiar el ID de la sala, verifique');
    }
  }

  const showConfirmation = () => {
    setConfirmationVisible(true);
  };

  const hideConfirmation = () => {
    setConfirmationVisible(false);
  };

  const handleLeaveRoom = () => {
    hideConfirmation();
    reactNavigator('/');
  };

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <p className='people'>Personas conectadas</p>
          <div className="clientsList">
            {clients.map((client) => (
              <Client
                key={client.socketId}
                username={client.username}
              />
            ))}
          </div>
        </div>
        <button className="copyBtn" onClick={copyMeetingId}>
          Copiar ID de reunión
        </button>
        <button className="leaveBtn" onClick={showConfirmation}>
          Abandonar reunión
        </button>

        {/* Confirmación */}
        {confirmationVisible && (
          <div className="confirmation">
            <p>¿Estás seguro de abadonar la sala?</p>
            <button onClick={handleLeaveRoom}>Sí</button>
            <button onClick={hideConfirmation}>No</button>
          </div>
        )}

        {/* Agrega el componente Toaster para mostrar notificaciones */}
        <Toaster />
      </div>
      <div className="editorWrap">
        <Editor
          socketRef={socketRef}
          meetingId={meetingId}
          onCodeChange={(code) => {
            codeRef.current = code;
          }}
        />
      </div>
    </div>
  );
};

export default Ide;
