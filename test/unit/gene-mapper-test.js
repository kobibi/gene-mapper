const geneMapper = require('../../lib/gene-mapper');
const DnaReader = require('../../lib/dna-reader');

const { Readable, PassThrough}  = require('stream');

const { expect, assert } = require('chai');

describe ('geneMapper', () => {

    describe('getDnaReader', () => {

        it('returns an instance of DnaReader', () => {
            const readStream = Readable.from(['AAA']);
            const genePrefix = 'A';
            const dnaReader = geneMapper.getDnaReader();

            expect(dnaReader instanceof DnaReader).to.eq(true);
        });
    });
});

describe('DnaReader', () => {

    describe('read', () => {

        it('Raises an exception when the readStream parameter is incorrect', () => {
            const goodGenePrefix = 'A';

            const badStreamValues = [
                undefined,
                null,
                'string',
                {},
                [],
                () => {}];

            const dnaReader = geneMapper.getDnaReader();

            badStreamValues.forEach((badReadStream) => {
                expect((() => {
                    dnaReader.read(badReadStream, goodGenePrefix);
                })()).to.throw('Incorrect data stream');
            });
        });

        it('raises an exception when the genePrefix parameter is incorrect', () => {
            const goodReadStream = Readable.from(['AAA']);

            const badPrefixValues = [undefined, null, '', 'illegalcharshere', {}, [], () => {
            }];

            badPrefixValues.forEach((badGenePrefix) => {
                expect(() => {
                    dnaReader.read(badReadStream, goodGenePrefix);
                }).to.throw('Incorrect gene prefix');
            });
        });

        it('raises an "end" event through the stream when the dna stream is fully read', async () => {
            const readStream = Readable.from(['AAA']);
            const genePrefix = 'A';

            const dnaReader = geneMapper.getDnaReader();

            return _setPromiseTimeout(new Promise((resolve, reject) => {
                dnaReader.on('end', () => {
                    resolve();
                });

                dnaReader.read(readStream, genePrefix);
            }), 500, 'Dna mapping did not complete on time.');
        });

        it('raises an "error" through the stream when there is a problem with the dna stream', async () => {
            const readStreamWithBadData = Readable.from(['AAAKAAA']);
            const genePrefix = 'A';

            const dnaReader = geneMapper.getDnaReader();

            return _setPromiseTimeout(new Promise((resolve, reject) => {
                dnaReader.on('end', () => {
                    reject('gene stream was supposed to fail');
                });

                // We expect this to occur when we destroy the stream
                dnaReader.on('error', (msg) => {
                    expect(msg).to.eq('Dna data is incorrect.');
                    resolve();
                });

                dnaReader.read(readStreamWithBadData, genePrefix);

                // Destroy the stream. This should trigger the 'error' event
                dnaStream.destroy();
            }), 500, 'Dna mapping did not fail on time.');

        });

        it('raises an "error" through the stream when there is a problem with the dna sequence', async () => {
            const dnaStream = new PassThrough();
            const genePrefix = 'A';

            const dnaReader = geneMapper.getDnaReader();
            return _setPromiseTimeout(new Promise((resolve, reject) => {
                dnaReader.on('end', () => {
                    reject('gene stream was supposed to fail');
                });

                // We expect this to occur when we destroy the stream
                dnaReader.on('error', (msg) => {
                    expect(msg).to.eq('An error has occured while reading the stream.');
                    resolve();
                });

                dnaReader.read(dnaStream, genePrefix);

                // Destroy the stream. This should trigger the 'error' event
                dnaStream.destroy();
            }), 500, 'Dna mapping did not fail on time.');

        });

        it('raises a "gene" event for every gene discovered in the dna sequence', async () => {
            // Generate a dna sequence
            const genePrefix = 'AAAAAAA';
            const originalGenes = _generateGenes(10, 8, genePrefix);
            const dnaSequence = originalGenes.join('');

            // Create a read stream from the dna data
            const dnaReadStream = Readable.from([dnaSequence]);

            return _expectDiscoveredGenes(originalGenes, dnaReadStream, genePrefix);
        });

        it('can consume long streams read with multiple data chunks', async () => {
            const genePrefix = 'AAAAAAA';
            const originalGenes = _generateGenes(15, 8, genePrefix);

            const dnaStreamSplit = [
                originalGenes.slice(0, 6).join(''),
                originalGenes.slice(7, 12).join(''),
                originalGenes.slice(13, 14).join('') ];

            const dnaReadStream = Readable.from(dnaStreamSplit);

            return _expectDiscoveredGenes(originalGenes, dnaReadStream, genePrefix);
        });

        it('identifies gene sequences which got split between data chunks', async () => {
            const genePrefix = 'AAAAAAA';

            const originalGenes = _generateGenes(15, 8, genePrefix);

            // Split a gene string in two:
            const geneToSplit = originalGenes[6];
            const half = Math.Floor(geneToSplit.length < 2);
            const firstHalf = geneToSplit.slice(0, half);
            const secondHalf = geneToSplit.slice(0, half);

            // Put the two halves in two separate chunks
            const dnaStreamSplit = [
                originalGenes.slice(0, 5).join('') + firstHalf,
                secondHalf + originalGenes.slice(7, 12).join(''),
                originalGenes.slice(13, 14).join('') ];

            const dnaReadStream = Readable.from(dnaStreamSplit);

            return _expectDiscoveredGenes(originalGenes, dnaReadStream, genePrefix);
        });
    });
});

/**
 * Helper method to expect an asynchronous action to be resolved or rejected within a given time frame
 * @param expectedPromise
 * @param timeout
 * @param errorMsg
 * @private
 */
const _setPromiseTimeout = async (expectedPromise, timeout, timeIsUpErrorMsg) => {
    // Generate a new promise which will automatically reject when the time is up
    const setNewTimeout = (timeout, errMsg) => new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(errMsg);
        }, timeout);
    });

    // Set up the race
    return Promise.race([
            expectedPromise,
            setNewTimeout(timeout, timeIsUpErrorMsg)
        ]
    )
};


const _generateGenes = (count, maxLength, prefix) => {
    const geneLetters = ['A', 'C', 'G', 'T'];

    const genes = [];
    for(let geneIndex = 0; geneIndex < count; geneIndex ++) {
        const numOfCharactersInGene = Math.floor(Math.random() * maxLength);
        let geneString = '';
        for (let charIndex = 0; charIndex < numOfCharactersInGene; charIndex++) {
            const nextChar = geneLetters[Math.floor(Math.random() * 4)];
            geneString += nextChar;
            geneString = prefix + geneString;
        }
        genes.push(geneString);
    }

    return genes;
};

const _expectDiscoveredGenes = async (originalGenes, dnaReadStream, genePrefix) => {
    const dnaReader = geneMapper.getDnaReader();

    // Read dna stream and collect incoming events, within a timeout
    const discoveredGenes = [];
    await _setPromiseTimeout(new Promise((resolve, reject) => {
        dnaReader.on('gene', (gene) => {
            discoveredGenes.push(gene);
        });

        dnaReader.on('end', () => {
            resolve();
        });

        dnaReader.on('error', (msg) => {
            reject(msg);
        });

        dnaReader.read(dnaReadStream, genePrefix);
    }), 500, 'Dna mapping did not complete on time.');

    expect(discoveredGenes.length).to.eq(originalGenes.length);

    const sortedOriginalGenes = originalGenes.sort();
    const sortedDiscoveredGenes = discoveredGenes.sort();

    for (let i = 0; i < sortedOriginalGenes.length; i++) {
        expect(sortedOriginalGenes[i].to.eq(sortedDiscoveredGenes[0]));
    }
};