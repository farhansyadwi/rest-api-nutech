const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const router = express.Router();

// Endpoint untuk registrasi
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password wajib diisi.' });
  }

  User.create(username, password, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Terjadi kesalahan saat registrasi.' });
    }
    res.status(201).json({ message: 'Registrasi berhasil', userId: result.insertId });
  });
});

// Endpoint untuk login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password wajib diisi.' });
  }

  User.findByUsername(username, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Terjadi kesalahan.' });
    }
    if (results.length === 0) {
      return res.status(400).json({ message: 'Username tidak ditemukan.' });
    }

    const user = results[0];
    if (bcrypt.compareSync(password, user.password)) {
      res.status(200).json({ message: 'Login berhasil', userId: user.id });
    } else {
      res.status(400).json({ message: 'Password salah.' });
    }
  });
});

module.exports = router;
