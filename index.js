'use strict';

const {join} = require('path');
const Koa = require('koa');
const serve = require('koa-static');
const Router = require('koa-router');
const body = require('koa-bodyparser');
const session = require('koa-session');

const config = require('./config');
const facebook = require('./lib/facebook');
const knex = require('./lib/knex');
const microsoft = require('./lib/microsoft');

const PORT = config.get('port');

const app = new Koa();
const router = new Router();

app.keys = [config.get('secret')];

router.use('/microsoft', microsoft.router.routes());
router.use('/facebook', facebook.router.routes());

router.get('/', async (ctx, next) => {
  if (ctx.session.user) {
    // user has logged in with at least one account and has used service before
    ctx.redirect('/sync');
  } else if (ctx.session.facebook && ctx.session.microsoft) {
    // user has logged in with both accounts but has not used service before
    // create user and redirect to page
    ctx.session.user = await knex('user').insert(
      {
        /* eslint-disable camelcase */
        facebook_id: ctx.session.facebook,
        microsoft_id: ctx.session.microsoft,
        /* eslint-enable */
      },
      'id',
    );

    ctx.redirect('/sync');
  } else if (ctx.session.facebook || ctx.session.microsoft) {
    // user has logged in with atleast one account, might or might not have used service before
    ctx.session.user = await knex('user')
      .select('id')
      .where('facebook_id', ctx.session.facebook || null)
      .orWhere('microsoft_id', ctx.session.microsoft || null)
      .first();

    // user has used service before
    if (ctx.session.user) {
      return ctx.redirect('/sync');
    }

    // user has not used service and needs to login with other service still
    if (!ctx.session.facebook) {
      ctx.redirect('/facebook');
    } else if (!ctx.session.microsoft) {
      ctx.redirect('/microsoft');
    }
  } else {
    await next();
  }
});

app.context.store = new Map();

app.use(session(app));
app.use(body());
app.use(router.routes());
app.use(router.allowedMethods());
app.use(serve(join(__dirname, 'static')));

app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));
