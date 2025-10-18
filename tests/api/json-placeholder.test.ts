import { test, expect } from '@playwright/test';

test.describe('JSONPlaceholder API Tests', () => {
  
  test('GET - Retrieve all posts', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/posts`);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const posts = await response.json();
    expect(posts.length).toBeGreaterThan(0);
    expect(posts[0]).toHaveProperty('userId');
    expect(posts[0]).toHaveProperty('id');
    expect(posts[0]).toHaveProperty('title');
    expect(posts[0]).toHaveProperty('body');
  });

  test('GET - Retrieve specific post by ID', async ({ request, baseURL }) => {
    const postId = 1;
    const response = await request.get(`${baseURL}/posts/${postId}`);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const post = await response.json();
    expect(post.id).toBe(postId);
    expect(post.title).toBeTruthy();
    expect(post.body).toBeTruthy();
  });

  test('GET - Verify non-existent resource returns 404', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/posts/99999`);
    
    expect(response.status()).toBe(404);
  });

  test('POST - Create new post', async ({ request, baseURL }) => {
    const newPost = {
      title: 'Test Title',
      body: 'Test post content',
      userId: 1
    };
    
    const response = await request.post(`${baseURL}/posts`, {
      data: newPost
    });
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);
    
    const createdPost = await response.json();
    expect(createdPost.title).toBe(newPost.title);
    expect(createdPost.body).toBe(newPost.body);
    expect(createdPost.userId).toBe(newPost.userId);
    expect(createdPost.id).toBeDefined();
  });

  test('PUT - Full update of post', async ({ request, baseURL }) => {
    const updatedPost = {
      id: 1,
      title: 'Updated Title',
      body: 'Updated content',
      userId: 1
    };
    
    const response = await request.put(`${baseURL}/posts/1`, {
      data: updatedPost
    });
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const post = await response.json();
    expect(post.title).toBe(updatedPost.title);
    expect(post.body).toBe(updatedPost.body);
  });

  test('PATCH - Partial update of post', async ({ request, baseURL }) => {
    const partialUpdate = {
      title: 'Partially Updated Title'
    };
    
    const response = await request.patch(`${baseURL}/posts/1`, {
      data: partialUpdate
    });
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const post = await response.json();
    expect(post.title).toBe(partialUpdate.title);
    expect(post.id).toBe(1);
  });

  test('DELETE - Remove post', async ({ request, baseURL }) => {
    const response = await request.delete(`${baseURL}/posts/1`);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
  });

  test('GET - Retrieve comments for a post', async ({ request, baseURL }) => {
    const postId = 1;
    const response = await request.get(`${baseURL}/posts/${postId}/comments`);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const comments = await response.json();
    expect(comments.length).toBeGreaterThan(0);
    expect(comments[0]).toHaveProperty('postId');
    expect(comments[0]).toHaveProperty('id');
    expect(comments[0]).toHaveProperty('name');
    expect(comments[0]).toHaveProperty('email');
    expect(comments[0]).toHaveProperty('body');
  });

  test('GET - Filter posts by userId', async ({ request, baseURL }) => {
    const userId = 1;
    const response = await request.get(`${baseURL}/posts?userId=${userId}`);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const posts = await response.json();
    expect(posts.length).toBeGreaterThan(0);
    posts.forEach((post: any) => {
      expect(post.userId).toBe(userId);
    });
  });

  test('GET - Verify response headers', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/posts/1`);
    
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('POST - Validate data structure when creating post', async ({ request, baseURL }) => {
    const invalidPost = {
      title: 'Test without userId',
      body: 'Test content'
    };
    
    const response = await request.post(`${baseURL}/posts`, {
      data: invalidPost
    });
    
    // JSONPlaceholder will accept it, but in real API this would be an error
    expect(response.status()).toBe(201);
    
    const createdPost = await response.json();
    expect(createdPost.title).toBe(invalidPost.title);
  });

  test('GET - Performance test (response time)', async ({ request, baseURL }) => {
    const startTime = Date.now();
    const response = await request.get(`${baseURL}/posts`);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    expect(response.ok()).toBeTruthy();
    expect(responseTime).toBeLessThan(3000); // Response should be under 3 seconds
  });
});

// Additional test suite for Users API
test.describe('Users API Tests', () => {
  
  test('GET - Retrieve list of users', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/users`);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const users = await response.json();
    expect(users.length).toBeGreaterThan(0);
    expect(users[0]).toHaveProperty('id');
    expect(users[0]).toHaveProperty('name');
    expect(users[0]).toHaveProperty('email');
    expect(users[0]).toHaveProperty('address');
  });

  test('GET - Validate user email format', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/users/1`);
    
    expect(response.ok()).toBeTruthy();
    
    const user = await response.json();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(user.email).toMatch(emailRegex);
  });
});