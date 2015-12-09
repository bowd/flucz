import React from 'react';
import equals from 'fbjs/lib/shallowEqual';
import WrapperValidator from './lib/wrapper-validator';
import {getTree} from './index.js';

export function connect(_options) {
  let options = _options.cursors === undefined ? {cursors: _options} : _options;
  return function(Component) {
    return wrapperConstructor(Component, options);
  }
}

export function getCursors(cursors, props={}) {
  if (typeof cursors === 'function') {
    return cursors.call(null, props);
  } else {
    return cursors;
  }
}

let wrapperConstructor = function(Component, options) {
  let {cursors, propTypes={}, child, defaultProps} = options;
  let validator = new WrapperValidator(Component, options);
  validator.validate();

  let childPropTypes = Component.propTypes || options.childPropTypes;
  let componentName = Component.dislayName || Component.name;

  let wrapperPropTypes = {...childPropTypes, ...propTypes};
  // Prune propTypes derived from state
  for (let prop of Object.values(getCursors(cursors, defaultProps))) {
    delete wrapperPropTypes[prop];
  }

  return class Wrapper extends React.Component {
    static propTypes = wrapperPropTypes
    static displayName = `${componentName}-Connector`
    static _isWrapper = true;
    static _child = Component;
    static _original = Component._isWrapper ? Component._original : Component;

    constructor(props) {
      super(props);
      let tree = getTree();
      this._cursors = getCursors(cursors, props);
      this._watcher = tree.watch(this._cursors);
      this.state = this._watcher.get();
    }

    componentWillMount() {
      this._watcher.on('update', () => this.setState(this._watcher.get()))
    }

    componentWillReceiveProps(nextProps) {
      this._cursors = getCursors(cursors, nextProps);
      this._watcher.refresh(this._cursors);
      this.setState(this._watcher.get());
    }

    componentWillUnmount() {
      this._watcher.release();
      delete this._watcher;
    }

    render() {
      let {...propsFromState} = this.state;
      let props = {...propsFromState, ...this.props};

      for (let prop in propTypes) {
        if (Object.keys(childPropTypes).indexOf(prop) === -1) {
          delete props[prop];
        }
      }

      return (<Component {...props} />);
    }
  };
}
