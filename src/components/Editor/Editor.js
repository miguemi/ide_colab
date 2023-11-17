import React, { useEffect, useRef } from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/mode/python/python';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/display/placeholder';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/selection/active-line';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faSave, faUndo, faRedo } from '@fortawesome/free-solid-svg-icons';

import ACTIONS from '../Actions';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';

const getCustomHint = (cm) => {
  const cursor = cm.getCursor();
  const token = cm.getTokenAt(cursor);
  const word = token.string;

  const allWords = cm.getValue().match(/[\w\d_]+/g) || [];

  const customReservedWords = ['num_estudiante', 'arrayt']; // Agrega más palabras reservadas aquí

  const suggestions = allWords.filter((w) => w.startsWith(word) && !customReservedWords.includes(w));

  return {
    list: suggestions,
    from: { line: cursor.line, ch: token.start },
    to: { line: cursor.line, ch: token.end },
  };
};

const renderTooltip = (props, text) => (
  <Tooltip id="button-tooltip" {...props}>
    {text}
  </Tooltip>
);

const Editor = ({ socketRef, meetingId, onCodeChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    async function init() {
      editorRef.current = CodeMirror.fromTextArea(document.getElementById('realtimeEditor'), {
        mode: 'python',
        theme: 'material',
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
        lineWrapping: true,
        matchBrackets: true,
        scrollbarStyle: null, // Desactivar el scrollbar
        extraKeys: {
          'Ctrl-Space': (cm) => {
            cm.showHint({
              hint: getCustomHint,
              completeSingle: false,
            });
          },
        },
        lint: true,
        styleActiveLine: true,
        hintOptions: {
          completeSingle: false,
          hint: getCustomHint,
        },
      });

      // Resto de la configuración de CodeMirror
      editorRef.current.on('change', (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== 'setValue') {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            meetingId,
            code,
          });
        }
      });

      editorRef.current.on('cursorActivity', () => {
        const cursorPos = editorRef.current.getCursor();
        const cursorCoords = editorRef.current.charCoords(cursorPos);
        const cursorElement = document.createElement('div');
        cursorElement.className = 'cursor-marker';
        cursorElement.style.height = `${cursorCoords.bottom - cursorCoords.top}px`;
        cursorElement.style.left = `${cursorCoords.left}px`;
        editorRef.current.addWidget(cursorPos, cursorElement, false);
      });
    }

    init();
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }
    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);

  const handleLoadButtonClick = async () => {
    try {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.py';
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          const content = await readFileAsync(file);
          editorRef.current.setValue(content);
          onCodeChange(content);
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            meetingId,
            code: content,
          });
        }
      });
      fileInput.click();
    } catch (error) {
      console.error('Error al cargar el archivo:', error);
    }
  };

  const handleSaveButtonClick = () => {
    const content = editorRef.current.getValue();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'codigo.py');
  };

  const handleUndoButtonClick = () => {
    editorRef.current.undo();
    const code = editorRef.current.getValue();
    onCodeChange(code);
    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
      meetingId,
      code,
    });
  };

  const handleRedoButtonClick = () => {
    editorRef.current.redo();
    const code = editorRef.current.getValue();
    onCodeChange(code);
    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
      meetingId,
      code,
    });
  };

  const readFileAsync = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsText(file);
    });
  };

  const saveAs = (blob, fileName) => {
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <Navbar bg="warning" expand="lg" className="fixed-top">
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Navbar.Brand>IDE collab</Navbar.Brand>
          <div className="ml-auto">
            <OverlayTrigger
              placement="bottom"
              delay={{ show: 250, hide: 400 }}
              overlay={(props) => renderTooltip(props, 'Cargar Archivo')}
            >
              <Button variant="primary" size="sm" onClick={handleLoadButtonClick}>
                <FontAwesomeIcon icon={faUpload} />
              </Button>
            </OverlayTrigger>{' '}
            <OverlayTrigger
              placement="bottom"
              delay={{ show: 250, hide: 400 }}
              overlay={(props) => renderTooltip(props, 'Guardar Archivo')}
            >
              <Button variant="success" size="sm" onClick={handleSaveButtonClick}>
                <FontAwesomeIcon icon={faSave} />
              </Button>
            </OverlayTrigger>{' '}
            <OverlayTrigger
              placement="bottom"
              delay={{ show: 250, hide: 400 }}
              overlay={(props) => renderTooltip(props, 'Deshacer')}
            >
              <Button variant="warning" size="sm" onClick={handleUndoButtonClick}>
                <FontAwesomeIcon icon={faUndo} />
              </Button>
            </OverlayTrigger>{' '}
            <OverlayTrigger
              placement="bottom"
              delay={{ show: 250, hide: 400 }}
              overlay={(props) => renderTooltip(props, 'Rehacer')}
            >
              <Button variant="danger" size="sm" onClick={handleRedoButtonClick}>
                <FontAwesomeIcon icon={faRedo} />
              </Button>
            </OverlayTrigger>
          </div>
        </Navbar.Collapse>
      </Navbar>
      <div className="content" style={{ marginTop: '55px' }}>
        {/* Ajusta el valor del marginTop según la altura del Navbar */}
        <textarea id="realtimeEditor"></textarea>
      </div>
    </div>
  );
};

export default Editor;
