'use strict';

const DEFAULT_ORDERS_URL = 'https://test.ooobs.ru/api/orders';

function normalizePhone(raw) {
  if (raw === null || raw === undefined) return null;
  const digits = String(raw).replace(/\D/g, '');

  if (digits.length === 11 && (digits[0] === '7' || digits[0] === '8')) {
    return '+7' + digits.slice(1);
  }
  if (digits.length === 10) {
    return '+7' + digits;
  }
  return null;
}

function toAmount(value) {
  const n = typeof value === 'number' ? value : Number(String(value ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function toTime(value) {
  const t = Date.parse(value);
  return Number.isFinite(t) ? t : -Infinity;
}

function isBetter(candidate, current) {
  if (candidate.amount !== current.amount) return candidate.amount > current.amount;
  return candidate.time > current.time;
}

function processOrders(orders) {
  if (!Array.isArray(orders)) {
    throw new Error('Orders payload is not an array');
  }

  const byPhone = new Map();
  let invalid = 0;
  let valid = 0;

  for (const order of orders) {
    const phone = normalizePhone(order && order.phone);
    if (!phone) {
      invalid++;
      continue;
    }
    valid++;

    const candidate = {
      name: order.name == null ? '' : String(order.name),
      phone,
      email: order.email == null ? '' : String(order.email),
      amount: toAmount(order.amount),
      time: toTime(order.created_at),
    };

    const current = byPhone.get(phone);
    if (!current || isBetter(candidate, current)) {
      byPhone.set(phone, candidate);
    }
  }

  const clients = [...byPhone.values()].map(({ name, phone, email, amount }) => ({
    name,
    phone,
    email,
    amount,
  }));

  return {
    clients,
    stats: {
      received: orders.length,
      unique: clients.length,
      duplicates_merged: valid - clients.length,
      invalid_dropped: invalid,
    },
  };
}

async function fetchOrders(url = process.env.ORDERS_URL || DEFAULT_ORDERS_URL) {
  const headers = { Accept: 'application/json' };
  if (process.env.ORDERS_API_TOKEN) {
    headers.Authorization = `Bearer ${process.env.ORDERS_API_TOKEN}`;
  }

  const res = await fetch(url, { headers, signal: AbortSignal.timeout(10000) });
  if (!res.ok) {
    throw new Error(`Orders API responded with ${res.status}`);
  }
  return res.json();
}

async function sync() {
  return processOrders(await fetchOrders());
}

module.exports = { normalizePhone, processOrders, fetchOrders, sync };
