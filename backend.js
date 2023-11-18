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
// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
  console.log(`Servidor backend está corriendo en http://localhost:${port}`);
});
