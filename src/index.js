/*
 * Experimental flux implementation based on redux patters
 */

import Baobab from 'baobab';


let reducers = [];
let tree;

function reduce(tree, action) {
  for (let reduce of reducers) {
    reduce.call(null, tree, action);
  }
}

export function init(_reducers, initialState = {}) {
  reducers = _reducers;
  tree = new Baobab(initialState);
  // Expose the state tree in development
  if (process.env.NODE_ENV === 'development') { window.stateTree = tree; }
  reduce(tree, {type: 'INIT'});
}

export function getTree() {
  return tree;
}

export function dispatch(action) { reduce(tree, action); }
export {connect} from './wrapper.js';

export function storeSwitch({map, cursor, action}) {
  let {type, payload} = action;
  let handler = map[type];
  if (typeof handler === 'function') {
    handler.call(null, cursor, payload);
  }
}
