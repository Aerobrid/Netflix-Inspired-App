// mongoDB/nodeJS ODM (used to connect to MongoDB server)
import mongoose from 'mongoose';
// in-memory mongodb server
import { MongoMemoryServer } from 'mongodb-memory-server';
// this module basically allows for sending HTTP requests to express app without starting the server
import request from 'supertest';

// Tests run with NODE_ENV=test so the server doesn't call app.listen (and startup the server)
// we export the express app from server.js so tests can import it
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
process.env.NODE_ENV = 'test';

import app from '../server.js';
import { User } from '../models/user.model.js';
import { afterEach } from 'node:test';

let mongoServer;

/*
  Jest lifecycle hooks used below:
  - beforeAll(fn): runs once before all tests in this file (DB startup)
  - afterAll(fn): runs once after all tests finish (DB cleanup)
  - beforeEach(fn): runs before every individual test (test-isolation in this case)

  describe(name, fn): groups related tests together
  test(name, fn) (alias `it`): one test case
*/

beforeAll(async () => {
  // Start a MongoDB server that runs in user memory (your RAM)
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Connect mongoose to the in-memory MongoDB
  await mongoose.connect(uri);
});

afterAll(async () => {
  // Disconnect and stop the in-memory server
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear users collection so each test runs with a fresh DB state
  await User.deleteMany({});
});

// Clear any Jest mocks to avoid leakage between tests
// so the next test does not depend on the results of the previous
afterEach(() => {
  jest.clearAllMocks();
});

describe('Auth integration', () => {
  test('signup -> login -> authCheck -> logout', async () => {
    const user = { email: 'a@b.com', username: 'tester', password: 'password' };

    // signup
    const signupRes = await request(app).post('/api/v1/auth/signup').send(user);
    expect(signupRes.status).toBe(201);
    expect(signupRes.body.success).toBe(true);
    expect(signupRes.body.user.email).toBe(user.email);

    // server sets an auth cookie when signing up / logging in, so we read and check that
    const cookies = signupRes.headers['set-cookie'];
    expect(cookies).toBeDefined();

    // logout (no cookie needed to clear cookie on response)
    const logoutRes = await request(app).post('/api/v1/auth/logout');
    expect(logoutRes.status).toBe(200);

    // login
    const loginRes = await request(app).post('/api/v1/auth/login').send({ email: user.email, password: user.password });
    expect(loginRes.status).toBe(200);
    const loginCookie = loginRes.headers['set-cookie'];
    expect(loginCookie).toBeDefined();

    // authCheck with cookie: send the cookie header back to authenticate the request.
    const authRes = await request(app).get('/api/v1/auth/authCheck').set('Cookie', loginCookie);
    expect(authRes.status).toBe(200);
    expect(authRes.body.success).toBe(true);
    expect(authRes.body.user.email).toBe(user.email);
  });
});
