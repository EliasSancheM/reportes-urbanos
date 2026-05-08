const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../db');

// Registro
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Generar token de verificación de email
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, is_verified, verification_token) VALUES ($1, $2, $3, false, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, verificationToken]
    );

    // TODO: Aquí deberías integrar Nodemailer o SendGrid para enviar el correo real
    console.log(`\n=========================================\n`);
    console.log(`SIMULACIÓN DE CORREO ENVIADO A: ${email}`);
    console.log(`Haga clic en el siguiente enlace para verificar su cuenta:`);
    console.log(`http://localhost:5173/verify/${verificationToken}`);
    console.log(`\n=========================================\n`);

    res.json({ 
      message: 'Usuario registrado exitosamente. Por favor verifica tu correo electrónico.', 
      user: newUser.rows[0],
      // NOTA: Se devuelve el token solo para propósitos de demostración rápida sin correo
      verificationToken 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor al registrar usuario');
  }
});

// Verificación de email
router.get('/verify/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE verification_token = $1', [token]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Token de verificación inválido o expirado.' });
    }

    await pool.query(
      'UPDATE users SET is_verified = true, verification_token = NULL WHERE verification_token = $1',
      [token]
    );

    res.json({ message: '¡Correo verificado con éxito! Ya puedes iniciar sesión.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor al verificar el correo');
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    const user = userResult.rows[0];
    
    // Check if email is verified
    if (!user.is_verified) {
      return res.status(403).json({ error: 'Por favor verifica tu correo electrónico antes de iniciar sesión.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

module.exports = router;
