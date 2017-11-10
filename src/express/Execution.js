class Execution {
  constructor(jsonBody, options) {
    // validate json body
    if (jsonBody.vars) {
      if (typeof jsonBody.vars !== 'object' || jsonBody.vars === null || Array.isArray(jsonBody.vars)) {
        throw new Error('Invalid argument in body. "vars" must be a non-null, non-array object');
      }

      this._variables = jsonBody.vars;
    }

    if (!jsonBody.body || !Array.isArray(jsonBody.body)) {
      throw new Error('Invalid body. "body" must exist and have an array value');
    }

    this._body = jsonBody.body;

    // validate options
    this._options = options;
  }

  execute(endpoint) {
    if (endpoint.constructor.name !== 'Endpoint') {
      throw new Error('Invalid argument. "execute" must be passed an "Endpoint" object');
    }

    return this._body.map((step) => {
      if (typeof step !== 'object' || step === null || Array.isArray(step)) {
        return new Error('Invalid step. Must be a non-null, non-array object');
      }

      return this.runCommand(step, endpoint);
    });
  }

  runCommand(step, endpoint) {
    // commands must have a "func" key
    if (typeof step.func !== 'string') {
      throw new Error('Invalid step. Must have a "func" key with a string value');
    }

    let result;

    // is func one of the internal commands? Yes: run it. No: find a handler. 
    if (typeof this[`_${step.func}_`] === 'function') {
      if (!step.exec) throw new Error('Invalid step. Internal command must have an "exec" key');

      result = this[`_${step.func}_`](step.exec, endpoint);
    }
    else if (endpoint.has(step.func)) {
      // need to figure out arguments before we fire off a handler
      const args = step.args;
      if (typeof args !== 'object' || args === null || Array.isArray(args)) {
        throw new Error('Invalid step. Arguments for a handler must be a non-null, non-array object');
      }

      // check for variables
      for (const key in args) {
        const value = args[key];

        // if the argument value is a string, we should check if it's a variable...
        if (typeof value === 'string' && value.match(/^\$\w+/) !== null) {
          const varValue = this._variables[value.substring(1)];
          if (varValue === 'undefined') throw new Error(`Invalid variable reference ${value}`);
          args[key] = varValue;
        }

        // otherwise- leave it alone!
      }

      result = endpoint.fire(step.func, args);
    }
    else {
      throw new Error(`Func "${step.func}" is not an internal command or handler for this endpoint`);
    }

    if (step.store) {
      if (typeof step.store !== 'string' || step.store.match(/^\$\w+/) === null) {
        throw new Error('Invalid step. "store" needs to reference a new or existing variable');
      }

      this._variables[step.store.substring(1)] = result;
    }

    return result;
  }

  /*
    the functions!
  */

  // _cond_(payload) {

  // }

  // _switch_(payload) {

  // }

  /*
    _echo_

    Accepts an array of JSON-valid elements. If passed an empty list- it will
    return true. If an item is an object, it is expected to have A SINGLE KEY
    that references a vanilla query command or a trigger available on an 
    endpoint- otherwise it is an error. Merely returns the result of evaluating
    everything in the list.
  */
  _echo_(payload, endpoint) {
    if (!Array.isArray(payload)) throw new Error('Invalid argument. "_echo_" must be passed an array');

    return payload.map((item) => {
      // if the argument value is a string, we should check if it's a variable...
      if (typeof item === 'string' && item.match(/^\$\w+/) !== null) {
        const varValue = this._variables[item.substring(1)];
        if (varValue === 'undefined') throw new Error(`Invalid variable reference ${item}`);
        return varValue;
      }
      else if (typeof item !== 'object' || item === null || Array.isArray(item)) return item;
      else return this.runCommand(item, endpoint);
    });
  }

  /*
    _and_

    Accepts an array of JSON-valid elements. If passed an empty list- it will
    return true. If an item is an object, it is expected to have A SINGLE KEY
    that references a vanilla query command or a trigger available on an 
    endpoint- otherwise it is an error. Stops evaluating the moment a falsey
    value shows up.
  */
  _and_(payload, endpoint) {
    if (!Array.isArray(payload)) throw new Error('Invalid argument. "_and_" must be passed an array');

    let result = true;
    for (const index in payload) {
      const item = payload[index];

      if (typeof item === 'string' && item.match(/^\$\w+/) !== null) {
        const varValue = this._variables[item.substring(1)];
        if (varValue === 'undefined') throw new Error(`Invalid variable reference ${item}`);
        result = result && !!varValue;
      }
      else if (typeof item !== 'object' || item === null || Array.isArray(item)) {
        result = result && !!item;
      }
      else {
        result = result && !!this.runCommand(item, endpoint);
      }

      if (!result) break;
    }

    return result;
  }

  /*
    _or_

    Accepts an array of JSON-valid elements. If passed an empty list- it will
    return true. If an item is an object, it is expected to have A SINGLE KEY
    that references a vanilla query command or a trigger available on an 
    endpoint- otherwise it is an error. Stops evaluating the moment a truthy
    value shows up.
  */
  _or_(payload) {
    if (!Array.isArray(payload)) throw new Error('Invalid argument. "_or_" must be passed an array');

    if (payload.length === 0) return true;

    let result = false;
    for (const index in payload) {
      const item = payload[index];

      if (typeof item !== 'object' || item === null || Array.isArray(item)) {
        result = result || !!item;
      }
      else {
        result = result || !!this.runCommand(item, endpoint);
      }

      if (result) break;
    }

    return result;
  }

  /*
    _eq_

    Accepts an array of JSON-valid elements. If passed an empty list- it will
    return true. If an item is an object, it is expected to have A SINGLE KEY
    that references a vanilla query command or a trigger available on an 
    endpoint- otherwise it is an error. Stops evaluating the moment one item
    does not have a value (or return value) equal to the previous item (not
    counting the first item).
  */
  _eq_(payload) {
    if (!Array.isArray(payload)) throw new Error('Invalid argument. "_eq_" must be passed an array');

    let result = true;
    let prev;
    for (const index in payload) {
      const item = payload[index];

      if (typeof item !== 'object' || item === null || Array.isArray(item)) {
        if (prev !== 'undefined') result = prev === item;
        sprev = item;
      }
      else {
        const commandResult = this.runCommand(item, endpoint);
        if (prev !== 'undefined') result = prev === commandResult;
        prev = commandResult;
      }

      if (!result) break;
    }

    return result;
  }

  /*
    _neq_

    Accepts an array of JSON-valid elements. If passed an empty list- it will
    return true. If an item is an object, it is expected to have A SINGLE KEY
    that references a vanilla query command or a trigger available on an 
    endpoint- otherwise it is an error. Stops evaluating the moment one item
    has a value (or return value) equal to the previous item (not counting the 
    first item).
  */
  _neq_(payload) {
    if (!Array.isArray(payload)) throw new Error('Invalid argument. "_neq_" must be passed an array');

    let result = true;
    let prev;
    for (const index in payload) {
      const item = payload[index];

      if (typeof item !== 'object' || item === null || Array.isArray(item)) {
        if (prev !== 'undefined') result = prev !== item;
        prev = item;
      }
      else {
        const commandResult = this.runCommand(item, endpoint);
        if (prev !== 'undefined') result = prev !== commandResult;
        prev = commandResult;
      }

      if (!result) break;
    }

    return result;
  }

  /*
    _not_

    Accepts a JSON-valid item. Returns the compliment of whatever value is 
    passed. If the item is an object, it is expected to have A SINGLE KEY that 
    references a vanilla query command or a trigger available on an endpoint- 
    otherwise it is an error.
  */
  _not_(payload) {
    if (typeof payload !== object || payload === null || Array.isArray(payload)) {
      throw new Error('Invalid argument. "_not_" must be passed a non-null, non-array object');
    }

    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      if (prev !== 'undefined') result = prev !== item;
      prev = item;
    }
    else {
      const commandResult = this.runCommand(item, endpoint);
      if (prev !== 'undefined') result = prev !== commandResult;
      prev = commandResult;
    }
  }

  // _gt_(payload) {
  //   if (typeof payload !== object || payload === null || Array.isArray(payload)) {
  //     throw new Error('Invalid argument. "_gt_" must be passed a non-null, non-array object');
  //   }

  //   if (typeof item !== 'object' || item === null || Array.isArray(item)) {
  //     if (prev !== 'undefined') result = prev !== item;
  //     prev = item;
  //   }
  //   else {
  //     const commandResult = this.runCommand(item);
  //     if (prev !== 'undefined') result = prev !== commandResult;
  //     prev = commandResult;
  //   }
  // }

  // _gte_(payload) {

  // }

  // _lt_(payload) {

  // }

  // _lte_(payload) {

  // }

  _map_(payload) {
    if (!Array.isArray(payload)) throw new Error('Invalid argument. "_map_" must be passed an array');

    let result = true;
    for (const index in payload) {
      const item = payload[index];

      if (typeof item === 'string' && item.match(/^\$\w+/) !== null) {
        const varValue = this._variables[item.substring(1)];
        if (varValue === 'undefined') throw new Error(`Invalid variable reference ${item}`);
        result = result && !!varValue;
      }
      else if (typeof item !== 'object' || item === null || Array.isArray(item)) {
        result = result && !!item;
      }
      else {
        result = result && !!this.runCommand(item, endpoint);
      }

      if (!result) break;
    }

    return result;
  }

  // _reduce_(payload) {

  // }

  /*
    end of the functions!
  */

  get results() {
    return this._results || [null];
  }
}

module.exports = Execution;
