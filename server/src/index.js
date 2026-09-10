require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Root greeting
app.get('/', (req, res) => {
  res.json({
    app: 'GuaraniApp API Backend',
    description: 'Plataforma interactiva de aprendizaje de Guaraní Oriental Boliviano',
    mascot: 'Aguará el zorro chaqueño',
    endpoints: [
      '/api/health',
      '/api/auth/register',
      '/api/auth/login',
      '/api/auth/guest',
      '/api/units',
      '/api/lessons/:id/exercises',
      '/api/lessons/:id/complete',
      '/api/stories',
      '/api/leagues',
      '/api/shop',
      '/api/user/profile'
    ]
  });
});

// Error handling middleware (Foolproof)
app.use((err, req, res, next) => {
  console.error('Error en servidor Express:', err);
  res.status(500).json({
    success: false,
    message: 'Ocurrió un error inesperado en el servidor, pero tus datos están a salvo.',
    error: err.message
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🚀 GuaraniApp Backend escuchando en http://localhost:${PORT}`);
  console.log(`🦊 Mascota activa: Aguará (Zorro Chaqueño con sombrero de saó)`);
  console.log(`🌿 Cultura: Guaraní Oriental Boliviano (Ava, Izoceño, Simba)`);
  console.log(`====================================================`);
});
