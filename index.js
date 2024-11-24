const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

const app = express();

// Middleware untuk parsing JSON
app.use(bodyParser.json());

// Koneksi Database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // Ganti dengan username MySQL Anda
    password: '',  // Ganti dengan password MySQL Anda
    database: 'nutech_api' // Ganti dengan nama database Anda
});

// Cek koneksi database
db.connect((err) => {
    if (err) {
        console.error('Koneksi database gagal:', err);
        return;
    }
    console.log('Terhubung ke database!');
});

// Endpoint untuk registrasi
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Validasi input
    if (!username || !password) {
        return res.status(400).json({ message: 'Username dan Password wajib diisi' });
    }

    // Hash password sebelum disimpan
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Simpan data registrasi ke database
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(sql, [username, hashedPassword], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Terjadi kesalahan saat registrasi' });
        }
        res.status(201).json({ message: 'Registrasi berhasil', userId: results.insertId });
    });
});

// Endpoint untuk login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Validasi input
    if (!username || !password) {
        return res.status(400).json({ message: 'Username dan Password wajib diisi' });
    }

    // Cek apakah username ada di database
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Terjadi kesalahan saat login' });
        }
        if (results.length === 0) {
            return res.status(400).json({ message: 'Username tidak ditemukan' });
        }

        // Verifikasi password
        const user = results[0];
        const isValidPassword = bcrypt.compareSync(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Password salah' });
        }

        res.status(200).json({ message: 'Login berhasil', userId: user.id });
    });
});

// Endpoint untuk cek saldo
app.get('/saldo/:userId', (req, res) => {
    const { userId } = req.params;

    const sql = 'SELECT saldo FROM users WHERE id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Terjadi kesalahan saat cek saldo' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        }

        res.status(200).json({ saldo: results[0].saldo });
    });
});

// Endpoint untuk top up saldo
app.post('/topup', (req, res) => {
    const { userId, amount } = req.body;

    if (!userId || !amount || amount <= 0) {
        return res.status(400).json({ message: 'Amount harus lebih dari 0' });
    }

    const sql = 'UPDATE users SET saldo = saldo + ? WHERE id = ?';
    db.query(sql, [amount, userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Terjadi kesalahan saat top up saldo' });
        }

        res.status(200).json({ message: 'Top up berhasil', newSaldo: amount });
    });
});

// Endpoint untuk transaksi
app.post('/transaksi', (req, res) => {
    const { userId, amount } = req.body;

    if (!userId || !amount || amount <= 0) {
        return res.status(400).json({ message: 'Amount harus lebih dari 0' });
    }

    // Ambil saldo pengguna
    const sqlCheckSaldo = 'SELECT saldo FROM users WHERE id = ?';
    db.query(sqlCheckSaldo, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Terjadi kesalahan saat cek saldo untuk transaksi' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        }

        const userSaldo = results[0].saldo;

        if (userSaldo < amount) {
            return res.status(400).json({ message: 'Saldo tidak cukup untuk transaksi' });
        }

        // Proses transaksi
        const sqlTransaksi = 'UPDATE users SET saldo = saldo - ? WHERE id = ?';
        db.query(sqlTransaksi, [amount, userId], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Terjadi kesalahan saat transaksi' });
            }

            res.status(200).json({ message: 'Transaksi berhasil', newSaldo: userSaldo - amount });
        });
    });
});

// Menjalankan server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
