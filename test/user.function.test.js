require("dotenv").config();
const request = require("supertest");
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
const prisma = require("../db/prisma");
const { app, server } = require("../app");

let agent;
let saveRes;

beforeAll(async () => {
  await prisma.Task.deleteMany(); // delete all tasks
  await prisma.User.deleteMany(); // delete all users
  agent = request.agent(app);
});

afterAll(async () => {
  await prisma.$disconnect();
  server.close();
});

describe("register and authenticate a user", () => {
  it("46. it creates the user entry", async () => {
    const newUser = {
      name: "John Deere",
      email: "jdeere@example.com",
      password: "Pa$$word20",
    };
    saveRes = await agent.post("/api/users/register").send(newUser);
    expect(saveRes.status).toBe(201);
  });

it("47. Registration returns an object with the expected name", () => {
    const userName = saveRes.body.name || saveRes.body.user?.name;
    expect(userName).toBe("John Deere");
  });

  it("48. Test that the returned object includes a csrfToken", () => {
    expect(saveRes.body.csrfToken).toBeDefined();
  });

  it("49. You can logon as the newly registered user", async () => {
    saveRes = await agent.post("/api/users/logon").send({
      email: "jdeere@example.com",
      password: "Pa$$word20",
    });
    expect(saveRes.status).toBe(200);
  });

  it("50. Verify that you are logged in: /api/tasks should not return a 401", async () => {
    const res = await agent.get("/api/tasks");
    expect(res.status).not.toBe(401);
  });

it("51. Verify that you can log out", async () => {
    const setCookieArray = saveRes.headers['set-cookie'];
    const jwtCookieStr = setCookieArray.find((str) => str.startsWith("jwt="));
    const tokenPart = jwtCookieStr.split(';')[0].split('=')[1];
    const decoded = require('jsonwebtoken').decode(tokenPart);
    
    const res = await agent.post("/api/users/logoff").set("X-CSRF-TOKEN", decoded.csrfToken);
    expect(res.status).toBe(200);
  });

  it("52. Make sure that you are really logged out: /api/tasks should now return a 401", async () => {
    const res = await agent.get("/api/tasks");
    expect(res.status).toBe(401);
  });
});