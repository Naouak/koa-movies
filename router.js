let fs = require('fs');
let path = require('path');

class Router{
  constructor(options = {}){
    this._controllerDirectory = options.directory || path.join(__dirname, "controllers");
  }
  
  /**
   *
   * @returns {Promise}
   */
  getControllers(){
    return new Promise(
      (resolve, reject)=>
        fs.readdir(
          this._controllerDirectory,
          (err, files) => err?reject(err):resolve(files)
        )
    );
  }
  
  *route(method, url, ctx, next){
   let [, controller = "home", action = "index", ...vars] = url.split('/');
   let controllers = yield this.getControllers();
   
   
   if(controllers.indexOf(controller+".js") < 0){
     // No controller found : 404
     console.error("Controller "+controller+" not found.");
     ctx.response.status = 404;
     return;
   }
   
   let controllerObject = require(path.join(this._controllerDirectory, controller+".js"));
   
   action=action||"index";
   
   if(!controllerObject || !controllerObject[action]){
     console.error("Action "+controller+"."+action+" not found.");
     ctx.response.status = 404;
     return;
   }
   
   let generator = controllerObject[action].bind(ctx, next, ...vars);
   yield* generator();
   
  }
  
  middleware(){
    let self = this;
    return function *(next){
      yield *self.route(this.request.method, this.request.url, this, next);
    }
  }
}

module.exports = Router;