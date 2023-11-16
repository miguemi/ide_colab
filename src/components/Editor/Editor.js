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

import ACTIONS from '../Actions';
import './Editor.scss';

const getCustomHint = (cm) => {
  const cursor = cm.getCursor();
  const token = cm.getTokenAt(cursor);
  const word = token.string;

  // Obtén las palabras del contenido actual del editor
  const allWords = cm.getValue().match(/[\w\d_]+/g) || [];

  // Lista de palabras reservadas
  const customReservedWords = [
    'num_estudainte',
    'arrayt',
    // Agrega más palabras reservadas aquí
  ];

  // Filtra las palabras sugeridas basándose en la palabra actual y excluyendo las reservadas
  const suggestions = allWords.filter((w) => w.startsWith(word) && !customReservedWords.includes(w));

  return {
    list: suggestions,
    from: { line: cursor.line, ch: token.start },
    to: { line: cursor.line, ch: token.end },
  };
};

const Editor = ({ socketRef, meetingId, onCodeChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    async function init() {
      editorRef.current = CodeMirror.fromTextArea(
        document.getElementById('realtimeEditor'),
        {
          mode: 'python',
          theme: 'material',
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
          lineWrapping: true,
          matchBrackets: true,
          extraKeys: {
            'Ctrl-Space': (cm) => {
              // Utiliza la función personalizada para obtener sugerencias
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
            hint: getCustomHint, // Utiliza la función personalizada
          },
        }
      );

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

  return <textarea id="realtimeEditor" />;
};

export default Editor;
