// Write your tests here
const request = require('supertest')
const server = require('./server')
const db = require('../data/dbConfig')

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})
afterAll(async () => {
  await db.destroy()
})

test('sanity', () => {
  expect(true).toBe(true)
})

describe('POST /register', () => {
  test('successful status and response', async () => {
    const res = await request(server)
    .post('/api/auth/register')
    .send({ username: 'test', password: '1234' })
    expect(res.status).toEqual(201)
  })
  test('username taken', async () => {
    const res = await request(server)
    .post('/api/auth/register')
    .send({ username: 'test', password: '1234' })
    expect(res.status).toEqual(422)
  })
  test('missing information', async () => {
    const res = await request(server)
    .post('/api/auth/register')
    .send({ username: 'test2' })
    expect(res.status).toEqual(401)
  })
})

describe('POST /login', () => {
  beforeEach(async () => {
    await request(server)
    .post('/api/auth/register')
    .send({ username: 'test', password: '1234' })
  })
  test('successful status and response', async () => {
    const res = await request(server)
    .post('/api/auth/login')
    .send({ username: 'test', password: '1234' })
    expect(res.status).toEqual(200)
  })
  test('username does not exist', async () => {
    const res = await request(server)
    .post('/api/auth/login')
    .send({ username: 'test2', password: '1234' })
    expect(res.status).toEqual(401)
  })
  test('missing information', async () => {
    const res = await request(server)
    .post('/api/auth/login')
    .send({ username: 'test' })
    expect(res.status).toEqual(401)
  })
  test('incorrect password', async () => {
    const expected = {"message": "invalid credentials"};
    const res = await request(server)
    .post('/api/auth/login')
    .send({ username: 'test', password: '12345' })
    expect(res.status).toEqual(401)
    expect(res.body).toEqual(expected)
  })
})

describe('GET jokes', () => {
  let token = '';
  test('no token', async () => {
    const res = await request(server)
    .get('/api/jokes/')
    expect(res.status).toEqual(401)
  })
  describe('sucessful and wrong token', () => {
    it('registered', async () => {
      const res = await request(server)
      .post('/api/auth/register')
      .send({ username: 'test2', password: '1234' })
      expect(res.status).toEqual(201)
    })
    it('logged in', async () => {
      const res = await request(server)
      .post('/api/auth/login')
      .send({ username: 'test2', password: '1234' })
      token = res.body.token;
      expect(res.status).toEqual(200)
    })
    test('successful get', async () => {
    //   const expected =     {
    //     "id": "0189hNRf2g",
    //     "joke": "I'm tired of following my dreams. I'm just going to ask them where they are going and meet up with them later."
    // }
      const res = await request(server)
      .get('/api/jokes/').set('Authorization', 'Bearer ' + token)
      expect(res.status).toEqual(200)
    })
  })
})
