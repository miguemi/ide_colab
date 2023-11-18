const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pgp = require('pg-promise')();
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 5001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Configura la conexión a PostgreSQL con pg-promise
const db = pgp({
  user: 'postgres',
  host: 'localhost',
  database: 'bd_ide',
  password: 'migue',
  port: 5432,
});

// Ruta para autenticar al usuario
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.oneOrNone('SELECT * FROM usuarios WHERE usuario = $1 AND clave = $2', [username, password]);

    if (result) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
  } catch (error) {
    console.error('Error al autenticar al usuario:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Ruta para registrar un nuevo usuario
app.post('/api/registro', async (req, res) => {
  const { registroUsername, registroPassword } = req.body;

  try {
    // Verificar si el usuario ya existe
    const existingUser = await db.oneOrNone('SELECT * FROM usuarios WHERE usuario = $1', [registroUsername]);

    if (existingUser) {
      res.status(400).json({ success: false, message: 'El nombre de usuario ya está en uso' });
      return;
    }

    // Insertar el nuevo usuario en la base de datos
    await db.none('INSERT INTO usuarios(usuario, clave) VALUES($1, $2)', [registroUsername, registroPassword]);

    // Enviar una respuesta con éxito y un mensaje adicional
    res.json({ success: true, message: 'Registro exitoso' });
  } catch (error) {
    console.error('Error al registrar al usuario:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
  console.log(`Servidor backend está corriendo en http://localhost:${port}`);
});
