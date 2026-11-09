
const express = require("express");
const db = require("../database");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const validStatuses = ["To Do", "In Progress", "Done"];
const validPriorities = ["High", "Medium", "Low"];

// Get all tasks belonging to the logged-in user
router.get("/", authMiddleware, (req, res) => {
  try {
    const tasks = db
      .prepare(`
        SELECT Tasks.*
        FROM Tasks
        JOIN Projects ON Tasks.project_id = Projects.id
        WHERE Projects.user_id = ?
        ORDER BY Tasks.created_at DESC
      `)
      .all(req.user.id);

    res.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      message: "Server error while retrieving tasks",
    });
  }
});

// Create a new task
router.post("/", authMiddleware, (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      due_date,
      project_id,
      assignee_id,
    } = req.body || {};

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    const projectId = Number(project_id);

    if (!Number.isInteger(projectId) || projectId <= 0) {
      return res.status(400).json({
        message: "A valid project ID is required",
      });
    }

    const project = db
      .prepare("SELECT id FROM Projects WHERE id = ? AND user_id = ?")
      .get(projectId, req.user.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const taskStatus = status || "To Do";
    const taskPriority = priority || "Medium";

    if (!validStatuses.includes(taskStatus)) {
      return res.status(400).json({
        message: "Invalid task status",
      });
    }

    if (!validPriorities.includes(taskPriority)) {
      return res.status(400).json({
        message: "Invalid task priority",
      });
    }

    const result = db
      .prepare(`
        INSERT INTO Tasks
        (title, description, status, priority, due_date, project_id, assignee_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        title.trim(),
        description || "",
        taskStatus,
        taskPriority,
        due_date || null,
        projectId,
        assignee_id || null
      );

    const task = db
      .prepare("SELECT * FROM Tasks WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({
      message: "Server error while creating task",
    });
  }
});

// Update a task
router.put("/:id", authMiddleware, (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      due_date,
      project_id,
      assignee_id,
    } = req.body || {};

    const taskId = Number(req.params.id);

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const existingTask = db
      .prepare(`
        SELECT Tasks.*
        FROM Tasks
        JOIN Projects ON Tasks.project_id = Projects.id
        WHERE Tasks.id = ? AND Projects.user_id = ?
      `)
      .get(taskId, req.user.id);

    if (!existingTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const updatedTitle = title === undefined
      ? existingTask.title
      : title.trim();

    if (!updatedTitle) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    const updatedStatus = status || existingTask.status;
    const updatedPriority = priority || existingTask.priority;

    if (!validStatuses.includes(updatedStatus)) {
      return res.status(400).json({
        message: "Invalid task status",
      });
    }

    if (!validPriorities.includes(updatedPriority)) {
      return res.status(400).json({
        message: "Invalid task priority",
      });
    }

    const updatedProjectId = project_id === undefined
      ? existingTask.project_id
      : Number(project_id);

    if (!Number.isInteger(updatedProjectId) || updatedProjectId <= 0) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const project = db
      .prepare("SELECT id FROM Projects WHERE id = ? AND user_id = ?")
      .get(updatedProjectId, req.user.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const updatedDescription = description === undefined
      ? existingTask.description
      : description;

    const updatedDueDate = due_date === undefined
      ? existingTask.due_date
      : due_date;

    const updatedAssigneeId = assignee_id === undefined
      ? existingTask.assignee_id
      : assignee_id;

    db.prepare(`
      UPDATE Tasks
      SET title = ?,
          description = ?,
          status = ?,
          priority = ?,
          due_date = ?,
          project_id = ?,
          assignee_id = ?
      WHERE id = ?
    `).run(
      updatedTitle,
      updatedDescription || "",
      updatedStatus,
      updatedPriority,
      updatedDueDate || null,
      updatedProjectId,
      updatedAssigneeId || null,
      taskId
    );

    const task = db
      .prepare("SELECT * FROM Tasks WHERE id = ?")
      .get(taskId);

    res.json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({
      message: "Server error while updating task",
    });
  }
});

// Delete a task
router.delete("/:id", authMiddleware, (req, res) => {
  try {
    const taskId = Number(req.params.id);

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const result = db
      .prepare(`
        DELETE FROM Tasks
        WHERE id = ?
        AND project_id IN (
          SELECT id FROM Projects WHERE user_id = ?
        )
      `)
      .run(taskId, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      message: "Server error while deleting task",
    });
  }
});

module.exports = router;
