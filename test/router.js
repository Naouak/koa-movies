/* eslint-env node, mocha */
// noinspection Eslint
const should = require('should');
const path = require('path');

const Router = require('../router');

describe('Router', () => {
  it('should provide a default path to controllers directory', () => {
    const router = new Router();
    router.controllerDirectory.should.equal(path.join(__dirname, '../controllers'));
  });

  it('should find all controllers in the directory', (done) => {
    const router = new Router({ directory: path.join(__dirname, 'fixtures/controllers') });

    router.getControllers()
      .then((files) => {
        files.should.have.lengthOf(2);
        files.should.have.property(0, 'home.js');
        files.should.have.property(1, 'test.js');
        done();
      })
      .catch(done);
  });

  it('should fail on unknown path', (done) => {
    const router = new Router({ directory: path.join(__dirname, 'tagada') });

    router.getControllers()
      .then(() => {
        done('it should not have return files');
      })
      .catch(() => done());
  });

  it('should return a generator for the middleware', () => {
    const router = new Router({ directory: path.join(__dirname, 'fixtures/controllers') });
    const middleware = router.middleware().bind({ request: { url: '/', method: 'GET' } });
    const returnValue = middleware().next();

    returnValue.should.have.property('value');
    returnValue.should.have.property('done');
  });

  it('should yield the correct action for given url', (done) => {
    const router = new Router({ directory: path.join(__dirname, 'fixtures/controllers') });

    const route = router.route(null, '/test/test');

    route.next().value
      .then(value => (route.next(value)))
      .then((actionYield) => {
        actionYield.value.should.equal('tagada');
        done();
      })
      .catch(done);
  });

  it('should redirect to home.index if no controller is provided', (done) => {
    const router = new Router({ directory: path.join(__dirname, 'fixtures/controllers') });
    const ctx = {};
    const route = router.route(null, '/', ctx);

    route.next().value
      .then(value => (route.next(value)))
      .then(() => {
        ctx.body.should.equal('home.index');
        done();
      })
      .catch(done);
  });

  it('should redirect to action index if no action is provided', (done) => {
    const router = new Router({ directory: path.join(__dirname, 'fixtures/controllers') });
    const ctx = {};
    const route = router.route(null, '/test/', ctx);

    route.next().value
      .then(value => (route.next(value)))
      .then(() => {
        ctx.body.should.equal('index');
        done();
      })
      .catch(done);
  });

  it('should 404 on unknown controller', (done) => {
    const router = new Router({ directory: path.join(__dirname, 'fixtures/controllers') });
    const ctx = { response: {} };
    const route = router.route(null, '/tagada/test', ctx);

    route.next().value
      .then(value => (route.next(value)))
      .then(() => {
        ctx.response.status.should.equal(404);
        done();
      })
      .catch(done);
  });

  it('should 404 on unknown action', (done) => {
    const router = new Router({ directory: path.join(__dirname, 'fixtures/controllers') });
    const ctx = { response: {} };
    const route = router.route(null, '/test/tsouintsouin', ctx);

    route.next().value
      .then((value) => { route.next(value); })
      .then(() => {
        ctx.response.status.should.equal(404);
        done();
      })
      .catch(done);
  });
});
