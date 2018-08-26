'use strict';

const qs = require('querystring');
const axios = require('axios');
const Router = require('koa-router');

const config = require('../config');

/* eslint-disable camelcase */

const base = {
  client_id: config.get('microsoft.id'),
  client_secret: config.get('microsoft.secret'),
  redirect_uri: `${config.get('host')}/microsoft/callback`,
  scope: config.get('microsoft.scopes').join(' '),
};

const baseURL = 'https://login.microsoftonline.com/common/oauth2/v2.0';

const router = new Router();

const ms = {};
ms.generateAuthorize = function() {
  const query = Object.assign({}, base, {
    response_type: 'code',
    response_mode: 'query',
  });

  return `${baseURL}/authorize?${qs.stringify(query)}`;
};

ms.exchangeCode = function(code) {
  const query = Object.assign({}, base, {
    code,
    grant_type: 'authorization_code',
  });

  return axios.post(`${baseURL}/token`, qs.stringify(query));
};

ms.getPeople = async function(token) {
  const res = await axios.get('https://graph.microsoft.com/v1.0/me/contacts', {
    headers: {
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return res.data;
};

router.get('/', async (ctx, next) => {
  await next();
  ctx.redirect(ms.generateAuthorize());
});

router.get('/callback', async (ctx, next) => {
  await next();
  const res = await ms.exchangeCode(ctx.query.code);

  ctx.session.microsoft = true;

  // shape of res.data
  // const data = {
  //   token_type: '',
  //   scope: 'openid User.Read Contacts.ReadWrite',
  //   expires_in: 3600,
  //   ext_expires_in: 0,
  //   access_token: '',
  //   refresh_token: '',
  // };
  // TODO store data in DB
  ctx.store.set('microsoft', res.data);
  ctx.redirect('/');
});

router.get('/contacts', async (ctx, next) => {
  await next();
  ctx.body = await ms.getPeople(ctx.store.get('microsoft').access_token);
});

ms.router = router;
module.exports = ms;
