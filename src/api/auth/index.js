const Router = require('koa-router');
const auth = new Router();
const authCtrl = require('./auth.controller');

auth.post('/register/local', authCtrl.localRegister);
auth.post('/register/social', authCtrl.socialRegister);
auth.post('/login/local', authCtrl.localLogin);
auth.get('/exists/:key(email|username)/:value', authCtrl.exists);
auth.post('/logout', authCtrl.logout);
auth.get('/check', authCtrl.check);
auth.post('/exists/social/:provider(facebook|google)', authCtrl.socialExists);
auth.get('/callback/google', authCtrl.getSocialToken);
auth.post('/verify-social/:provider(facebook|google)', authCtrl.verifySocial);
module.exports = auth;