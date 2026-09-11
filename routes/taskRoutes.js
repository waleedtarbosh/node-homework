const express = require("express");
const router = express.Router();
const {
  create,
  index,
  show,
  update,
  deleteTask,
  bulkCreate,
  getTrash,
  restoreTask,
  emptyTrash,
} = require("../controllers/taskController");

router.post("/bulk", bulkCreate); 

router.get("/trash", getTrash);
router.delete("/trash", emptyTrash);
router.patch("/:id/restore", restoreTask);

router.post("/", create);
router.get("/", index);
router.get("/:id", show);
router.patch("/:id", update);
router.delete("/:id", deleteTask);

module.exports = router;