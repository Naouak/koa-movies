module.exports = {
  *index(){
    this.body = "index";
  },
  *test(){
    yield "tagada";
  },
  *tagada(){
  }
};