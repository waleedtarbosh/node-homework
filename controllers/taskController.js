const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");
const pool = require("../db/pg-pool");

const create = async (req, res, next = () => {}) => {
  if (!req.body) req.body = {};
  
  const { error, value } = taskSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  try {
    const taskResult = await pool.query(
      `INSERT INTO tasks (title, is_completed, user_id) 
       VALUES ($1, $2, $3) RETURNING id, title, is_completed`,
      [value.title, value.isCompleted ?? false, global.user_id]
    );

    const newTask = taskResult.rows[0];
    return res.status(201).json({
      id: newTask.id,
      title: newTask.title,
      isCompleted: newTask.is_completed,
      is_completed: newTask.is_completed
    });
  } catch (err) {
    return next(err);
  }
};

const index = async (req, res, next = () => {}) => {
  try {
    const result = await pool.query(
      "SELECT id, title, is_completed FROM tasks WHERE user_id = $1",
      [global.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No tasks found for this user." });
    }

    const formattedRows = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      isCompleted: row.is_completed,
      is_completed: row.is_completed
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
    const result = await pool.query(
      "SELECT id, title, is_completed FROM tasks WHERE id = $1 AND user_id = $2",
      [taskId, global.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found." });
    }

    const row = result.rows[0];
    return res.status(200).json({
      id: row.id,
      title: row.title,
      isCompleted: row.is_completed,
      is_completed: row.is_completed
    });
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next = () => {}) => {
  if (!req.body) req.body = {};

  const { error, value: taskChange } = patchTaskSchema.validate(req.body, { abortEarly: false, allowUnknown: true });
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const taskId = parseInt(req.params?.id);
  if (!taskId || isNaN(taskId)) {
    return res.status(400).json({ message: "The task ID passed is not valid." });
  }

  const updates = [];
  const values = [];
  let paramIndex = 1;

  if (taskChange.title !== undefined) {
    updates.push(`title = $${paramIndex++}`);
    values.push(taskChange.title);
  }

  if (taskChange.isCompleted !== undefined) {
    updates.push(`is_completed = $${paramIndex++}`);
    values.push(taskChange.isCompleted);
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: "No fields to update provided." });
  }

  values.push(taskId);
  values.push(global.user_id);

  try {
    const queryText = `UPDATE tasks SET ${updates.join(", ")} 
                       WHERE id = $${paramIndex++} AND user_id = $${paramIndex++} 
                       RETURNING id, title, is_completed`;

    const result = await pool.query(queryText, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found." });
    }

    const row = result.rows[0];
    return res.status(200).json({
      id: row.id,
      title: row.title,
      isCompleted: row.is_completed,
      is_completed: row.is_completed
    });
  } catch (err) {
    return next(err);
  }
};

const deleteTask = async (req, res, next = () => {}) => {
  const taskId = parseInt(req.params?.id);
  if (!taskId || isNaN(taskId)) {
    return res.status(400).json({ message: "The task ID passed is not valid." });
  }

  try {
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id, title, is_completed",
      [taskId, global.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found." });
    }

    const row = result.rows[0];
    return res.status(200).json({
      id: row.id,
      title: row.title,
      isCompleted: row.is_completed,
      is_completed: row.is_completed
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
};