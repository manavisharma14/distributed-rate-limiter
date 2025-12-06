import redis from '../redisClient.js'

class TokenBucket {
    private limit : number;
    private windowMs: number;

    constructor(limit: number, windowMs: number){
        this.limit = limit;
        this.windowMs = windowMs;
    }

    async isAllowed(identifier: string) : Promise<boolean> {
        const keyname = "rate_limiter:" + identifier;

        const count = await redis.incr(keyname);

        if(count == 1){
            const seconds = Math.ceil(this.windowMs/1000);
            await redis.expire(keyname, seconds);
        }
        return count <= this.limit;
    }
}

export default TokenBucket;