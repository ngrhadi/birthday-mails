const express = require('express');
const users = require('../controller/users');

const routes = express.Router()

routes.get('/', users.getUsers)
routes.post('/', users.addUsers)
routes.put('/:id', users.editUsers)
routes.delete('/:id', users.deleteUser)

module.exports = routes
