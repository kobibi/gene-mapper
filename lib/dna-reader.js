const isStream = require('is-stream');

const PERMITTED_LETTERS = ['A', 'C', 'G', 'T'];

class DnaReader {

    constructor(dnaReadStream, genePrefix) {
        // Validate gene prefix
        for(let i = 0; i < genePrefix.length; i++) {
            if(PERMITTED_LETTERS.indexOf(genePrefix[i]) < 0) {
                throw new Error("Incorrect gene prefix");
            }
        }

        // Validate dna read stream
        if(!isStream.readable(dnaReadStream)){
            throw new Error('Incorrect dna stream');
        }

        this.genePrefix = genePrefix;
        this.dnaReadStream = dnaReadStream;
    }

    on(eventName, eventHandler) {}

    read() {}

}

module.exports = DnaReader;