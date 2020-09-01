docker run --name dna-map-redis \
-p 7379:6379 \
-v $(pwd)/redis/redis.conf:/usr/local/etc/redis/redis.conf \
-d redis
