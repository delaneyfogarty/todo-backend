const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const Todo = require('../models/Todo');

module.exports = Router()
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
