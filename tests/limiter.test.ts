import request from "supertest"
import {fastify} from '../src/app.js'

describe("Distributed Rate Limiter", () => {
    beforeAll(async() => {
        process.env.NODE_ENV = "test";
        await fastify.ready();
    });
    
    afterAll(async() => {
        await fastify.close();
    });

    test("allows request with valid api keys", async() => {
        const res = await request(fastify.server).get("/limiter-swl").set("x-api-key", "key1");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ ok: true});
    });

    test("blocks missing api key", async() => {
        const res = await request(fastify.server).get("/limiter-swl");
        expect(res.statusCode).toBe(401);
    });

    test("blocks invalid api key", async() => {
        const res = await request(fastify.server).get("/limiter-swl").set("x-api-key", "fake-key");
        expect(res.statusCode).toBe(403)
    })
})