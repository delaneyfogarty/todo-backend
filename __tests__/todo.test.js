const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');
const Todo = require('../lib/models/Todo');

const mockUser = {
  email: 'ains@flyyn.com',
  password: 'abcd1234',
};

const mockUser2 = {
  email: 'del@fog.com',
  password: 'ilovekitties',
};

const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? mockUser.password;

  const agent = request.agent(app);

  const user = await UserService.create({ ...mockUser, ...userProps });

  const { email } = user;
  await agent.post('/api/v1/users/sessions').send({ email, password });
  return [agent, user];
};

describe('users', () => {
  beforeEach(() => {
    return setup(pool);
  });

  it('UPDATE /api/v1/todos/:id should update an item', async () => {
    const [agent, user] = await registerAndLogin();
    const todo = await Todo.insert({
      task_name: 'laundry',
      user_id: user.id,
    });
    const resp = await agent
      .put(`/api/v1/todos/${todo.id}`)
      .send({ completed: true });
    expect(resp.status).toBe(200);
    expect(resp.body).toEqual({ ...todo, completed: true });
  });

  it('POST /api/v1/todos creates a new todo with the current user', async () => {
    const [agent, user] = await registerAndLogin();
    const newTodo = { task_name: 'nail appointment' };
    const resp = await agent.post('/api/v1/todos').send(newTodo);
    expect(resp.status).toEqual(200);
    expect(resp.body).toEqual({
      id: expect.any(String),
      user_id: user.id,
      task_name: newTodo.task_name,
      completed: false,
    });
  });
  it('GET /api/v1/todos should return all items associated with the authenticated user', async () => {
    const [agent, user] = await registerAndLogin();
    const user2 = await UserService.create(mockUser2);
    console.log('user2', user2);
    const user1Item = await Todo.insert({
      task_name: 'laundry',
      user_id: user.id,
    });
    await Todo.insert({
      task_name: 'grocery shopping',
      user_id: user2.id,
    });
    const resp = await agent.get('/api/v1/todos');
    console.log(resp.body);
    expect(resp.status).toEqual(200);
    expect(resp.body).toEqual([user1Item]);
  });

  it('GET /api/v1/todos should return a 401 if not authenticated', async () => {
    const resp = await request(app).get('/api/v1/todos');
    expect(resp.status).toEqual(401);
  });
  afterAll(() => {
    pool.end();
  });
});
