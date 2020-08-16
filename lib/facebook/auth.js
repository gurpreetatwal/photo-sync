'use strict';

const {URLSearchParams} = require('url');
const axios = require('axios');
const config = require('../../config');

/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable camelcase */
/* eslint-enable eslint-comments/disable-enable-pair */

const base = {
  client_id: config.get('facebook.id'),
  redirect_uri: `${config.get('host')}/facebook/callback`,
};

function authUrl() {
  const query = new URLSearchParams({
    scope: 'user_friends',
    response_type: 'code',
    ...base,
  });

  return `https://www.facebook.com/v3.1/dialog/oauth?${query}`;
}

async function exchangeCode(code) {
  const request = axios.create({
    baseURL: 'https://graph.facebook.com/v3.0',
  });

  let response;

  // exchange auth code for a short-lived access token
  response = await request.get(`/oauth/access_token`, {
    params: {
      code,
      client_secret: config.get('facebook.secret'),
      ...base,
    },
  });

  // exchange short-lived access token for a long lived access token
  response = await request.get('/oauth/access_token', {
    params: {
      grant_type: 'fb_exchange_token',
      client_id: config.get('facebook.id'),
      client_secret: config.get('facebook.secret'),
      fb_exchange_token: response.data.access_token,
    },
  });

  return response.data;
}

module.exports = {authUrl, exchangeCode};
