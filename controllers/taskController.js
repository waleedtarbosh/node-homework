const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");

const taskCounter = (() => {
  let lastTaskNumber = 0;
  return () => {
    lastTaskNumber += 1;
    return lastTaskNumber;
  };
})();

const create = (req, res) => {
  if (!req.body) req.body = {};
  
  const { error, value } = taskSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const newTask = {
    id: taskCounter(),
    userId: global.user_id.email,
    ...value,
  };
  
  global.tasks.push(newTask);
// eslint-disable-next-line no-unused-vars
  const { userId, ...sanitizedTask } = newTask;
  return res.status(201).json(sanitizedTask);
};

const index = (req, res) => {
  const userTasks = global.tasks.filter((task) => task.userId === global.user_id.email);
  
  if (userTasks.length === 0) {
    return res.status(404).json({ message: "No tasks found for this user." });
  }

  const sanitizedTasks = userTasks.map((task) => {
    // eslint-disable-next-line no-unused-vars
    const { userId, ...rest } = task;
    return rest;
  });

  return res.status(200).json(sanitizedTasks);
};

const show = (req, res) => {
  const taskId = parseInt(req.params?.id);
  if (!taskId) {
    return res.status(400).json({ message: "The task ID passed is not valid." });
  }

  const task = global.tasks.find(
    (t) => t.id === taskId && t.userId === global.user_id.email
  );

  if (!task) {
    return res.status(404).json({ message: "Task not found." });
  }
// eslint-disable-next-line no-unused-vars
  const { userId, ...sanitizedTask } = task;
  return res.status(200).json(sanitizedTask);
};

const update = (req, res) => {
  if (!req.body) req.body = {};

  const { error, value } = patchTaskSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const taskId = parseInt(req.params?.id);
  if (!taskId) {
    return res.status(400).json({ message: "The task ID passed is not valid." });
  }

  const task = global.tasks.find(
    (t) => t.id === taskId && t.userId === global.user_id.email
  );

  if (!task) {
    return res.status(404).json({ message: "Task not found." });
  }

  Object.assign(task, value);
// eslint-disable-next-line no-unused-vars
  const { userId, ...sanitizedTask } = task;
  return res.status(200).json(sanitizedTask);
};

const deleteTask = (req, res) => {
  const taskId = parseInt(req.params?.id);
  if (!taskId) {
    return res.status(400).json({ message: "The task ID passed is not valid." });
  }

  const taskIndex = global.tasks.findIndex(
    (t) => t.id === taskId && t.userId === global.user_id.email
  );

  if (taskIndex === -1) {
    return res.status(404).json({ message: "Task not found." });
  }

  const deletedTask = global.tasks.splice(taskIndex, 1)[0];
// eslint-disable-next-line no-unused-vars
  const { userId, ...sanitizedTask } = deletedTask;
  return res.status(200).json(sanitizedTask);
};

module.exports = {
  create,
  index,
  show,
  update,
  deleteTask,
};