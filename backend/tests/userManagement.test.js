const request = require('supertest');
const app = require('../app');
const User = require('../models/userModel');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

let adminToken;
let testUserId;

beforeAll(async () => {
  // Create an admin user for testing
  const adminUser = await User.create({
    name: 'Admin Test',
    email: 'admin.test@example.com',
    password: 'test1234',
    role: 'admin'
  });

  adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  // Create a regular user for testing role updates and deletion
  const testUser = await User.create({
    name: 'Test User',
    email: 'test.user@example.com',
    password: 'test1234',
    role: 'user'
  });

  testUserId = testUser._id;
});

afterAll(async () => {
  // Clean up test data
  await User.deleteMany({
    email: {
      $in: ['admin.test@example.com', 'test.user@example.com']
    }
  });
  await mongoose.connection.close();
});

describe('User Management Endpoints', () => {
  describe('GET /api/v1/users', () => {
    it('should get all users when authenticated as admin', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/users');

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/v1/users/:userId/role', () => {
    it('should update user role when authenticated as admin', async () => {
      const response = await request(app)
        .patch(`/api/v1/users/${testUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'organizer' });

      expect(response.status).toBe(200);
      expect(response.body.data.user.role).toBe('organizer');
    });

    it('should fail with invalid role', async () => {
      const response = await request(app)
        .patch(`/api/v1/users/${testUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'invalid_role' });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/v1/users/:userId', () => {
    it('should delete user when authenticated as admin', async () => {
      const response = await request(app)
        .delete(`/api/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);

      // Verify user is deleted
      const deletedUser = await User.findById(testUserId);
      expect(deletedUser).toBeNull();
    });

    it('should fail when trying to delete non-existent user', async () => {
      const response = await request(app)
        .delete(`/api/v1/users/${testUserId}`) // Using already deleted user ID
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
}); 