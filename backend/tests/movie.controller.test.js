import { jest } from '@jest/globals';

// `fetchMock` is a mock (fake) function that simulates responses from the TMDB service
// The real controller calls `fetchFromTMDB` and here we replace that module with
// a mock so tests can control success/error scenarios deterministically
// basically dependency injection via mocking
const fetchMock = jest.fn();
jest.unstable_mockModule('../services/tmdb.service.js', () => ({
  fetchFromTMDB: fetchMock,
}));

// Import movie controllers after applying the module mock so the controller uses the mock
const { getTrendingMovie, getMovieTrailers, getMovieDetails } = await import('../controllers/movie.controller.js');

// Helper to create a minimal `res` object resembling Express's response
// Each method (status, json, send) is a Jest mock and returns `res` to allow chaining
function createRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

// Test: `getTrendingMovie` should call `res.json`
// with a `success` payload when the TMDB fetch returns `results` 
test('getTrendingMovie returns random movie', async () => {
  const fakeData = { results: [{ id: 1, title: 'A' }, { id: 2, title: 'B' }] };
  fetchMock.mockResolvedValueOnce(fakeData);

  const req = {};
  const res = createRes();

  await getTrendingMovie(req, res);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
});

// Test: `getMovieTrailers` has two scenarios:
// 1) fetch succeeds -> returns trailers via `res.json`
// 2) fetch rejects (simulating not found) -> handler should call `res.status(404)`
test('getMovieTrailers returns trailers or 404 for not found', async () => {
  const fakeTrailers = { results: [{ id: 't1' }] };
  fetchMock.mockResolvedValueOnce(fakeTrailers);
  const req = { params: { id: '123' } };
  const res = createRes();
  await getMovieTrailers(req, res);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));

  // simulate 404 error from fetch
  fetchMock.mockRejectedValueOnce(new Error('404 Not Found'));
  const res2 = createRes();
  await getMovieTrailers({ params: { id: 'notfound' } }, res2);
  expect(res2.status).toHaveBeenCalledWith(404);
});

// Test: `getMovieDetails` should send a 200 when the data is returned,
// and a 404 when the fetch fails (mock rejection)
test('getMovieDetails returns content or 404', async () => {
  const data = { id: 1, title: 'X' };
  fetchMock.mockResolvedValueOnce(data);
  const req = { params: { id: '1' } };
  const res = createRes();
  await getMovieDetails(req, res);
  expect(res.status).toHaveBeenCalledWith(200);

  fetchMock.mockRejectedValueOnce(new Error('404 something'));
  const res2 = createRes();
  await getMovieDetails({ params: { id: 'missing' } }, res2);
  expect(res2.status).toHaveBeenCalledWith(404);
});
