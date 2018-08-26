'use strict';

const qs = require('querystring');
const axios = require('axios');
const config = require('../../config');

/* eslint-disable camelcase */

const base = {
  client_id: config.get('facebook.id'),
  redirect_uri: `${config.get('host')}/facebook/callback`,
};

function authUrl() {
  const query = qs.stringify(
    Object.assign({}, base, {
      scope: '',
      response_type: 'code',
    }),
  );

  return `https://www.facebook.com/v3.1/dialog/oauth?${query}`;
}

async function exchangeCode(code) {
  const query = qs.stringify(
    Object.assign({}, base, {
      code,
      client_secret: config.get('facebook.secret'),
    }),
  );

  const response = await axios.get(
    `https://graph.facebook.com/v3.1/oauth/access_token?${query}`,
  );

  return response.data;
}

module.exports = {authUrl, exchangeCode};
