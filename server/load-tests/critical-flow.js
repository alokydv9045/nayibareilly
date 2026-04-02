import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { SharedArray } from 'k6/data';
import { Trend } from 'k6/metrics';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// --- Configuration ---
const API_BASE_URL = 'http://localhost:4001/api/v1';

// --- Metrics ---
const registrationDuration = new Trend('reg_duration');
const loginDuration = new Trend('login_duration');
const createIssueDuration = new Trend('create_issue_duration');

// --- Test Data ---
// Simple image data (1x1 red pixel PNG)
const imageBin = new SharedArray('testImage', function () {
  // A 1x1 red pixel PNG image as a base64 string
  const b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  // Decode the base64 string into a binary array
  return http.file(b64, 'test-image.png', 'image/png').data;
});


// --- Test Options ---
export const options = {
  stages: [
    { duration: '30s', target: 5 }, // Ramp-up to 5 virtual users over 30s
    { duration: '1m', target: 5 },  // Stay at 5 VU for 1 minute
    { duration: '30s', target: 0 }, // Ramp-down to 0 VU
  ],
  thresholds: {
    'http_req_failed': ['rate<0.01'], // <1% failed requests
    'http_req_duration': ['p(95)<500'], // 95% of requests should be below 500ms
    'reg_duration': ['p(95)<800'],
    'login_duration': ['p(95)<400'],
    'create_issue_duration': ['p(95)<1500'],
  },
};

// --- Test Logic ---
export default function () {
  const uniqueId = randomString(10);
  const email = `testuser_${uniqueId}@example.com`;
  const password = 'password123';
  let authToken = '';

  group('1. User Registration', function () {
    const payload = JSON.stringify({
      name: `Test User ${uniqueId}`,
      email: email,
      password: password,
      phone: `123456${Math.floor(Math.random() * 10000)}`,
    });
    const params = { headers: { 'Content-Type': 'application/json' } };
    
    const res = http.post(`${API_BASE_URL}/auth/register`, payload, params);
    
    check(res, { 'registration successful': (r) => r.status === 201 });
    registrationDuration.add(res.timings.duration);
  });

  sleep(1);

  group('2. User Login', function () {
    const payload = JSON.stringify({ email: email, password: password });
    const params = { headers: { 'Content-Type': 'application/json' } };

    const res = http.post(`${API_BASE_URL}/auth/login`, payload, params);

    check(res, { 'login successful': (r) => r.status === 200 });
    if (res.status === 200) {
      authToken = res.json('token');
    }
    loginDuration.add(res.timings.duration);
  });

  sleep(1);

  if (authToken) {
    group('3. Create Issue with Upload', function () {
      const data = {
        title: `Test Issue from k6 - ${uniqueId}`,
        description: 'This is an automated test issue created by k6.',
        latitude: '28.3670',
        longitude: '79.4304',
        category: 'GARBAGE',
        media: http.file(imageBin, 'test-image.png', 'image/png'),
      };

      const params = {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      };

      const res = http.post(`${API_BASE_URL}/issues`, data, params);

      check(res, { 'issue creation successful': (r) => r.status === 201 });
      createIssueDuration.add(res.timings.duration);
    });
  }

  sleep(2);
}
