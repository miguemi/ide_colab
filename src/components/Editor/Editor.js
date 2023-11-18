import React, { useEffect, useRef, useState } from 'react';
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
import { Navbar, Button, OverlayTrigger, Tooltip, Modal, ListGroup, FormControl, Dropdown } from 'react-bootstrap';

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

const CodeSuggestionsModal = ({ show, onHide, onSelectCode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const codeSuggestions = [
    'nombre = "Python"',
    'edad = 25',
    'altura = 1.75',
  ];

  const filteredSuggestions = codeSuggestions.filter((code) =>
    code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Sugerencias de Código</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormControl
          type="text"
          placeholder="Buscar código..."
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ListGroup>
          {filteredSuggestions.map((code, index) => (
            <ListGroup.Item key={index} action onClick={() => onSelectCode(code)}>
              {code}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Modal.Body>
    </Modal>
  );
};

const Editor = ({ socketRef, meetingId, onCodeChange }) => {
  const editorRef = useRef(null);
  const [selectedCodeSnippet, setSelectedCodeSnippet] = useState('');
  const [showCodeSuggestionsModal, setShowCodeSuggestionsModal] = useState(false);

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
        scrollbarStyle: null,
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

  const handleCodeSnippetInsert = () => {
    const currentCode = editorRef.current.getValue();
    const cursor = editorRef.current.getCursor();
    const line = editorRef.current.getLine(cursor.line);
    const newCode =
      line.slice(0, cursor.ch) + selectedCodeSnippet + line.slice(cursor.ch);
    editorRef.current.replaceRange(newCode, cursor);
    onCodeChange(editorRef.current.getValue());
    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
      meetingId,
      code: editorRef.current.getValue(),
    });
  };

  const handleShowCodeSuggestionsModal = () => {
    setShowCodeSuggestionsModal(true);
  };

  const handleHideCodeSuggestionsModal = () => {
    setShowCodeSuggestionsModal(false);
  };

  const handleSelectCode = (selectedCode) => {
    setSelectedCodeSnippet(selectedCode);
    handleHideCodeSuggestionsModal();
    const cursor = editorRef.current.getCursor();
    const line = editorRef.current.getLine(cursor.line);
    const newCode = `${line.slice(0, cursor.ch)}${selectedCode}${line.slice(cursor.ch)}`;
    editorRef.current.replaceRange(newCode, cursor);
    onCodeChange(editorRef.current.getValue());
    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
      meetingId,
      code: editorRef.current.getValue(),
    });
  };

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

  const handleSaveButtonClick = async () => {
    try {
      const content = editorRef.current.getValue();
      const options = {
        types: [
          {
            description: 'Archivos Python',
            accept: {
              'text/plain': ['.py'],
            },
          },
        ],
      };

      const handle = await window.showSaveFilePicker(options);
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
    } catch (error) {
      console.error('Error al guardar el archivo:', error);
    }
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

  const handleThemeChange = (selectedTheme) => {
    editorRef.current.setOption('theme', selectedTheme);
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

  return (
    <div>
    <Navbar bg="info" expand="lg" className="fixed-top">
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Navbar.Brand>IDE collab</Navbar.Brand>
        <div className="ml-auto row">
          <div className="col-auto">
            <OverlayTrigger
              placement="bottom"
              delay={{ show: 250, hide: 400 }}
              overlay={(props) => renderTooltip(props, 'Cargar Archivo')}
            >
              <Button variant="primary" size="sm" onClick={handleLoadButtonClick}>
                <FontAwesomeIcon icon={faUpload} />
              </Button>
            </OverlayTrigger>
          </div>
          <div className="col-auto">
            <OverlayTrigger
              placement="bottom"
              delay={{ show: 250, hide: 400 }}
              overlay={(props) => renderTooltip(props, 'Guardar Archivo')}
            >
              <Button variant="success" size="sm" onClick={handleSaveButtonClick}>
                <FontAwesomeIcon icon={faSave} />
              </Button>
            </OverlayTrigger>
          </div>
          <div className="col-auto">
            <OverlayTrigger
              placement="bottom"
              delay={{ show: 250, hide: 400 }}
              overlay={(props) => renderTooltip(props, 'Deshacer')}
            >
              <Button variant="warning" size="sm" onClick={handleUndoButtonClick}>
                <FontAwesomeIcon icon={faUndo} />
              </Button>
            </OverlayTrigger>
          </div>
          <div className="col-auto">
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
          <div className="col-auto">
            <OverlayTrigger
              placement="bottom"
              delay={{ show: 250, hide: 400 }}
              overlay={(props) => renderTooltip(props, 'Fragmentos de código')}
            >
              <Button variant="light" size="sm" onClick={handleShowCodeSuggestionsModal}>
                Fragmentos de código
              </Button>
            </OverlayTrigger>
          </div>
          <div className="col-auto">
            <Dropdown>
              <Dropdown.Toggle variant="light" size="sm">
                Tema
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleThemeChange('material')}>Material</Dropdown.Item>
                <Dropdown.Item onClick={() => handleThemeChange('ambiance')}>Ambiance</Dropdown.Item>
                {/* Agrega más temas según tus necesidades */}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </Navbar.Collapse>
    </Navbar>
      <div className="content" style={{ marginTop: '55px' }}>
        <textarea id="realtimeEditor"></textarea>
      </div>

      <CodeSuggestionsModal
        show={showCodeSuggestionsModal}
        onHide={handleHideCodeSuggestionsModal}
        onSelectCode={handleSelectCode}
      />
    </div>
  );
};

export default Editor;
