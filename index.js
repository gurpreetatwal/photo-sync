'use strict';

const {join} = require('path');
const Koa = require('koa');
const serve = require('koa-static');
const Router = require('koa-router');
const body = require('koa-bodyparser');

const config = require('./config');
const facebook = require('./lib/facebook');
const microsoft = require('./lib/microsoft');

const PORT = config.get('port');

const app = new Koa();
const router = new Router();

router.use('/microsoft', microsoft.router.routes());
router.use('/facebook', facebook.router.routes());

app.context.store = new Map();

app.use(body());
app.use(serve(join(__dirname, 'static')));
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));
