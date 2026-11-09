const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./database");

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const projectRoutes = require("./routes/projects");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "TaskSync API is running!",
  });
});

app.listen(PORT, () => {
  console.log(`TaskSync server is running on http://localhost:${PORT}`);
});
