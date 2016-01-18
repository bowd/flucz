import React from 'react';
import invariant from 'fbjs/lib/invariant';

export default class Validator {
  constructor(Component, options) {
    this.Component = Component;
    this.options = options;
  }

  validate() {
    let {Component, options} = this;
    if (typeof Component.prototype.render === 'function') {
      this.validateNormalComponent();
    } else {
      this.validateStatelessComponent();
    }
    // Validate cursor definition
    this.validateCursorsDefinition();
  }

  name() {
    let {Component} = this;
    return (
      Component.prototype instanceof React.Component ?
        Component.displayName || '<displayName missing>'
      : Component.name || '<anonymous function>'
    );
  }

  validateStatelessComponent() {
    let {childPropTypes} = this.options;
    invariant(
      typeof childPropTypes === 'object',
      'You must specify childPropTypes in the connect '+
        'for all wrapped stateless components. Check: %s',
      this.name()
    );
  }

  validateNormalComponent() {
    let {Component} = this;
    invariant(
      typeof Component.propTypes === 'object',
      'You must specify propTypes for all wrapped components. Check: %s',
      this.name()
    );
  }

  validateCursorsDefinition() {
    let {cursors} = this.options;

    invariant(
      typeof cursors === 'function' || typeof cursors === 'object',
      'Cursor definition can be either a function of props that '+
        'returns a cursor object, or a plain cursor object. Check: %s',
      this.name()
    );

    if (typeof cursors === 'function') {
      this.validateDynamicCursors();
    } else {
      this.validateCursorsObject(cursors);
    }
  }

  validateDynamicCursors() {
    let {options, Component} = this;
    let {cursors, defaultProps } = options;
    let defaultCursors;

    try { defaultCursors = cursors(defaultProps || {}); }
    catch (e) {
      invariant(
        typeof defaultProps === 'object',
        'The cursors function is throwing an error with the defaultProps. Check: %s',
        this.name()
      );
    }

    this.validateCursorsObject(defaultCursors);
  }

  validateCursorsObject(cursorsObject) {
    for (let key of Object.keys(cursorsObject)) {
      let path = cursorsObject[key];
      invariant(
        key.indexOf('.') === -1,
        'All keys defined in cursors must not contain dots. Check "%s" of %s.',
        key, this.name()
      )

      invariant(
        path instanceof Array && path.length >= 1,
        'The values of the cursors object must be valid path arrays. Check "%s" of %s',
        key, this.name()
      )
    }
  }
}
