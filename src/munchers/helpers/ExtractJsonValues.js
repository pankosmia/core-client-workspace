// Collect values for given keys (any nesting).
// Returns matched values (primitives, objects, arrays)
function ExtractJsonValues(root, keys){
  const keySet = new Set(keys);
  const out = [];
  const seen = new WeakSet();

  function walk(node){
    if (node === null || typeof node === 'undefined') return;
    if (typeof node !== 'object') return; // primitives can't contain keys
    if (seen.has(node)) return;           // skip circular references
    seen.add(node);

    if (Array.isArray(node)){
      for (const item of node){
        // if an array element itself is a matched value for some key, it's handled by parent object
        if (item && typeof item === 'object') walk(item);
      }
      return;
    }

    // node is an object
    for (const k of Object.keys(node)){
      const v = node[k];
      if (keySet.has(k)) out.push(v);      // push value exactly (primitive/object/array)
      if (v && typeof v === 'object') walk(v);
    }
  }

  walk(root);
  return out;
}

export default ExtractJsonValues;