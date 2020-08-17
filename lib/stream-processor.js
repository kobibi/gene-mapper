const PERMITTED_LETTERS = ['A', 'C', 'G', 'T'];


const processDnaStream = (readStream, genePrefix, dispatchEvent) => {
    // These values can persist across data events
    let carry = '';
    let geneString = '';

    readStream.on('data', (chunk) => {
        const stringChunk = carry + chunk;

        let chunkIndex = 0;

        while (chunkIndex < stringChunk.length) {
            const prefixCandidate = _tryReadPrefix(stringChunk, chunkIndex, genePrefix);

            // Advance the chunk index by the number of chars found
            chunkIndex += prefixCandidate.length;

            // If reading stopped beause we encountered an illegal letter - abort
            if (!_isValidLetter(prefixCandidate[prefixCandidate.length - 1])) {
                dispatchEvent('error', 'Dna data is incorrect.');
                readStream.destroy();
                return;
            }

            // If reading stopped because we reached the end of the chunk - retry reading it with the next chunk;
            else if (chunkIndex === stringChunk.length) {
                carry = prefixCandidate;
            }

            // If we found the prefix in whole - start a new gene
            else if (prefixCandidate === genePrefix) {
                if (geneString.length > 0) {
                    dispatchEvent('gene', geneString);
                }

                // Start a new gene with the newly found prefix, and read one more letter after the prefix (minimum length of a gene);
                geneString = prefixCandidate;

                // Make sure we didn't read an illegal char
                if (!_isValidLetter(stringChunk[chunkIndex])) {
                    dispatchEvent('error', 'Dna data is incorrect.');
                    readStream.destroy();
                    return;
                }
                geneString += stringChunk[chunkIndex];
                chunkIndex++;
            }

            // If we stopped because we found a character which does not belong to the prefix - then the whole string is part of the previous gene
            else {
                geneString += prefixCandidate;
            }
        }
    });

    readStream.on('end', () => {
        geneString += carry;
        dispatchEvent('gene', geneString);
        dispatchEvent('end', '');
    });

    readStream.on('error', () => {
        readStream.destroy();
        dispatchEvent('error', 'An error has occurred while reading the stream.');
    });

};

const _isValidLetter = (letter) => (PERMITTED_LETTERS.indexOf(letter) >= 0);

const _tryReadPrefix = (string, stringIndex, prefix) => {
    let valueFound = '';

    for(let i = 0; i < prefix.length && stringIndex < string.length; i++, stringIndex++) {
        const currentLetter = string[stringIndex];
        valueFound += currentLetter;

        if(!_isValidLetter(currentLetter)) {
            break;
        }

        if(currentLetter !== prefix[i]) {
            break;
        }
    }

    return valueFound;
};

module.exports = { processDnaStream };


