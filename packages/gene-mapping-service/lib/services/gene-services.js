const geneMapping = require('gene-mapping');
const fs = require('fs');
const geneRepository = require('../repositories/gene-repository');

/**
 * Validate the given file path. Check if such file exists on the server.
 * @param filePath
 * @returns {Promise<string[]|Array>}
 */
const _validateFilePath = async (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            return null;
        }
        return 'Invalid file path'; // Security wise - you don't want to give out information as to which files exist on your machine...
    }
    catch(err) {
        console.error(err);
        return ['Unable to validate file'];
    }
};

const geneExists = async(gene) => {
    return geneRepository.geneExists(gene);
};

const initialize = async (dnaFilePath) => {
    const validationError = _validateFilePath(dnaFilePath);
    if (validationError) {
        throw new Error(validationError);
    }

    return new Promise((reject, resolve) => {
        const genePrefix = 'AAAAAAAAA';
        const fileStream = fs.createReadStream(dnaFilePath);

        const dnaReader = geneMapping.getDnaReader(fileStream, genePrefix);

        dnaReader.on('gene', (gene) => {
            geneRepository.saveGene(gene);
        });

        dnaReader.on('end', () => {
            resolve();
        });

        dnaReader.on('error', (msg) => {
            reject(msg);
        });

        dnaReader.read();

    });
};

module.exports = { initialize, geneExists };