class Handler {
  constructor(name, func, metadata, pre, post) {
    if (name) this.name = name;
    if (func) this.func = func;
    if (metadata) this.metadata = metadata;
    if (pre) this.pre = pre;
    if (post) this.post = post;
  }

  // name
  set name(name) {
    if (typeof name !== 'string' || name.length <= 0) {
      throw new Error('Invalid argument. "name" accepts a non-empty string');
    }

    this._name = name;
  }

  get name() {
    return this._name;
  }

  // pre
  set pre(pre) {
    if (typeof pre !== 'function') {
      throw new Error('Invalid argument. "pre" accepts a function');
    }

    this._pre = pre;
  }

  get pre() {
    return this._pre;
  }

  // func
  set func(func) {
    if (typeof func !== 'function') {
      throw new Error('Invalid argument. "func" accepts a function');
    }

    this._func = func;
  }

  get func() {
    return this._func;
  }

  // post
  set post(post) {
    if (typeof post !== 'function') {
      throw new Error('Invalid argument. "post" accepts a function');
    }

    this._post = post;
  }

  get post() {
    return this._post;
  }

  // metadata
  set metadata(metadata) {
    if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) {
      throw new Error('Invalid argument. "metadata" accepts a non-null, non-array object');
    }

    this._metadata = metadata;
  }

  get metadata() {
    return this._metadata
  }

  // everything else
  fire(data, req, res) {
    if (typeof this.func !== 'function') {
      throw new Error(`No main function in handler: ${this.name}`);
    }

    const result = data;

    console.log(`Before pre-function: ${result}`);
    if (typeof this.pre === 'function') result = this.pre(data, req);
    console.log(`After pre-function, before main function: ${result}`);
    result = this.func(result);
    console.log(`After main function, before post-function: ${result}`);
    if (typeof this.post === 'function') result = this.post(result, res);
    console.log(`After post-function: ${result}`);

    return result;
  }
}

module.exports = Handler;
