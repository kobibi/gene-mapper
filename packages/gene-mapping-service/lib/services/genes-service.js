const { geneMapper } = require('gene-mapping');
const fs = require('fs');
const genesRepository = require('../repositories/genes-repository');

/**
 * Validate the given file path. Check if such file exists on the server.
 * @param filePath
 * @returns {Promise<string[]|Array>}
 */
const _validateFilePath = async (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            return null;                // nul === everything is alright :)
        }
        return 'Invalid file path'; // Security wise - you don't want to give out information as to which files exist on your machine...
    }
    catch(err) {
        console.error(err);
        return ['Unable to validate file'];
    }
};

const doesGeneExist = async(gene) => {
    return genesRepository.doesGeneExist(gene);
};

const initialize = async (dnaFilePath, genePrefix) => {
    const validationError = await _validateFilePath(dnaFilePath);
    if (validationError) {
        throw new Error(validationError);
    }

    return new Promise((resolve, reject) => {
        const fileStream = fs.createReadStream(dnaFilePath);

        const dnaReader = geneMapper.getDnaReader(fileStream, genePrefix);

        dnaReader.on('gene', (gene) => {
            genesRepository.saveGene(gene);
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

module.exports = { initialize, doesGeneExist};