'use strict';

const Koa = require('koa');
const Router = require('koa-router');
const body = require('koa-bodyparser');

const microsoft = require('./lib/microsoft');

const app = new Koa();
const router = new Router();

router.use('/microsoft', microsoft.router.routes());

app.use(body());
app.use(router.routes())
app.use(router.allowedMethods());

app.listen(2000);
