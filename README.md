# gene-mapper
A node package capable of mapping genes in a DNA sequence

# Setting Up and Running the Service
* Clone this repository onto your local environment
* In the repository's _root directory_, type the following command into your command line:
    ```
    sh ./scripts/setup.sh
    ```
    
* Once the service is up and running, you can test the API in the following address:
    ```
    http://localhost:3000/genes/find/<gene sequence, including prefix>
    ```    
    
* You can stop the service by simply clicking _^C_
* After you're done, you can clean up your local enviroument by typing the following command 
into your command line, in the _root directory_ of the repository

    ```    
    sh ./scripts/setup.sh    
    ```

## Solution
### Assumptions
* The gene prefix cannot be a subset of a gene sequence
    * for example: if the gene prefix is 'AAAAA', then there cannot be a gene like 'AAAAACGTTATAAAAAAACGT'
* A gene cannot end with a sequence which belongs to the beginning of the gene prefix.
    * For example, if the gene prefix is 'AAAAA', than there cannot be a gene sequence like 'AAAAAGCATCAA', 
    because the 'AA' sequence at the end of the gene sequence is the beginning sequence of the gene prefix
    * Hence, when encountering the gene prefix, it is immediately assumed that this is the beginning of a 
    new gene sequence, and not part of the existing gene.
* In the case of a gene prefix containing only one letter repeated X times (e.g. 'AAAAA') - if a repetition of that letter is 
found in the DNA text, and it is longer than the prefix (e.g. 'AAAAAGCTGAAAAAAAAAAAAACG) then the first X letters are 
considered the prefix, and the rest are considered part of the gene sequence itself.
    * In the example above, the gene mapper will identify 2 genes (the prefix is in bold):
         * **AAAAA**GCTG
         * **AAAAA**AAAAAAAACG
  



### Design Principles
* Stream data from dna file in order to parse the dna text
* Gene mapping package supplies a stream-like object, with 'gene', 'end', and 'error' events
* Initialize service by reading all data from file before listening for incoming requests 