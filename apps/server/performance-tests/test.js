import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 }, // Ramp-up to 50 users over 1 minute
    { duration: '2m', target: 50 }, // Stay at 50 users for 2 minutes
    { duration: '1m', target: 0 },  // Ramp-down to 0 users
  ],
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  const paymentPayload = JSON.stringify({
    amount: 100,
    currency: 'EUR',
    email: 'test@example.com',
  });

  const headers = { 'Content-Type': 'application/json' };

  const response = http.post(`${BASE_URL}/v1/payments`, paymentPayload, { headers });

  check(response, {
    'is status 200': (r) => r.status === 201,
    'response has transactionId': (r) => JSON.parse(r.body).transactionId !== undefined,
  });

  sleep(1);
}
