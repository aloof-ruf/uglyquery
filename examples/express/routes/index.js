var express = require('express');
var router = express.Router();

const Endpoint = require('../../../src/express/Endpoint');
const handlers = require('../modules/handlers');

const generalEndpoint = new Endpoint();
generalEndpoint.handlers = handlers.handlers;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/general', function(req, res) {
  return generalEndpoint.respond(req, res);
});

module.exports = router;
