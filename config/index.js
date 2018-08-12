'use strict';

const path = require('path');
const convict = require('convict');

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development'],
    default: 'production',
    env: 'NODE_ENV',
    arg: 'node-env',
  },
  port: {
    doc: 'The port for the http server to listen on.',
    format: 'port',
    default: -1,
    env: 'PORT',
    arg: 'port',
  },
  host: {
    doc: 'URL pointing to the hosted code, used as base for callback urls',
    format: 'url',
    default: null,
    env: 'HOST',
    arg: 'host',
  },
  microsoft: {
    id: {
      doc: 'Microsoft application client id',
      format: String,
      default: null,
      env: 'MS_ID',
    },
    secret: {
      doc: 'Microsoft application client secret',
      format: String,
      default: null,
      env: 'MS_SECRET',
    },
    scopes: {
      doc: 'List of scopes to request from Microsoft',
      format: Array,
      default: null,
    },
  },
  facebook: {
    id: {
      doc: 'Facebook application client id',
      format: String,
      default: null,
      env: 'FB_ID',
    },
    secret: {
      doc: 'Facebook application secret',
      format: String,
      default: null,
      env: 'FB_SECRET',
    },
  },
  redis: {
    host: {
      doc: 'Hostname for redis',
      format: String,
      default: null,
    },
    port: {
      doc: 'Port to connect on',
      format: 'port',
      default: null,
    },
    password: {
      doc: 'Password to use when connecting',
      format: String,
      default: null,
    },
  },
  database: {
    host: {
      doc: 'hostname for the database server',
      format: String,
      default: null,
      env: 'PGHOST',
    },
    port: {
      doc: 'port for the database server',
      format: 'port',
      default: null,
      env: 'PGPORT',
    },
    user: {
      doc: 'user to connect to database server as',
      format: String,
      default: null,
      env: 'PGUSER',
    },
    password: {
      doc: 'password for the database user',
      format: String,
      default: null,
      env: 'PGPASSWORD',
    },
    database: {
      doc: 'name of the database to use on the database server',
      format: String,
      default: null,
      env: 'PGDATABASE',
    },
  },
});

const configFile = `${config.get('env')}.json`;

config.loadFile(path.resolve(__dirname, configFile));

try {
  config.loadFile(path.resolve(__dirname, 'secret', configFile));
} catch (e) {
  // ignore no such file errors, secrets might be passed via env args
  if (e.code !== 'ENOENT') throw e;
}

config.validate({allowed: 'strict'});

module.exports = config;
