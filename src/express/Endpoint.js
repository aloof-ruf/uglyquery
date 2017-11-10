const Execution = require('./Execution');

function jsonBody(body) {
  return Promise.resolve().then(() => JSON.parse(body));
}

// eventually want to support XML and YAML request bodies
//
// function xmlBody(body) {
//   // process an xml body
// }
//
// function yamlBody(body) {
//   // process a yaml body
// }
//

class Endpoint {
  constructor(handlers, pre, post) {
    if (handlers) this.handlers = handlers;
    if (pre) this.pre = pre;
    if (post) this.post = post;
  }

  // handlers
  set handlers(handlers) {
    if (!Array.isArray(handlers) || !handlers.every(item => item.constructor.name === 'Handler')) {
      throw new Error('Invalid argument. "handlers" must be passed an array of "Handler" objects');
    }

    this._handlers = handlers.reduce((acc, handler) => {
      acc[handler.name] = handler;
      return acc;
    }, {});
  }

  get handlers() {
    return this._handlers;
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

  has(func) {
    return this._handlers[func];
  }

  fire(func, args) {
    if (!this.has(func)) throw new Error(`Invalid handler "${func}" does not exist in this endpoint`);

    return this._handlers[func]._func(args);
  }

  respond(req, res) {
    const contentType = req.header('Content-Type');
    console.log(`Processing reqeust body (endpoint). Content-Type: ${contentType}`);

    let data = null;
    if (contentType === 'text/xml') data = xmlBody(req.body);
    else if (contentType === 'application/json') data = req.body
    else if (contentType === 'application/x-yaml' || contentType === 'text/yaml') data = yamlBody(req.body);
    else throw new Error(`Invalid content type: ${contentType}`);

    console.log(`Before pre-function (endpoint): ${JSON.stringify(data)}`);
    if (typeof this.pre === 'function') data = this.pre(data, req);
    console.log(`After pre-function, before handler (endpoint): ${JSON.stringify(data)}`);

    // now we need to parse the body into something we can use...
    const execution = new Execution(data, {});
    const result = execution.execute(this);

    console.log(`After handler, before post-function (endpoint): ${result}`);
    if (typeof this.post === 'function') result = this.post(result, res);
    console.log(`After post-function (endpoint): ${result}`);

    // now send the response...
    res.json(result);
  }
}

module.exports = Endpoint;
