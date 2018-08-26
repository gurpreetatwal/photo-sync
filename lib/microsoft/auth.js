'use strict';

const axios = require('axios');
const qs = require('querystring');

const config = require('../../config');

/* eslint-disable camelcase */

const base = {
  client_id: config.get('microsoft.id'),
  redirect_uri: `${config.get('host')}/microsoft/callback`,
  scope: config.get('microsoft.scopes').join(' '),
};

const baseURL = 'https://login.microsoftonline.com/common/oauth2/v2.0';

function authUrl() {
  const query = Object.assign({}, base, {
    response_type: 'code',
    response_mode: 'query',
  });

  return `${baseURL}/authorize?${qs.stringify(query)}`;
}

async function exchangeCode(code) {
  const query = Object.assign({}, base, {
    code,
    grant_type: 'authorization_code',
    client_secret: config.get('microsoft.secret'),
  });

  const response = await axios.post(`${baseURL}/token`, qs.stringify(query));
  return response.data;
}

module.exports = {authUrl, exchangeCode};
