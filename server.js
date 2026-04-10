const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ZADATAK 1 → statičke datoteke
app.use(express.static('public'));

// ZADATAK 3 → EJS
app.set('view engine', 'ejs');

// ZADATAK 3 → galerija
app.get('/slike', (req, res) => {
    const data = fs.readFileSync(path.join(__dirname, 'images.json'));
    const images = JSON.parse(data);
    res.render('slike', { images });
});

// ZADATAK 2 → port za Railway
app.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
});