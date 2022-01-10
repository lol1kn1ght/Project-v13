module.exports = function(args) {
  class Event {
    constructor(args) {
      Object.assign(this, args);
    }

    async execute() {
      console.log("re");
    }
  }

  new Event(args).execute();
};
