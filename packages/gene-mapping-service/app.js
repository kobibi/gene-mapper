const express = require('express');
const app = express();

const { initialize } = require('./lib/services/gene-services');

// require('dotenv').config({path: `${process.cwd()}/config/${process.env.NODE_ENV}.env`}); //{path: `${process.cwd()}/config/${process.env.NODE_ENV}`});

const args = process.argv.slice(2);

const dnaFileName = args[0];

app.get('/', (req, res) => {
    res.send('hi');
});

app.get('/genes/find/:gene', (req, res) => {
    res.send(req.params.gene);
});

initialize(dnaFileName)
    .then(() => {
        app.listen(3000);
        console.log("Server is listening on port 3000...");
    });

