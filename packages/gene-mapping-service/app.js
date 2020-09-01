require('dotenv').config({path: `${process.cwd()}/config/${process.env.NODE_ENV}.env`}); //{path: `${process.cwd()}/config/${process.env.NODE_ENV}`});

const express = require('express');
const routes = require('./lib/controllers/genes-controller');
const { initialize } = require('./lib/services/genes-service');


// Load configuration

const args = process.argv.slice(2);

const genePrefix = 'AAAAAAAAA';

const app = express();
app.use(routes);

const dnaFileName = args[0];
const dnaFilePath = `${process.cwd()}/${dnaFileName}`;
initialize(dnaFilePath, genePrefix)
    .then(() => {
        app.listen(3000);
        console.log("#########################################################################Server is listening on port 3000...");
    });

