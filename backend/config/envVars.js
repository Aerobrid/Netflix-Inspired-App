// dotenv is a package that loads environment variables from a .env file into process.env for use in the application
import dotenv from 'dotenv';

// Load environment variables from .env file into process.env
dotenv.config();

// Export an object containing the environment variables used in the application
export const ENV_VARS = {
  MONGO_URI: process.env.MONGO_URI,
  PORT: process.env.PORT || 5000,
  // Provide a non-production default for tests/CI when .env isn't present
  // Use 'testsecret' to match the test file fallback when running tests locally or in CI
  JWT_SECRET: process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'testsecret' : undefined),
  NODE_ENV: process.env.NODE_ENV,
  // whether the server is exposed over HTTPS on the host — set to 'true' when using TLS
  USE_HTTPS: process.env.USE_HTTPS === 'true',
  TMDB_API_KEY: process.env.TMDB_API_KEY,
};