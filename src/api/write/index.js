const Router = require('koa-router');
const write = new Router();
const writeCtrl = require('./write.controller');

write.get('/loadPost/:id', writeCtrl.loadPost);
write.get('/loadPosts', writeCtrl.loadPosts);
write.post('/newPost', writeCtrl.newPost);

// auth.get('/exists/:key(email|username)/:value', authCtrl.exists);

module.exports = write;