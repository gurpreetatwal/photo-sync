'use strict';

const qs = require('querystring');
const axios = require('axios');
const Router = require('koa-router');
const {DateTime} = require('luxon');

const config = require('../config');
const knex = require('../lib/knex');

/* eslint-disable camelcase */

const base = {
  client_id: config.get('microsoft.id'),
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
    client_secret: config.get('microsoft.secret'),
  });

  return axios.post(`${baseURL}/token`, qs.stringify(query));
};

ms.getSelf = async function(token) {
  const res = await axios.get('https://graph.microsoft.com/v1.0/me', {
    headers: {
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return res.data;
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
  const self = await ms.getSelf(res.data.access_token);

  const exists = await knex('microsoft')
    .where({id: self.id})
    .first();

  const record = {
    access_token: res.data.access_token,
    refresh_token: res.data.refresh_token,
    expires_at: DateTime.local().plus({seconds: res.data.expires_in}),
  };

  if (exists) {
    ctx.session.microsoft = await knex('microsoft')
      .where({id: self.id})
      .update(record, 'id')
      .then(rows => rows[0]);
  } else {
    ctx.session.microsoft = await knex('microsoft').insert(
      {id: self.id, ...record},
      'id',
    );
  }

  ctx.redirect('/');
});

router.get('/contacts', async (ctx, next) => {
  await next();

  const auth = await knex('microsoft')
    .where({id: ctx.session.microsoft})
    .first();

  // TODO check expiration and reauth
  ctx.body = await ms.getPeople(auth.access_token);
});

ms.router = router;
module.exports = ms;
