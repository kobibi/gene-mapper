SERVICE=$(pwd)"/packages/gene-mapping-service"

echo "Installing npx..."
npm install -g npx

echo "Setting up project..."
npm i && npx lerna bootstrap

echo "Setting up the service..."
echo "Creating a demo dna text file..."
node $SERVICE/scripts/build-dna-file.js

echo "Setting up database"
docker run --name dna-map-redis \
-p 7379:6379 \
-v $SERVICE/scripts/redis/redis.conf:/usr/local/etc/redis/redis.conf \
-d redis


echo "Initializing service..."
NODE_ENV=development node $SERVICE/app.js dna.txt





