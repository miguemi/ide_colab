import React, { useEffect, useRef } from 'react'
import Codemirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';
import './Editor.scss';

const Editor = ({ socketRef, meetingId, onCodeChange }) => {
   const editorRef = useRef(null);
   useEffect(() => {
      async function init() {
         editorRef.current = Codemirror.fromTextArea(
            document.getElementById('realtimeEditor'),
            {
               mode: 'javascript',
               theme: 'material',
               autoCloseTags: true,
               autoCloseBrackets: true,
               lineNumbers: true,
               lineWrapping: true,
               matchBrackets: true,
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

   return (
      <textarea id="realtimeEditor" />
   )
}

export default Editor
