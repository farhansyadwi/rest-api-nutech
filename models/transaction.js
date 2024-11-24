const db = require('../config/db');

const Transaction = {
  // Fungsi untuk mencatat transaksi
  create: (userId, type, amount, callback) => {
    const query = 'INSERT INTO transactions (user_id, type, amount) VALUES (?, ?, ?)';
    db.query(query, [userId, type, amount], callback);
  }
};

module.exports = Transaction;
