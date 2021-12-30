module.exports = {
  config: require("./config.json"),
  random: require("../functions/random"),
  Profile: require("../functions/profile"),
  time: require("../functions/msToTime"),
  images: {
    steal_car: require("../data/images/steal_car/images.js"),
    default: require("../data/images/default/images.json")
  },
  games: {
    Steal_car: require("../data/modules/steal_car")
  },
  dialogues: (() => {
    let config = require("./config.json");
    return require(`../data/dialogues/${config.language}.json`);
  })()
};
