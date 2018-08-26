'use strict';

const axios = require('axios');
const Router = require('koa-router');
const {DateTime} = require('luxon');

const knex = require('../knex');
const auth = require('./auth');

const router = new Router();
const request = axios.create({
  baseURL: 'https://graph.facebook.com/v2.9',
});

const fb = {};

fb.getPeople = async function(token) {
  let res;
  res = await request.get(`/me?access_token=${token}`);
  res = await request.get(`/${res.data.id}/friends?access_token=${token}`);
  return res.data;
};

fb.getPicture = function() {
  // ref: https://developers.facebook.com/docs/graph-api/reference/user/picture/
};

router.get('/', ctx => ctx.redirect(auth.authUrl()));

router.get('/callback', async (ctx, next) => {
  await next();
  const tokens = await auth.exchangeCode(ctx.query.code);
  const {data: self} = await request.get(
    `/me?access_token=${tokens.access_token}`,
  );

  const exists = await knex('facebook')
    .where({id: self.id})
    .first();

  const record = {
    /* eslint-disable camelcase */
    access_token: tokens.access_token,
    expires_at: DateTime.local().plus({seconds: tokens.expires_in}),
    /* eslint-enable */
  };

  let result;
  if (exists) {
    result = await knex('facebook')
      .where({id: self.id})
      .update(record, 'id');
  } else {
    result = await knex('facebook').insert({id: self.id, ...record}, 'id');
  }

  ctx.session.facebook = result[0];
  ctx.redirect('/');
});

fb.router = router;
module.exports = fb;
