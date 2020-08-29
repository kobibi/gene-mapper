const express = require('express');
const app = express();

const { initialize } = require('./lib/services/genes-service');

// require('dotenv').config({path: `${process.cwd()}/config/${process.env.NODE_ENV}.env`}); //{path: `${process.cwd()}/config/${process.env.NODE_ENV}`});

const args = process.argv.slice(2);

const dnaFileName = args[0];

const dnaFilePath = `${process.cwd()}/${dnaFileName}`;

app.get('/', (req, res) => {
    res.send('hi');
});

app.get('/genes/find/:gene', (req, res) => {
    res.send(req.params.gene);
});

const genePrefix = 'AAAAAAAAA';

initialize(dnaFilePath, genePrefix)
    .then(() => {
        app.listen(3000);
        console.log("Server is listening on port 3000...");
    });

