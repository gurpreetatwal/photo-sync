'use strict';

const axios = require('axios');
const qs = require('querystring');
const Router = require('koa-router');

const config = require('../config');

const base = {
  client_id: config.get('facebook.id'),
  redirect_uri: `${config.get('host')}/facebook/callback`,
};

const router = new Router();
const request = axios.create({
  baseURL: 'https://graph.facebook.com/v2.9',
});

const fb = {};
fb.generateAuthorize = function() {

  const query = Object.assign({}, base, {
    scope: '',
    response_type: 'code',
  });

  return `https://www.facebook.com/v2.9/dialog/oauth?${qs.stringify(query)}`;
};


fb.exchangeCode = function(code) {

  const query = Object.assign({}, base, {
    code,
    client_secret: config.get('facebook.secret'),
  });

  return request.get(`/oauth/access_token?${qs.stringify(query)}`);

};

fb.getPeople = async function(token) {
  let res;
  res = await request.get(`/me?access_token=${token}`);
  res = await request.get(`/${res.data.id}/friends?access_token=${token}`);
  return res.data;
};

fb.getPicture = function() {
  // ref: https://developers.facebook.com/docs/graph-api/reference/user/picture/

};

router.get('/', async (ctx, next) => {
  await next();
  ctx.redirect(fb.generateAuthorize());
});

router.get('/callback', async (ctx, next) => {
  await next();
  const res = await fb.exchangeCode(ctx.query.code);
  ctx.store.set('facebook', res.data);

  if (!ctx.store.get('microsoft')) {
    ctx.redirect('/');
  } else {
    ctx.redirect('/sync');
  }

});

fb.router = router;
module.exports = fb;
