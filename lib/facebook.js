'use strict';

const axios = require('axios');
const qs = require('querystring');
const Router = require('koa-router');

const config = {
  client_id: '1435372633187836',
  redirect_uri: 'http://localhost:2000/facebook/callback',
};

const router = new Router();
const request = axios.create({
  baseURL: 'https://graph.facebook.com/v2.9',
});

const fb = {};
fb.generateAuthorize = function() {

  const query = Object.assign({}, config, {
    scope: '',
    response_type: 'code',
  })

  return `https://www.facebook.com/v2.9/dialog/oauth?${qs.stringify(query)}`;
};


fb.exchangeCode = function(code) {

  const query = Object.assign({}, config, {
    code,
    client_secret: process.env.FB_SECRET,
  });

  return request.get(`/oauth/access_token?${qs.stringify(query)}`);

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

})

fb.router = router;
module.exports = fb;
