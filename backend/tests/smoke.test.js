// Jest is the test runner which is used for testing app
// - Purpose: quick sanity checks to ensure the app responds and the /metrics endpoint is served
// - Run: from repo root `npm test` (this runs Jest which will pick up files in `backend/tests`)

import request from 'supertest';
import app from '../server.js';

// `describe` groups related tests -> each `test` is a single assertion scenario
describe('smoke tests', () => {
  test('HEAD / returns 200', async () => {
    await request(app).head('/').expect(200);
  });

  test('GET /metrics returns metrics text', async () => {
    // `/metrics` should return Prometheus text format -> we check status + content-type + non-empty body
    const res = await request(app).get('/metrics').expect(200);
    expect(res.headers['content-type']).toMatch(/text\/plain|text\//);
    expect(res.text.length).toBeGreaterThan(0);
  });
});
