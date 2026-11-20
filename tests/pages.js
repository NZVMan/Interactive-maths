// Finds every hand-written lesson page (any topic folder) so tests never need editing when lessons are added.
const fs = require("fs"), path = require("path");
const root = path.resolve(__dirname, "..");
module.exports = function lessonPages() {
  const out = [];
  fs.readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory()).forEach((d) => {
    fs.readdirSync(path.join(root, d.name)).filter((f) => /^lesson-\d+-.*\.html$/.test(f)).sort((a, b) => parseInt(a.split("-")[1]) - parseInt(b.split("-")[1])).forEach((f) => out.push(d.name + "/" + f));
  });
  return out;
};
