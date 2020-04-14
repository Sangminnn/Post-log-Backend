const Router = require('koa-router');

const api = new Router();
// const books = require('books');
const auth = require('./auth');
const write = require('./write');

api.use('/auth', auth.routes());
api.use('/write', write.routes());

// api.use('/books', books.routes());

module.exports = api;