const express = require('express');
const app = express();

// require('dotenv').config({path: `${process.cwd()}/config/${process.env.NODE_ENV}.env`}); //{path: `${process.cwd()}/config/${process.env.NODE_ENV}`});


app.get('/', (req, res) => {
    res.send('hi');
});

app.get('/genes/find/:gene', (req, res) => {
    res.send(req.params.gene);
});


app.listen(3000);