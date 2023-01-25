const express = require('express');
const isDate = require('../controller/times');

const routes = express.Router();

routes.get('/server', isDate.timeServer);
routes.get('/birth', isDate.isBirthTime);


module.exports = routes;
