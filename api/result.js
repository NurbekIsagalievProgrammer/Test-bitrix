'use strict';

const { sync } = require('../lib/sync');

module.exports = async function handler(req, res) {
  try {
    const result = await sync();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.statusCode = 200;
    res.end(JSON.stringify(result));
  } catch (err) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.statusCode = 502;
    res.end(JSON.stringify({ error: 'Failed to sync orders', details: err.message }));
  }
};
