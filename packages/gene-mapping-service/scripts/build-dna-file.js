const { utils: {geneGenerator} } = require('gene-mapping');

const fs = require('fs');
const writeStream = fs.createWriteStream('./dna.txt');

// Write chunks of genes into the file. 10,000 in total
for(let i = 0; i < 1000; i++) {
    const geneString = geneGenerator.generateGenes(10, 20, 'AAAAAAAAA').join('');
    writeStream.write(geneString);
    console.log('aaa');
}

writeStream.end();
