const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const Todo = require('../models/Todo');

module.exports = Router()
  .put('/:id', authenticate, authorize, async (req, res, next) => {
    try {
      const updatedTodo = await Todo.updateTodo(req.params.id, req.body);
      res.json(updatedTodo);
    } catch (e) {
      next(e);
    }
  })
  .post('/', authenticate, async (req, res, next) => {
    try {
      const newTodo = await Todo.insert({ ...req.body, user_id: req.user.id });
      res.json(newTodo);
    } catch (e) {
      next(e);
    }
  })
  .get('/', authenticate, async (req, res, next) => {
    try {
      const allTodos = await Todo.getAll(req.user.id);
      res.json(allTodos);
    } catch (e) {
      next(e);
    }
  });
