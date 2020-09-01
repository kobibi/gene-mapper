const express = require('express');
const router = express.Router();

const { doesGeneExist } = require('../services/genes-service');

router.get('/genes/find/:gene', async(req, res) => {
    const gene = req.params.gene;
    const result = await doesGeneExist(gene);
    res.json(result);
});

module.exports = router;