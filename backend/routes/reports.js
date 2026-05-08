const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Obtener todos los reportes
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT r.*, u.name as user_name
      FROM reports r 
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// Crear un reporte
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  const { title, description, category, lat, lng } = req.body;
  const user_id = req.user.id;

  try {
    let imageUrl = null;

    if (req.file) {
      // Subir a Cloudinary
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const cldRes = await cloudinary.uploader.upload(dataURI, {
        resource_type: "auto",
        folder: "reportes_urbanos",
      });
      imageUrl = cldRes.secure_url;
    }

    const query = `
      INSERT INTO reports (user_id, title, description, category, lat, lng, image_url) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *
    `;
    const values = [user_id, title, description, category, lat, lng, imageUrl];
    const newReport = await pool.query(query, values);

    res.json(newReport.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// Actualizar estado (solo admin)
router.put('/:id/status', authMiddleware, async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }

  try {
    const query = `
      UPDATE reports 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

module.exports = router;
