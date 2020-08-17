const DnaReader = require('./dna-reader');

const getDnaReader = (dnaReadStrean, genePrefix) => {
    return new DnaReader(dnaReadStrean, genePrefix);
};

module.exports = {getDnaReader: getDnaReader};