'use strict';

const { sync } = require('../../lib/sync');

exports.handler = async () => {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    return { statusCode: 200, headers, body: JSON.stringify(await sync()) };
  } catch (err) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: 'Failed to sync orders', details: err.message }),
    };
  }
};
