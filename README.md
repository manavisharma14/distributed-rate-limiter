Distributed Rate Limiter

A production-style distributed rate limiting service built with Fastify, Redis, and Lua. The system supports both IP-based and API-key-based rate limiting with multiple usage plans and full automated test coverage.

This project demonstrates real-world backend infrastructure concepts such as distributed consistency, atomic Redis operations, fault tolerance, and request-level enforcement.

⸻

Tech Stack
	•	Node.js
	•	TypeScript
	•	Fastify
	•	Redis
	•	Lua (for atomic sliding window logic)
	•	Docker & Docker Compose
	•	Jest & Supertest

⸻

Features
	•	Token bucket rate limiting by IP
	•	Sliding window rate limiting by API key
	•	Multi-tier API plans (Free, Pro, Enterprise)
	•	Redis-backed distributed state
	•	Lua-based atomic rate enforcement
	•	Graceful degradation on Redis failure
	•	Custom rate limit headers
	•	Fully automated integration tests

⸻

API Behavior

Endpoint

GET /limiter-swl


Required Header
x-api-key: key1 | key2 | key3

Response Headers
X-RateLimit-Limit
X-RateLimit-Remaining
X-RateLimit-Retry-After

Example Request
curl -H "x-api-key: key1" http://localhost:3000/limiter-swl

Local Setup (Without Docker)

Start Redis:
docker run -p 6379:6379 redis:7

Install dependencies:
npm install

Run the server:
npm run dev

Running with Docker
docker compose up --build

This starts:
	•	Redis
	•	Fastify application
	•	Nginx reverse proxy

Testing
npm test

Test coverage includes:
	•	Valid API key request
	•	Missing API key rejection
	•	Invalid API key rejection

⸻

Project Purpose

This project was built to demonstrate:
	•	Distributed rate limiting design
	•	Redis + Lua atomic operations
	•	API security and request enforcement
	•	Backend fault handling and observability
	•	Production-style testing setup








