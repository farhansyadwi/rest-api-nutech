const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transaction');

const app = express();
app.use(bodyParser.json());

// Gunakan routing untuk auth dan transaksi
app.use('/api/auth', authRoutes);
app.use('/api/transaction', transactionRoutes);

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
