import Fastify from 'fastify'
import redis from './redisClient.js'
import TokenBucket from './limiter/tokenBucket.js'
import SlidingWindowLog from './limiter/slidingWindowLog.js'
import { apiKeys } from './lib/apiKeys.js'

const fastify = Fastify({
    logger: true
})

const limiter = new TokenBucket(5, 60000);
const ipLimiter = new TokenBucket(20, 60000);




fastify.get("/limiter-swl", async(request, reply) => {
    const clientIp = request.ip;
    const ipAllowed = await ipLimiter.isAllowed(clientIp);

    if(!ipAllowed){
        return reply.code(429).send({ error: "too many requests from this ip"});
    }

    const raw = request.headers['x-api-key'];
    const apiKey = (Array.isArray(raw) ? raw[0] : raw)?.trim()
    if(!apiKey){
        return reply.code(401).send({ error: "no api key"})
    }

    const apiInfo = apiKeys[apiKey]
    if(!apiInfo){
        return reply.code(403).send({ error: "no api info"})
    }
    
    const userLimit = apiInfo.limit
    const identifier = apiKey;

    

    const keyLimiter = new SlidingWindowLog(userLimit, 60000)
    const [allowed, count, remaining, retryAfter] = 
        await keyLimiter!.isAllowed(identifier);

    reply.header('X-RateLimit-Limit', userLimit);
    reply.header('X-RateLimit-Remaining', remaining)
    reply.header('X-RateLimit-Retry-After', retryAfter)
    
    if (!allowed) {
        return reply.code(429).send({ error: "limit exceeded" });
      }
    
    return { ok: true };

})
// fastify.get("/limiter-swl", async(request, reply) => {
//     const raw = request.headers['x-api-key'];
//     const apiKey = (Array.isArray(raw) ? raw[0] : raw)?.trim();

//     if(!apiKey){
//         return reply.code(401).send({ error : "no api key"});
//     }

//     const apiInfo = apiKeys[apiKey];
//     if(!apiInfo){
//         return reply.code(403).send({ error : "no key info"});
//     }

//     const userLimit = apiInfo.limit;
//     const identifier = apiKey;

//     if(!swLimiter.has(apiKey)){
//         swLimiter.set(apiKey, new SlidingWindowLog(userLimit, 60000));
//     }

//     const keyLimiter = swLimiter.get(apiKey)
//     const [ allowed, count, remaining, retryAfter ] = await keyLimiter!.isAllowed(identifier);
//     reply.header("X-RateLimit-Limit", userLimit);
//     reply.header("X-RateLimit-Remaining", remaining);
//     reply.header("X-RateLimit-Retry-After", retryAfter);

//     if(!allowed){
//         return reply.code(429).send({ errro : "limit excedded"})
//     }
//     else return {ok : true};
// })

fastify.get('/health', async() => {
    return {ok: true};
})

fastify.get('/limiter', async(req, reply) => {
    const identifier = req.ip;
    const allowed = await limiter.isAllowed(identifier);
    if(!allowed) return reply.code(429).send({ error : "rate limit excedded"})
    else return { ok: true};
})

fastify.get('/redis-test', async() => {
    await redis.set("name", "manavi");
    const value = await redis.get("name");
    console.log(value)
    return { value };
})

const start = async() => {
    try {
        await fastify.listen({ port: 3000, host: "0.0.0.0" })
        fastify.log.info('server running at http://localhost:3000')
    } catch(err) {
        fastify.log.error(err);
        process.exit(1);
    }
}
start();
