let koa = require('koa');

let app = koa();

let Router = require('./router');
let router = new Router();

app.use(router.middleware());

app.use(function *(){
  this.body = 'Hello World';
});



app.listen(8080);