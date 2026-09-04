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
        priority: value.priority || "medium",
        userId: req.user.id,
      },
      select: { id: true, title: true, isCompleted: true, priority: true, createdAt: true },
    });

    return res.status(201).json(newTask);
  } catch (err) {
    return next(err);
  }
};

const index = async (req, res, next = () => {}) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const whereClause = { userId: req.user.id };
    if (req.query.find) {
      whereClause.title = {
        contains: req.query.find,
        mode: 'insensitive'
      };
    }

    const validSortFields = ["title", "priority", "createdAt", "id", "isCompleted"];
    const sortBy = req.query.sortBy && validSortFields.includes(req.query.sortBy) ? req.query.sortBy : "createdAt";
    const sortDirection = req.query.sortDirection === "asc" ? "asc" : "desc";

    const tasks = await prisma.task.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        isCompleted: true,
        priority: true,
        createdAt: true,
        User: {
          select: {
            name: true,
            email: true
          }
        }
      },
      skip: skip,
      take: limit,
      orderBy: { [sortBy]: sortDirection }
    });

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ message: "No tasks found" });
    }

    const totalTasks = await prisma.task.count({
      where: whereClause
    });

    const pagination = {
      page,
      limit,
      total: totalTasks,
      pages: Math.ceil(totalTasks / limit),
      hasNext: page * limit < totalTasks,
      hasPrev: page > 1
    };

    return res.status(200).json({ tasks, pagination });
  } catch (err) {
    return next(err);
  }
};

const show = async (req, res, next = () => {}) => {
  const id = parseInt(req.params?.id);
  if (!id || isNaN(id)) {
    return res.status(400).json({ message: "The task ID passed is not valid." });
  }

  try {
    const task = await prisma.task.findUnique({
      where: {
        id_userId: {
          id: id,
          userId: req.user.id,
        },
      },
      select: { 
        id: true, 
        title: true, 
        isCompleted: true, 
        priority: true, 
        createdAt: true,
        User: {
          select: {
            name: true,
            email: true
          }
        }
      },
    });

    if (!task) {
      return res.status(404).json({ message: "The task was not found." });
    }

    return res.status(200).json(task);
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

  const id = parseInt(req.params?.id);
  if (!id || isNaN(id)) {
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
          id: id,
          userId: req.user.id,
        },
      },
      data: taskChange,
      select: { id: true, title: true, isCompleted: true, priority: true, createdAt: true },
    });

    return res.status(200).json(updatedTask);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "The task was not found." });
    }
    return next(err);
  }
};

const deleteTask = async (req, res, next = () => {}) => {
  const id = parseInt(req.params?.id);
  if (!id || isNaN(id)) {
    return res.status(400).json({ message: "The task ID passed is not valid." });
  }

  try {
    const deletedTask = await prisma.task.delete({
      where: {
        id_userId: {
          id: id,
          userId: req.user.id,
        },
      },
      select: { id: true, title: true, isCompleted: true, priority: true, createdAt: true },
    });

    return res.status(200).json(deletedTask);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "The task was not found." });
    }
    return next(err);
  }
};

const bulkCreate = async (req, res, next = () => {}) => {
  const { tasks } = req.body;

  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({ 
      error: "Invalid request data. Expected an array of tasks." 
    });
  }

  const validTasks = [];
  for (const task of tasks) {
    const { error, value } = taskSchema.validate(task);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details,
      });
    }
    validTasks.push({
      title: value.title,
      isCompleted: value.isCompleted || false,
      priority: value.priority || 'medium',
      userId: req.user.id
    });
  }

  try {
    const result = await prisma.task.createMany({
      data: validTasks,
      skipDuplicates: false
    });

    res.status(201).json({
      message: "success!",
      tasksCreated: result.count,
      totalRequested: validTasks.length
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  create,
  index,
  show,
  update,
  deleteTask,
  bulkCreate,
};