'use strict';

const {URLSearchParams} = require('url');
const axios = require('axios');

const config = require('../../config');

/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable camelcase */
/* eslint-enable eslint-comments/disable-enable-pair */

const base = {
  client_id: config.get('microsoft.id'),
  redirect_uri: `${config.get('host')}/microsoft/callback`,
  scope: config.get('microsoft.scopes').join(' '),
};

const baseURL = 'https://login.microsoftonline.com/common/oauth2/v2.0';

function authUrl() {
  const query = new URLSearchParams({
    response_type: 'code',
    response_mode: 'query',
    ...base,
  });

  return `${baseURL}/authorize?${query}`;
}

async function exchangeCode(code) {
  const body = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    client_secret: config.get('microsoft.secret'),
    ...base,
  });

  const response = await axios.post(`${baseURL}/token`, body.toString());
  return response.data;
}

module.exports = {authUrl, exchangeCode};
