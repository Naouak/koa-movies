const fs = require('fs');
const path = require('path');
const winston = require('winston');

class Router {
  constructor(options = {}) {
    this._controllerDirectory = options.directory || path.join(__dirname, 'controllers');
  }

  get controllerDirectory() {
    return this._controllerDirectory;
  }

  /**
   *
   * @returns {Promise}
   */
  getControllers() {
    return new Promise(
      (resolve, reject) =>
        (fs.readdir(this._controllerDirectory, (err, files) => (err ? reject(err) : resolve(files)))));
  }

  * route(method, url, ctx, next) {
    const [, controller = 'home', action = 'index', ...vars] = url.split('/');
    const controllers = yield this.getControllers();


    if (controllers.indexOf(`${controller}.js`) < 0) {
      // No controller found : 404
      winston.error(`Controller ${controller} not found.`);
      ctx.response.status = 404;
      return;
    }

    /* eslint import/no-dynamic-require: 0 global-require: 0 */
    const controllerObject = require(path.join(this._controllerDirectory, `${controller}.js`));

    const finalAction = action || 'index';

    if (!controllerObject || !controllerObject[finalAction]) {
      winston.error(`Action ${controller}.${finalAction} not found.`);
      ctx.response.status = 404;
      return;
    }

    const generator = controllerObject[finalAction].bind(ctx, next, ...vars);
    yield* generator();
  }

  middleware() {
    const self = this;
    return function* middleware(next) {
      yield* self.route(this.request.method, this.request.url, this, next);
    };
  }
}

module.exports = Router;
