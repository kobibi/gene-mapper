const isStream = require('is-stream');
const streamProcessor = require('./stream-processor');

const PERMITTED_LETTERS = ['A', 'C', 'G', 'T'];

class DnaReader {
    constructor(dnaReadStream, genePrefix) {

        { // Validate parameters:
            for (let i = 0; i < genePrefix.length; i++) {
                if (PERMITTED_LETTERS.indexOf(genePrefix[i]) < 0) {
                    throw new Error("Incorrect gene prefix");
                }
            }

            // Validate dna read stream
            if (!isStream.readable(dnaReadStream)) {
                throw new Error('Incorrect dna stream');
            }
        }

        const _genePrefix = genePrefix;
        const _dnaReadStream = dnaReadStream;
        const _eventHandlers = {
            gene: [],
            end: [],
            error: []
        };

        const _dispatchEvent = (eventName, eventData) => {
            const eventQueue = _eventHandlers[eventName];

            if(!eventQueue) {
                return;
            }

            for(let i = 0; i < eventQueue.length; i++) {
                if(typeof eventQueue[i] === 'function') {
                    eventQueue[i].call(this, eventData);
                }
            }
        };

        // Register to dna reader events.
        this.on = (eventName, eventHandler) => {
            if (typeof eventHandler !== 'function') {
                return;
            }

            const eventQueue = _eventHandlers[eventName];

            if (!eventQueue) {
                return;
            }

            eventQueue.push(eventHandler);
        };

        this.read = () => {
            streamProcessor.processDnaStream(_dnaReadStream, _genePrefix, _dispatchEvent);
        };
    }
}

module.exports = DnaReader;