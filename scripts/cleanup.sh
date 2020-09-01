SERVICE=$(pwd)"/packages/gene-mapping-service"
PACKAGE=$(pwd)"/packages/gene-mapping"

echo 'Cleaning up service...'
echo "Stopping and deleting redis image"
docker stop dna-map-redis
docker rm dna-map-redis

echo "Deleting dna text file"
rm -f dna.txt

echo 'clearing node_modules folders...'
rm -rf $SERVICE/node_modules
rm -rf $PACKAGE/node_modules