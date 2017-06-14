'use strict';

const Koa = require('koa');
const serve = require('koa-static');
const Router = require('koa-router');
const body = require('koa-bodyparser');

const microsoft = require('./lib/microsoft');

const app = new Koa();
const router = new Router();

router.use('/microsoft', microsoft.router.routes());

app.context.store = new Map();

app.use(body())
app.use(serve(__dirname + '/static'));
app.use(router.routes())
app.use(router.allowedMethods());

app.listen(2000);
