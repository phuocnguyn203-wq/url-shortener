import { createClient } from 'redis';

const redisClient = createClient();

redisClient.on("error", (err) => {
    console.error("Redis client error: ", err);
})

export default redisClient;