'use strict';

const Koa = require('koa');
const axios = require('axios');
const qs = require('querystring');
const Router = require('koa-router');

const config = {
  client_id: 'd64f31f6-2f24-4dcc-9887-6222d6f394bf',
  redirect_uri: 'http://localhost:2000/ms/callback',
  scope: 'user.read contacts.readwrite',
};

const app = new Koa();
const router = new Router();

const baseURL = 'https://login.microsoftonline.com/common/oauth2/v2.0';

router.get('/', function (ctx, next) {
  ctx.redirect(baseURL + '/authorize?' + qs.stringify(Object.assign({}, config, {
    response_type: 'code',
    response_mode: 'query',
  })));
});

router.get('/ms/callback', async (ctx, next) => {
  const res = await axios.post(baseURL + '/token', qs.stringify(Object.assign({}, config, {
    code: ctx.query.code,
    grant_type: 'authorization_code',
    client_secret: process.env.SECRET,
  })));
  const token = res.data.access_token;
  const profile = await axios.get('https://graph.microsoft.com/v1.0/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  ctx.body = `<pre>${JSON.stringify(profile.data, null, 2)}</pre>`;
});

app.use(router.routes())
app.use(router.allowedMethods());

app.listen(2000);
