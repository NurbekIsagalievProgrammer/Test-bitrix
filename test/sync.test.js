'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { normalizePhone, processOrders } = require('../lib/sync');

test('normalizePhone', () => {
  assert.strictEqual(normalizePhone('+7 999 123-45-67'), '+79991234567');
  assert.strictEqual(normalizePhone('8 (999) 123 45 67'), '+79991234567');
  assert.strictEqual(normalizePhone('79991234567'), '+79991234567');
  assert.strictEqual(normalizePhone('9005551212'), '+79005551212');
  assert.strictEqual(normalizePhone('123'), null);
  assert.strictEqual(normalizePhone(''), null);
  assert.strictEqual(normalizePhone('не указан'), null);
  assert.strictEqual(normalizePhone('+7 999'), null);
  assert.strictEqual(normalizePhone(null), null);
});

test('dedup: max amount, then latest created_at', () => {
  const result = processOrders([
    { id: 1, name: 'A', phone: '+7 999 123-45-67', email: 'a', amount: 1000, created_at: '2026-10-01T10:00:00Z' },
    { id: 2, name: 'B', phone: '8 (999) 123 45 67', email: '', amount: 5000, created_at: '2026-10-02T11:00:00Z' },
    { id: 3, name: 'C', phone: '79991234567', email: 'a', amount: 3000, created_at: '2026-10-03T09:00:00Z' },
    { id: 4, name: 'D', phone: '8-916-000-00-01', email: 'm', amount: 200, created_at: '2026-10-01T12:00:00Z' },
    { id: 5, name: 'E', phone: '+7 (916) 000 00 01', email: 'm', amount: 200, created_at: '2026-10-05T12:00:00Z' },
    { id: 6, name: 'F', phone: '123', email: '', amount: 999, created_at: '2026-10-01T00:00:00Z' },
  ]);

  assert.deepStrictEqual(result, {
    clients: [
      { name: 'B', phone: '+79991234567', email: '', amount: 5000 },
      { name: 'E', phone: '+79160000001', email: 'm', amount: 200 },
    ],
    stats: { received: 6, unique: 2, duplicates_merged: 3, invalid_dropped: 1 },
  });
});

test('idempotent: same input gives same output', () => {
  const orders = [
    { name: 'A', phone: '+79219998877', email: '', amount: 0, created_at: '2026-10-02T14:00:00Z' },
    { name: 'B', phone: '8 921 999 88 77', email: '', amount: 1500, created_at: '2026-10-06T16:00:00Z' },
  ];
  assert.deepStrictEqual(processOrders(orders), processOrders(orders));
});
