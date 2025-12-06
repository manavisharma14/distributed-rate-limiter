local key = KEYS[1]
local now = tonumber(ARGV[1])
local windowStart = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local windowMs = tonumber(ARGV[4])

redis.call("ZREMRANGEBYSCORE", key, "-inf", windowStart)

local count = redis.call("ZCOUNT", key, windowStart, "+inf")


if count >= limit then
    local oldest = redis.call("ZRANGE", key, 0, 0, "WITHSCORES")[2]
    local resetTime = oldest + windowMs
    return {0, count, resetTime}
end

redis.call("ZADD", key, now, now)
redis.call("PEXPIRE", key, windowMs)

count = count+1
local oldest = redis.call("ZRANGE", key, 0, 0, "WITHSCORES")[2]
local resetTime = oldest + windowMs

return {
    1,
    count,
    resetTime,
}



