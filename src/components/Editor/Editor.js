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
import { Navbar, Button, OverlayTrigger, Tooltip, Modal, ListGroup, FormControl } from 'react-bootstrap';

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
    'es_nuevo = True',
    'lista = [1, 2, 3, 4, 5]',
    'diccionario = {"clave": "valor", "otra_clave": "otro_valor"}',
    'suma = 5 + 3',
    'resta = 7 - 2',
    'multiplicacion = 4 * 6',
    'division = 10 / 2',
    'modulo = 15 % 4',
    'potencia = 2 ** 3',
    'if edad >= 18: print("Eres mayor de edad") else: print("Eres menor de edad")',
    'for num in range(5): print(num)',
    'while edad < 30: edad += 1',
    'def saludar(nombre): print(f"Hola, {nombre}!")',
    'saludar("Juan")',
    'def suma(a, b): return a + b',
    'resultado = suma(3, 4)',
    'mi_lista = [1, 2, 3, 4, 5]',
    'primer_elemento = mi_lista[0]',
    'mi_lista.append(6)',
    'mi_lista.extend([7, 8, 9])',
    'numeros_pares = [num for num in mi_lista if num % 2 == 0]',
    'longitud_lista = len(mi_lista)',
    'for indice, valor in enumerate(mi_lista): print(f"Índice: {indice}, Valor: {valor}")',
    'resultado = "Verdadero" if edad >= 18 else "Falso"',
    'def calcular_cuadrado(x): return x ** 2',
    'cuadrado_3 = calcular_cuadrado(3)',
    'try: resultado = 10 / 0 except ZeroDivisionError as e: print(f"Error: {e}")',
    'class Persona: def __init__(self, nombre, edad): self.nombre = nombre self.edad = edad',
    'def saludar(self): print(f"Hola, soy {self.nombre} y tengo {self.edad} años.")',
    'persona1 = Persona("Ana", 30) persona1.saludar()',
    'numeros = [1, 2, 3, 4, 5]',
    'doble_numeros = [x * 2 for x in numeros]',
    'filtrar_pares = [x for x in numeros if x % 2 == 0]',
    'cuadrados_pares = [x**2 for x in numeros if x % 2 == 0]',
    'print(doble_numeros)',
    'print(filtrar_pares)',
    'print(cuadrados_pares)',
    'texto = "Hola, Mundo!"',
    'mayusculas = texto.upper()',
    'minusculas = texto.lower()',
    'longitud_texto = len(texto)',
    'print(mayusculas)',
    'print(minusculas)',
    'print(longitud_texto)',
    'frutas = ["manzana", "naranja", "plátano"]',
    'for fruta in frutas: print(fruta)',
    'for idx, fruta in enumerate(frutas): print(f"Índice {idx}: {fruta}")',
    'rangos = list(range(5))',
    'print(rangos)',
    'numeros = [1, 2, 3, 4, 5]',
    'suma_total = sum(numeros)',
    'valor_maximo = max(numeros)',
    'valor_minimo = min(numeros)',
    'print(suma_total)',
    'print(valor_maximo)',
    'print(valor_minimo)',
    'cadena = "Python es genial"',
    'palabras = cadena.split()',
    'print(palabras)',
    'frase = " ".join(palabras)',
    'print(frase)',
    'texto = "    Hola, Mundo!    "',
    'texto_limpio = texto.strip()',
    'print(texto_limpio)',
    'nombre = "Juan"',
    'edad = 25',
    'altura = 1.75',
    'informacion = f"Nombre: {nombre}, Edad: {edad}, Altura: {altura}"',
    'print(informacion)',
    'archivo = open("mi_archivo.txt", "w")',
    'archivo.write("Hola, este es mi archivo.")',
    'archivo.close()',
    'with open("mi_archivo.txt", "r") as archivo_lectura:',
    '    contenido = archivo_lectura.read()',
    '    print(contenido)',
    'import math',
    'raiz_cuadrada = math.sqrt(16)',
    'seno_30 = math.sin(math.radians(30))',
    'print(raiz_cuadrada)',
    'print(seno_30)',
    'import random',
    'numero_aleatorio = random.randint(1, 10)',
    'print(numero_aleatorio)',
    'from datetime import datetime',
    'fecha_actual = datetime.now()',
    'print(fecha_actual)',
    'try: resultado = 10 / 0 except ZeroDivisionError as e: print(f"Error: {e}")',
    'class Animal: def __init__(self, nombre): self.nombre = nombre',
    'class Perro(Animal): def hacer_sonido(self): print("Woof!")',
    'mi_perro = Perro("Buddy")',
    'mi_perro.hacer_sonido()',
    'import requests',
    'response = requests.get("https://www.example.com")',
    'contenido_pagina = response.text',
    'print(contenido_pagina)',
    'import json',
    'datos_json = \'{"nombre": "Juan", "edad": 30}\'',
    'diccionario_datos = json.loads(datos_json)',
    'print(diccionario_datos)',
    'nuevo_json = json.dumps(diccionario_datos, indent=2)',
    'print(nuevo_json)',
    'import os',
    'directorio_actual = os.getcwd()',
    'print(directorio_actual)',
    'archivos_en_directorio = os.listdir()',
    'print(archivos_en_directorio)',
    'import time',
    'time.sleep(2)',
    'print("Espera de 2 segundos completada.")',
    'import re',
    'patron = r"\b[A-Za-z]+\\b"',
    'texto = "Hola, esto es una prueba."',
    'coincidencias = re.findall(patron, texto)',
    'print(coincidencias)',
    'from collections import Counter',
    'lista_numeros = [1, 2, 3, 4, 1, 2, 2, 3, 4, 5]',
    'contador = Counter(lista_numeros)',
    'print(contador)',
    'import numpy as np',
    'array_np = np.array([1, 2, 3, 4, 5])',
    'suma_array = np.sum(array_np)',
    'promedio_array = np.mean(array_np)',
    'print(suma_array)',
    'print(promedio_array)',
    'import pandas as pd',
    'datos = {"Nombre": ["Ana", "Juan", "Luis"], "Edad": [25, 30, 35]}',
    'df = pd.DataFrame(datos)',
    'print(df)',
    'import matplotlib.pyplot as plt',
    'x = np.arange(0, 10, 0.1)',
    'y = np.sin(x)',
    'plt.plot(x, y)',
    'plt.xlabel("Tiempo")',
    'plt.ylabel("Amplitud")',
    'plt.title("Gráfico de Seno")',
    'plt.show()',
    'from sklearn.model_selection import train_test_split',
    'from sklearn.linear_model import LinearRegression',
    'X = np.array([[1], [2], [3], [4], [5]])',
    'y = np.array([2, 4, 5, 4, 5])',
    'X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)',
    'modelo = LinearRegression()',
    'modelo.fit(X_train, y_train)',
    'predicciones = modelo.predict(X_test)',
    'print(predicciones)',
    'import tensorflow as tf',
    'mnist = tf.keras.datasets.mnist',
    '(x_train, y_train), (x_test, y_test) = mnist.load_data()',
    'x_train, x_test = x_train / 255.0, x_test / 255.0',
    'model = tf.keras.models.Sequential([',
    '    tf.keras.layers.Flatten(input_shape=(28, 28)),',
    '    tf.keras.layers.Dense(128, activation="relu"),',
    '    tf.keras.layers.Dropout(0.2),',
    '    tf.keras.layers.Dense(10)',
    '])',
    'predictions = model(x_train[:1]).numpy()',
    'print(predictions)',
    'def my_function():',
    'for i in range(5):',
    'print("Hello, World!")',
    'if condition:',
    'while condition:',
    'class MyClass:',
    'def my_function():',
    'for i in range(5): print(i)',
    'print("Hello, World!")',
    'if condition: print("True") else: print("False")',
    'while condition: print("Looping...")',
    'class MyClass: pass',
    'numbers = [1, 2, 3, 4, 5]',
    'squared_numbers = [x**2 for x in numbers]',
    'filtered_numbers = [x for x in numbers if x % 2 == 0]',
    'print(squared_numbers)',
    '//Variables y Tipos de Datos',
    'nombre = "Python"',
    'edad = 25',
    'altura = 1.75',
    'es_nuevo = True',
    'lista = [1, 2, 3, 4, 5]',
    'diccionario = {"clave": "valor", "otra_clave": "otro_valor"}',
    '// Operadores',
    'suma = 5 + 3',
    'resta = 7 - 2',
    'multiplicacion = 4 * 6',
    'division = 10 / 2',
    'modulo = 15 % 4',
    'potencia = 2 ** 3',
    '// Control de Flujo',
    'if edad >= 18:',
    '    print("Eres mayor de edad")',
    'else:',
    '    print("Eres menor de edad")',
    'for num in range(5):',
    '    print(num)',
    'while edad < 30:',
    '    edad += 1',
    '//Funciones',
    'def saludar(nombre):',
    '    print(f"Hola, {nombre}!")',
    'saludar("Juan")',
    'def suma(a, b):',
    '    return a + b',
    'resultado = suma(3, 4)',
    '//Listas y Operaciones',
    'mi_lista = [1, 2, 3, 4, 5]',
    'primer_elemento = mi_lista[0]',
    'mi_lista.append(6)',
    'mi_lista.extend([7, 8, 9])',
    'numeros_pares = [num for num in mi_lista if num % 2 == 0]',
    'longitud_lista = len(mi_lista)',
    '//Bucle for y Enumerate',
    'for indice, valor in enumerate(mi_lista):',
    '    print(f"Índice: {indice}, Valor: {valor}")',
    '//Condicionales',
    'resultado = "Verdadero" if edad >= 18 else "Falso"',
    '//Funciones',
    'def calcular_cuadrado(x):',
    '    return x ** 2',
    'cuadrado_3 = calcular_cuadrado(3)',
    '//Manejo de Errores',
    'try:',
    '    resultado = 10 / 0',
    'except ZeroDivisionError as e:',
    '    print(f"Error: {e}")',
    '//Clases y Objetos',
    'class Persona:',
    '    def __init__(self, nombre, edad):',
    '        self.nombre = nombre',
    '        self.edad = edad',
    '',
    '    def saludar(self):',
    '        print(f"Hola, soy {self.nombre} y tengo {self.edad} años.")',
    '',
    'persona1 = Persona("Ana", 30)',
    'persona1.saludar()',
  
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
      <Navbar bg="info" expand="lg" className="fixed-top">
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
            </OverlayTrigger>{' '}
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
