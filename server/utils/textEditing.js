function mergeDeltas(deltas) {
  const mergedDeltas = [];

  for (const deltaObj of deltas) {
    console.log(deltaObj);
    const ops = deltaObj.ops;
    if (!Array.isArray(ops) || ops.length === 0) continue;

    for (const delta of ops) {
      const op = delta.insert || delta.delete || delta.retain;
      if (op) {
        const prevDelta = mergedDeltas[mergedDeltas.length - 1];

        if (
          prevDelta &&
          prevDelta[op] &&
          isEqualAttributes(prevDelta.attributes, delta.attributes)
        ) {
          prevDelta[op] += delta[op];
        } else {
          mergedDeltas.push({ [op]: delta[op], attributes: delta.attributes });
        }
      }
    }
  }
  console.log(mergedDeltas);
  return mergedDeltas;
}

// Helper function to compare if two attribute objects are equal
function isEqualAttributes(attr1, attr2) {
  return JSON.stringify(attr1) === JSON.stringify(attr2);
}

module.exports = {
  mergeDeltas,
};
