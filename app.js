require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const fileRoutes = require('./src/routes/file.routes');
const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI);


app.use('/api/files', fileRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`File Service running on port ${PORT}`));
