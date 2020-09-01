const redis     = require('redis');

    const redisClient = redis.createClient({
        port      : process.env.REDIS_PORT,
        host      : process.env.REDIS_HOST
    });

/**
 * Promisify the redisClient.set function
 * @param key
 * @param value
 * @returns {Promise<any>}
 * @private
 */
const _redisSet = (key, value) => {
    return new Promise((resolve, reject) => {
        redisClient.set(key, value, function (err) {
            if (err) {
                reject(err); /* in production, handle errors more gracefully */
            } else {
                resolve();
            }
        });
    });
};

/**
 * Promisify the redisClient.get function
 * @param key
 * @param value
 * @returns {Promise<any>}
 * @private
 */
const _redisGet = (key) => {
    return new Promise((resolve, reject) => {
        redisClient.get(key, function (err, value) {
            if (err) {
                reject(err);
            } else {
                resolve(value);
            }
        });
    });
};

/**
 * Save a gene to redis.
 * The value is a simple 'true', since we only want to check the existence of the key, and nothing more.
 * @param gene
 * @returns {Promise<void>}
 */
const saveGene = async(gene) => {
    await _redisSet(gene, true);
    console.log('successfully saved gene: ' + gene);
};

/**
 * Check if a gene exists in redis.
 * @param gene
 * @returns {Promise<boolean>} - either 'true' - if the value exsits, or 'false' - otherwise
 */
const doesGeneExist = async(gene) => {
    try {
        const value = await _redisGet(gene);
        return {
            success: true,
            result: !!value
        };
    }
    catch (err) {
        console.error(err);
        return {
            success: false,
            error: 'An error occurred while trying to locate gene.'
        }
    }
};

module.exports = { saveGene, doesGeneExist };