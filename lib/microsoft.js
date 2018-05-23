'use strict';

const qs = require('querystring');
const axios = require('axios');
const Router = require('koa-router');

const config = require('../config');

const base = {
  /* eslint-disable camelcase */
  client_id: config.get('microsoft.id'),
  client_secret: config.get('microsoft.secret'),
  redirect_uri: `${config.get('host')}/microsoft/callback`,
  scope: config.get('microsoft.scopes').join(' '),
  /* eslint-enable */
};

const baseURL = 'https://login.microsoftonline.com/common/oauth2/v2.0';

const router = new Router();

const ms = {};
ms.generateAuthorize = function() {
  const query = Object.assign({}, base, {
    /* eslint-disable camelcase */
    response_type: 'code',
    response_mode: 'query',
    /* eslint-enable */
  });

  return `${baseURL}/authorize?${qs.stringify(query)}`;
};

ms.exchangeCode = function(code) {
  const query = Object.assign({}, base, {
    code,
    // eslint-disable-next-line camelcase
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
  ctx.store.set('microsoft', res.data);

  if (ctx.store.get('facebook')) {
    ctx.redirect('/sync');
  } else {
    ctx.redirect('/');
  }
});

});

ms.router = router;
module.exports = ms;
