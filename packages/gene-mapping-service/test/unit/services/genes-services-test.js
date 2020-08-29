const { Readable, PassThrough}  = require('stream');

const { utils: {geneGenerator} } = require('gene-mapping');

const fs = require('fs');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);
const { expect } = chai;


describe ('genes-service', () => {
    const sandbox = sinon.createSandbox();

    afterEach('restore sandbox', () => {
        sandbox.restore();
    });

    describe ('initialize', () => {
        it('parses a dna data file and saves results to repository', async () => {});
    });
});