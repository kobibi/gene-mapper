const DnaReader = require('./dna-reader');

const getDnaReader = (dnaReadStrean, genePrefix) => {
    return new DnaReader();
};

module.exports = {getDnaReader: getDnaReader};