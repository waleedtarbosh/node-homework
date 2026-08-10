const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");
const prisma = require("../db/prisma");

const create = async (req, res, next = () => {}) => {
  if (!req.body) req.body = {};
  
  const { error, value } = taskSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      details: error.details,
    });
  }

  try {
    const newTask = await prisma.task.create({
      data: {
        title: value.title,
        isCompleted: value.isCompleted ?? false,
        userId: global.user_id,
      },
      select: { id: true, title: true, isCompleted: true },
    });

    return res.status(201).json({
      id: newTask.id,
      title: newTask.title,
      isCompleted: newTask.isCompleted,
    });
  } catch (err) {
    return next(err);
  }
};

const index = async (req, res, next = () => {}) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: global.user_id },
      select: { id: true, title: true, isCompleted: true },
    });

    const formattedRows = tasks.map((row) => ({
      id: row.id,
      title: row.title,
      isCompleted: row.isCompleted,
    }));

    return res.status(200).json(formattedRows);
  } catch (err) {
    return next(err);
  }
};

const show = async (req, res, next = () => {}) => {
  const taskId = parseInt(req.params?.id);
  if (!taskId || isNaN(taskId)) {
    return res.status(400).json({ message: "The task ID passed is not valid." });
  }

  try {
    const task = await prisma.task.findUnique({
      where: {
        id_userId: {
          id: taskId,
          userId: global.user_id,
        },
      },
      select: { id: true, title: true, isCompleted: true },
    });

    if (!task) {
      const error = new Error("The task was not found.");
      error.code = "P2025";
      throw error;
    }

    return res.status(200).json({
      id: task.id,
      title: task.title,
      isCompleted: task.isCompleted,
    });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "The task was not found." });
    }
    return next(err);
  }
};

const update = async (req, res, next = () => {}) => {
  if (!req.body) req.body = {};

  const { error, value: taskChange } = patchTaskSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      details: error.details,
    });
  }

  const taskId = parseInt(req.params?.id);
  if (!taskId || isNaN(taskId)) {
    return res.status(400).json({ message: "The task ID passed is not valid." });
  }

  try {
    let keys = Object.keys(taskChange);
    if (keys.length === 0) {
      return res.status(400).json({ message: "No fields to update provided." });
    }

    const updatedTask = await prisma.task.update({
      where: {
        id_userId: {
          id: taskId,
          userId: global.user_id,
        },
      },
      data: taskChange,
      select: { id: true, title: true, isCompleted: true },
    });

    return res.status(200).json({
      id: updatedTask.id,
      title: updatedTask.title,
      isCompleted: updatedTask.isCompleted,
    });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "The task was not found." });
    }
    return next(err);
  }
};

const deleteTask = async (req, res, next = () => {}) => {
  const taskId = parseInt(req.params?.id);
  if (!taskId || isNaN(taskId)) {
    return res.status(400).json({ message: "The task ID passed is not valid." });
  }

  try {
    const deletedTask = await prisma.task.delete({
      where: {
        id_userId: {
          id: taskId,
          userId: global.user_id,
        },
      },
      select: { id: true, title: true, isCompleted: true },
    });

    return res.status(200).json({
      id: deletedTask.id,
      title: deletedTask.title,
      isCompleted: deletedTask.isCompleted,
    });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "The task was not found." });
    }
    return next(err);
  }
};

module.exports = {
  create,
  index,
  show,
  update,
  deleteTask,
};