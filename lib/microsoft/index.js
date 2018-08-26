'use strict';

const axios = require('axios');
const Router = require('koa-router');
const {DateTime} = require('luxon');

const knex = require('../../lib/knex');
const auth = require('./auth');

const router = new Router();

const ms = {};

const request = axios.create({
  baseURL: 'https://graph.microsoft.com/v1.0',
  headers: {
    'Content-Type': 'application/json',
  },
});

ms.getSelf = async function(token) {
  const res = await request.get('/me', {
    headers: {authorization: `Bearer ${token}`},
  });

  return res.data;
};

ms.getPeople = async function(token) {
  const res = await request.get('/me/contacts', {
    headers: {authorization: `Bearer ${token}`},
  });

  return res.data;
};

router.get('/', ctx => ctx.redirect(auth.authUrl()));

router.get('/callback', async (ctx, next) => {
  await next();
  const tokens = await auth.exchangeCode(ctx.query.code);
  const self = await ms.getSelf(tokens.access_token);

  const exists = await knex('microsoft')
    .where({id: self.id})
    .first();

  const record = {
    /* eslint-disable camelcase */
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: DateTime.local().plus({seconds: tokens.expires_in}),
    /* eslint-enable */
  };

  let result;

  if (exists) {
    result = await knex('microsoft')
      .where({id: self.id})
      .update(record, 'id');
  } else {
    result = await knex('microsoft').insert({id: self.id, ...record}, 'id');
  }

  ctx.session.microsoft = result[0];
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
