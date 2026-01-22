const request = require('supertest');
const app = require('../index');

describe('Simple Faculty Controller Test', () => {
  test('should be able to import app', () => {
    expect(app).toBeDefined();
  });
});