const express = require("express");
const db = require("../database");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all projects belonging to the logged-in user
router.get("/", authMiddleware, (req, res) => {
  try {
    const projects = db
      .prepare(
        "SELECT * FROM Projects WHERE user_id = ? ORDER BY created_at DESC"
      )
      .all(req.user.id);

    res.json(projects);
  } catch (error) {
    console.error("Get projects error:", error);

    res.status(500).json({
      message: "Server error while retrieving projects",
    });
  }
});

// Create a new project
router.post("/", authMiddleware, (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    const result = db
      .prepare(
        "INSERT INTO Projects (name, description, user_id) VALUES (?, ?, ?)"
      )
      .run(name.trim(), description || "", req.user.id);

    const project = db
      .prepare("SELECT * FROM Projects WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Create project error:", error);

    res.status(500).json({
      message: "Server error while creating project",
    });
  }
});

// Update a project
router.put("/:id", authMiddleware, (req, res) => {
  try {
    const { name, description } = req.body;
    const projectId = Number(req.params.id);

    if (!Number.isInteger(projectId) || projectId <= 0) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    const result = db
      .prepare(
        `UPDATE Projects
         SET name = ?, description = ?
         WHERE id = ? AND user_id = ?`
      )
      .run(name.trim(), description || "", projectId, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const project = db
      .prepare("SELECT * FROM Projects WHERE id = ?")
      .get(projectId);

    res.json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("Update project error:", error);

    res.status(500).json({
      message: "Server error while updating project",
    });
  }
});

// Delete a project
router.delete("/:id", authMiddleware, (req, res) => {
  try {
    const projectId = Number(req.params.id);

    if (!Number.isInteger(projectId) || projectId <= 0) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const result = db
      .prepare(
        "DELETE FROM Projects WHERE id = ? AND user_id = ?"
      )
      .run(projectId, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);

    res.status(500).json({
      message: "Server error while deleting project",
    });
  }
});

module.exports = router;