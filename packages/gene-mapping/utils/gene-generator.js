const generateGenes = (count, maxLength, prefix) => {
    const geneLetters = ['A', 'C', 'G', 'T'];

    const genes = [];
    for(let geneIndex = 0; geneIndex < count; geneIndex ++) {
        let geneString = '';

        const numOfCharactersInGene = Math.floor(Math.random() * maxLength);
        for (let charIndex = 0; charIndex < numOfCharactersInGene; charIndex++) {
            geneString += geneLetters[Math.floor(Math.random() * 4)];
        }

        // Make sure that the last letter is not 'A', since there is no way to determine whether that A belongs to the previous or next gene
        geneString += geneLetters[Math.floor(Math.random() * 3) + 1];

        geneString = prefix + geneString;

        genes.push(geneString);
    }

    return genes;
};

module.exports = { generateGenes };