const PERMITTED_LETTERS = ['A', 'C', 'G', 'T'];


/**
 * The algorithm principles:
 * - Every time we identify a prefix in the string, we dispatch event for the previous gene
 *
 * - If we reach the end of a chunk - we cannot know if it's the end of the gene or not, since the gene sequence
 *   may continue in the next chunk.
 *   Therefore, when we reach the end of the chunk - we concatenate (carry) the previous gene to the beginning of the next chunk
 *   and start reading that gene sequence again
 *
 * - If we reach the end of the stream - the last carry is regarded as a full gene sequence, and an event is dispatched for it
 *
 * The algorithm:
 * Try to read the prefix in chunks -
 *
 * @param readStream
 * @param genePrefix
 * @param dispatchEvent
 */

const processDnaStream = (readStream, genePrefix, dispatchEvent) => {
    // These values can persist across data events
    let carry = '';
    let currentGeneString = '';


    readStream.on('data', (chunk) => {
        // Add the carry from the last chanuk to the beginning of the current one, and continue from there
        const chunkToProcess = carry + chunk;

        let chunkIndex = 0;

        try {
            while (chunkIndex < chunkToProcess.length) {
                // Look for as many prefix sequences in a row as possible, until sequence is broken
                const prefixCandidate = _consumePrefixSequence(chunkToProcess, chunkIndex, genePrefix);
                chunkIndex += prefixCandidate.length;

                // If we reached the end of the chunk - carry the current gene, plus the squence we found, to the next chunk, and start again
                if (chunkIndex === chunkToProcess.length) {
                    carry = currentGeneString + prefixCandidate;
                    currentGeneString = '';
                }

                // If the string we found is longer than the prefix, then it must contain at least one prefix sequence
                if (prefixCandidate.length >= genePrefix.length) {
                    // dispatch event for the current gene
                    if (currentGeneString.length > 0) {
                        dispatchEvent('gene', genePrefix + currentGeneString);
                    }

                    // The first prefix sequence in the string is an actual prefix, and is therefore excluded.
                    // The rest of the string must be part of the gene itself
                    currentGeneString = prefixCandidate.slice(genePrefix.length, prefixCandidate.length);
                }

                // If the string we found is shorter than the prefix - than it is an extension of the current gene
                else {
                    currentGeneString += prefixCandidate;
                }
            }
        }
        catch(err) {
            readStream.destroy(err);
        }
    });

    readStream.on('end', () => {
        dispatchEvent('gene', genePrefix + carry);
        dispatchEvent('end', '');
    });

    readStream.on('error', (err) => {
        dispatchEvent('error', err.message);
    });

};

const _isValidLetter = (letter) => (PERMITTED_LETTERS.indexOf(letter) >= 0);

const _consumePrefixSequence = (string, stringIndex, prefix) => {
    let valueFound = '';

    // Try to match as many sequences of the prefix in a row as possible
    // This loop ends when either:
    // (1) We discover a letter not in the sequence of the prefix
    // (2) We reach the end of the given string
    // (3) We encounter an illegal letter (throw)
    while(true) {
        for (let i = 0; i < prefix.length; i++) {
            const currentLetter = string[stringIndex];
            valueFound += currentLetter;
            stringIndex++;

            if (!_isValidLetter(currentLetter)) {
                throw new Error('Dna data is incorrect.');
            }

            if (currentLetter !== prefix[i] || stringIndex === string.length) {
                return valueFound;
            }
        }
    }
};

module.exports = { processDnaStream };


