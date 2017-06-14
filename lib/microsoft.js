'use strict';

const axios = require('axios');
const qs = require('querystring');
const Router = require('koa-router');

const config = {
  scope: 'openid offline_access user.read contacts.readwrite',
  client_id: 'd64f31f6-2f24-4dcc-9887-6222d6f394bf',
  redirect_uri: 'http://localhost:2000/microsoft/callback',
  client_secret: process.env.SECRET,
};

const baseURL = 'https://login.microsoftonline.com/common/oauth2/v2.0';

const router = new Router();

const ms = {};
ms.generateAuthorize = function() {

  const query = Object.assign({}, config, {
    response_type: 'code',
    response_mode: 'query',
  })

  return `${baseURL}/authorize?${qs.stringify(query)}`;
};


ms.exchangeCode = function(code) {

  const query = Object.assign({}, config, {
    code,
    grant_type: 'authorization_code',
  });

  return axios.post(`${baseURL}/token`, qs.stringify(query));

};

router.get('/', async (ctx, next) => {
  await next();
  ctx.redirect(ms.generateAuthorize());
});

router.get('/callback', async (ctx, next) => {
  await next();
  const res = await ms.exchangeCode(ctx.query.code);
  console.log(res.data);
  ctx.body = `<pre>${JSON.stringify(res.data, null, 2)}</pre>`;
})

ms.router = router;
module.exports = ms;
