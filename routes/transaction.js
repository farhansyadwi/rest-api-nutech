const express = require('express');
const User = require('../models/user');
const Transaction = require('../models/transaction');
const router = express.Router();

// Endpoint untuk cek saldo
router.get('/balance/:userId', (req, res) => {
  const userId = req.params.userId;

  User.getBalance(userId, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Terjadi kesalahan.' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }
    res.status(200).json({ balance: results[0].balance });
  });
});

// Endpoint untuk top up saldo
router.post('/topup', (req, res) => {
  const { userId, amount } = req.body;

  if (!userId || !amount) {
    return res.status(400).json({ message: 'UserId dan amount wajib diisi.' });
  }

  User.getBalance(userId, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Terjadi kesalahan.' });
    }

    const currentBalance = results[0].balance;
    const newBalance = currentBalance + amount;

    User.updateBalance(userId, newBalance, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Terjadi kesalahan saat topup.' });
      }

      Transaction.create(userId, 'topup', amount, (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Terjadi kesalahan saat mencatat transaksi.' });
        }
        res.status(200).json({ message: 'Topup berhasil', newBalance: newBalance });
      });
    });
  });
});

// Endpoint untuk transaksi (pulsa, voucher, dll)
router.post('/transaction', (req, res) => {
  const { userId, amount, type } = req.body;

  if (!userId || !amount || !type) {
    return res.status(400).json({ message: 'UserId, amount, dan type wajib diisi.' });
  }

  User.getBalance(userId, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Terjadi kesalahan.' });
    }

    const currentBalance = results[0].balance;
    if (currentBalance < amount) {
      return res.status(400).json({ message: 'Saldo tidak cukup.' });
    }

    const newBalance = currentBalance - amount;

    User.updateBalance(userId, newBalance, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Terjadi kesalahan saat transaksi.' });
      }

      Transaction.create(userId, type, amount, (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Terjadi kesalahan saat mencatat transaksi.' });
        }
        res.status(200).json({ message: 'Transaksi berhasil', newBalance: newBalance });
      });
    });
  });
});

module.exports = router;
