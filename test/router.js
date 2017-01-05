let assert = require('assert');
let should = require('should');
let path = require('path');

let Router = require('../router');
describe('Router', function(){
  it("should provide a default path to controllers directory", function(){
    let router = new Router();
    router._controllerDirectory.should.equal(path.join(__dirname, "../controllers"));
  });
  
  it("should find all controllers in the directory", function(done){
    let router = new Router({directory: path.join(__dirname,'fixtures/controllers')});
    
    router.getControllers()
      .then(files=>{
        files.should.have.lengthOf(1);
        files.should.have.property(0,'test.js');
        done();
      })
      .catch(done);
  });
  
  it("should fail on unknown path", function(done){
    let router = new Router({directory: path.join(__dirname,"tagada")});
    
    router.getControllers()
      .then(files=>{
        done("it should not have return files");
      })
      .catch(() => done());
  });
  
  it("should return a generator for the middleware", function(){
    let router = new Router({directory: path.join(__dirname,'fixtures/controllers')});
    let middleware = router.middleware().bind({request: { url: '/', method: 'GET'}});
    let returnValue = middleware().next();
    
    returnValue.should.have.property('value');
    returnValue.should.have.property('done');
  });
  
  it("should yield the correct action for given url", function(done){
    let router = new Router({directory: path.join(__dirname,'fixtures/controllers')});
    
    let route = router.route(null,"/test/test");
    
    route.next().value
      .then(value=>route.next(value))
      .then(function(actionYield){
        actionYield.value.should.equal("tagada");
        done();
      })
      .catch(done);
  });
  
  it("should redirect to action index if no action is provided", function(done){
    let router = new Router({directory: path.join(__dirname,'fixtures/controllers')});
    let ctx = {};
    let route = router.route(null,"/test/",ctx);
    
    route.next().value
      .then(value=>route.next(value))
      .then(function(){
        ctx.body.should.equal("index");
        done();
      })
      .catch(done);
  });
  
  it("should 404 on unknown controller", function(done){
    let router = new Router({directory: path.join(__dirname,'fixtures/controllers')});
    let ctx = {response:{}};
    let route = router.route(null,"/tagada/test",ctx);
    
    route.next().value
      .then(value=>route.next(value))
      .then(function(){
        ctx.response.status.should.equal(404);
        done();
      })
      .catch(done);
  });
  
  it("should 404 on unknown action", function(done){
    let router = new Router({directory: path.join(__dirname,'fixtures/controllers')});
    let ctx = {response:{}};
    let route = router.route(null,"/test/tsouintsouin",ctx);
    
    route.next().value
      .then(value=>route.next(value))
      .then(function(){
        ctx.response.status.should.equal(404);
        done();
      })
      .catch(done);
  });
});