require('dotenv').config();

const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();

const api = require('api');

const mongoose = require('mongoose');
const bodyParser = require('koa-bodyparser');

const jwt = require('jsonwebtoken');
const { jwtMiddleware } = require('lib/token');

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(
  (response) => {
    console.log('Successfully connected to mongodb');
  }
).catch(e => {
  console.error(e);
});

const port = process.env.PORT || 4000;

app.use(bodyParser()).use(router.routes()).use(router.allowedMethods());

app.use(jwtMiddleware);

router.use('/api', api.routes());

app.listen(port, () => {
  console.log('good connection in port ' + port);
});

const token = jwt.sign({ foo: 'bar' }, 'secret-key', { expiresIn: '1d' }, (err, token) => {
  if(err) {
      console.log(err);
      return;
  }
  console.log(token);
});