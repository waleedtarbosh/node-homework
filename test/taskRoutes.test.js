require("dotenv").config();
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

const request = require("supertest");
const prisma = require("../db/prisma");
const { app, server } = require("../app");

let agent;
let csrfToken;
let createdTaskId;

jest.setTimeout(30000);

beforeAll(async () => {
  await prisma.Task.deleteMany();
  await prisma.User.deleteMany();
  agent = request.agent(app);
}, 30000);

afterAll(async () => {
  await prisma.$disconnect();
  server.close();
});

describe("Task CRUD operations via Supertest", () => {
  // ─── Setup: Register and Login ───
  it("33. Register a new user for task testing", async () => {
    const res = await agent
      .post("/api/users/register")
      .set("X-Recaptcha-Test", process.env.RECAPTCHA_BYPASS)
      .send({
        name: "Task Tester",
        email: "tasktester@example.com",
        password: "Pa$$word20",
      });
    expect(res.status).toBe(201);
    csrfToken = res.body.csrfToken;
    expect(csrfToken).toBeDefined();
  });

  // ─── CREATE ───
  it("34. Create a new task via POST /api/tasks", async () => {
    const res = await agent
      .post("/api/tasks")
      .set("X-CSRF-TOKEN", csrfToken)
      .send({ title: "Integration test task", priority: "high" });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Integration test task");
    expect(res.body.priority).toBe("high");
    expect(res.body.isCompleted).toBe(false);
    createdTaskId = res.body.id;
  });

  it("35. Create fails with invalid data (title too short)", async () => {
    const res = await agent
      .post("/api/tasks")
      .set("X-CSRF-TOKEN", csrfToken)
      .send({ title: "AB" });
    expect(res.status).toBe(400);
  });

  // ─── READ MANY ───
  it("36. Get all tasks via GET /api/tasks returns the created task", async () => {
    const res = await agent.get("/api/tasks");
    expect(res.status).toBe(200);
    expect(res.body.tasks).toBeDefined();
    expect(res.body.tasks.length).toBeGreaterThanOrEqual(1);
    expect(res.body.pagination).toBeDefined();
  });

  // ─── READ ONE ───
  it("37. Get one task via GET /api/tasks/:id", async () => {
    const res = await agent.get(`/api/tasks/${createdTaskId}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Integration test task");
    expect(res.body.id).toBe(createdTaskId);
  });

  it("38. Get a non-existent task returns 404", async () => {
    const res = await agent.get("/api/tasks/999999");
    expect(res.status).toBe(404);
  });

  // ─── UPDATE ───
  it("39. Update task via PATCH /api/tasks/:id", async () => {
    const res = await agent
      .patch(`/api/tasks/${createdTaskId}`)
      .set("X-CSRF-TOKEN", csrfToken)
      .send({ isCompleted: true });
    expect(res.status).toBe(200);
    expect(res.body.isCompleted).toBe(true);
  });

  it("40. Update a non-existent task returns 404", async () => {
    const res = await agent
      .patch("/api/tasks/999999")
      .set("X-CSRF-TOKEN", csrfToken)
      .send({ isCompleted: true });
    expect(res.status).toBe(404);
  });

  // ─── DELETE ───
  it("41. Delete task via DELETE /api/tasks/:id", async () => {
    const res = await agent
      .delete(`/api/tasks/${createdTaskId}`)
      .set("X-CSRF-TOKEN", csrfToken);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdTaskId);
  });

  it("42. Deleted task is no longer found", async () => {
    const res = await agent.get(`/api/tasks/${createdTaskId}`);
    expect(res.status).toBe(404);
  });

  // ─── PROTECTED ROUTES ───
  it("43. Logoff the user", async () => {
    const res = await agent
      .post("/api/users/logoff")
      .set("X-CSRF-TOKEN", csrfToken);
    expect(res.status).toBe(200);
  });

  it("44. After logoff, GET /api/tasks returns 401", async () => {
    const res = await agent.get("/api/tasks");
    expect(res.status).toBe(401);
  });

  it("45. After logoff, POST /api/tasks returns 401", async () => {
    const res = await agent
      .post("/api/tasks")
      .set("X-CSRF-TOKEN", csrfToken)
      .send({ title: "Should fail" });
    expect(res.status).toBe(401);
  });
});
