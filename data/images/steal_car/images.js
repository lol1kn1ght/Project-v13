const fs = require("fs");

let readdir = dir =>
  new Promise(resolve =>
    fs.readdir(dir, (err, data) =>
      resolve(data.map(image_file => dir + "\\" + image_file))
    )
  );

let router = new Proxy(
  {},
  {
    get(target, prop) {
      try {
        return readdir(__dirname + "\\" + prop);
      } catch (e) {
        return undefined;
      }
    }
  }
);

module.exports = router;
