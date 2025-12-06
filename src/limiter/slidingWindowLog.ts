import redis from '../redisClient.js'
import fs from "fs"
import path from "path"

const scriptPath = path.join(process.cwd(), "src", "lua", "sliding_window.lua");
const luaScript = fs.readFileSync(scriptPath, "utf-8")

console.log("lua script loaded")


class SlidingWindowLog {
    private limit : number;
    private windowMs: number;

    constructor(limit: number, windowMs: number){
        this.limit = limit;
        this.windowMs = windowMs;
    }

    async isAllowed(identifier: string) : Promise<[boolean, number, number, number]> {

        const keyname = "swl:" + identifier;
        const now = Date.now();
        const windowStart = now - this.windowMs;
        const result = await redis.eval(
            luaScript,
            1, 
            keyname,
            now,
            windowStart,
            this.limit,
            this.windowMs
       ) as unknown as [number, number, number]
        const allowedFlag = result[0];
        const count = result[1];
        const resetTime = result[2];
        

        const allowed = allowedFlag === 1;
        const remaining = Math.max(0, this.limit - count);
        const retryAfter = Math.max(
            0,
            Math.ceil((resetTime - now)/1000)
        );
        return [ allowed, count, remaining, retryAfter ];
    }
}

export default SlidingWindowLog;