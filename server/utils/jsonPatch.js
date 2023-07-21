const jsonPatch = require("fast-json-patch");

function applyDeltaChanges(document, delta) {
  const patch = delta;

  const res = jsonPatch.applyPatch(document.content, patch);
  console.log(res);
}

module.exports = applyDeltaChanges;
