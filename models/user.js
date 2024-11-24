const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  // Fungsi untuk membuat user baru (registrasi)
  create: (username, password, callback) => {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(query, [username, hashedPassword], callback);
  },

  // Fungsi untuk mencari user berdasarkan username
  findByUsername: (username, callback) => {
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], callback);
  },

  // Fungsi untuk mengecek saldo user
  getBalance: (userId, callback) => {
    const query = 'SELECT balance FROM users WHERE id = ?';
    db.query(query, [userId], callback);
  },

  // Fungsi untuk memperbarui saldo user
  updateBalance: (userId, balance, callback) => {
    const query = 'UPDATE users SET balance = ? WHERE id = ?';
    db.query(query, [balance, userId], callback);
  }
};

module.exports = User;
