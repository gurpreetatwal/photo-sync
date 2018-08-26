'use strict';

const {join} = require('path');
const Koa = require('koa');
const serve = require('koa-static');
const Router = require('koa-router');
const body = require('koa-bodyparser');
const session = require('koa-session');

const config = require('./config');
const facebook = require('./lib/facebook');
const microsoft = require('./lib/microsoft');

const PORT = config.get('port');

const app = new Koa();
const router = new Router();

app.keys = [config.get('secret')];

router.use('/microsoft', microsoft.router.routes());
router.use('/facebook', facebook.router.routes());

router.get('/', async (ctx, next) => {
  if (ctx.session.userId) ctx.redirect('/sync');
  else if (ctx.session.facebook && ctx.session.microsoft) {
    // TODO load the user from the DB
    ctx.redirect('/sync');
  } else await next();
});

app.context.store = new Map();

app.use(session(app));
app.use(body());
app.use(router.routes());
app.use(router.allowedMethods());
app.use(serve(join(__dirname, 'static')));

app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));
