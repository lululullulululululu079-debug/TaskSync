import { useEffect, useMemo, useState } from "react";
import Auth from "./Auth";
import API from "./api/api";
const KEY = "tasksync-projects";

function getSavedProjects() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(data)) return [];
    return data.map((p, i) => ({
      id: p.id ?? Date.now() + i,
      name: String(p.name || "Untitled project"),
      description: String(p.description || ""),
      tasks: Array.isArray(p.tasks) ? p.tasks.map((t, j) => ({
        id: t.id ?? Date.now() + j,
        name: String(t.name || "Untitled task"),
        completed: Boolean(t.completed)
      })) : []
    }));
  } catch {
    return [];
  }
}

const css = `
*{box-sizing:border-box}body{margin:0;background:#f5f6fb;color:#29283e;font-family:Arial, sans-serif}button,input{font:inherit}button{cursor:pointer}
.app{min-height:100vh;display:flex}.side{width:220px;flex-shrink:0;background:#fff;border-right:1px solid #e9e8f1;padding:26px 18px;display:flex;flex-direction:column}
.brand{font-size:22px;font-weight:800;margin:0 8px 40px}.logo{display:inline-grid;place-items:center;background:#7867e9;color:#fff;width:35px;height:35px;border-radius:10px;margin-right:9px}
.nav{display:grid;gap:8px}.nav a{padding:12px;color:#77768b;text-decoration:none;border-radius:9px;font-size:14px}.nav a:hover{background:#f0edff;color:#7867e9}.note{margin-top:auto;background:#f5f2ff;padding:14px;border-radius:10px;color:#77768b;font-size:12px}
.main{width:min(1180px,100%);margin:auto;padding:32px;min-width:0}.header,.section-head,.toolbar{display:flex;justify-content:space-between;align-items:center;gap:15px}.header{margin-bottom:25px}.kicker{font-size:10px;letter-spacing:1.2px;color:#9997aa;font-weight:bold;margin:0 0 7px}h1{font-size:30px;margin:0 0 7px}h2{font-size:21px;margin:0 0 6px}h3{font-size:16px;margin:0 0 7px}.muted{font-size:13px;color:#9291a5;margin:0;line-height:1.5}
.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px;margin-bottom:32px}.card,.panel,.project{background:white;border:1px solid #eae9f2;border-radius:14px;padding:19px;box-shadow:0 4px 18px #28235008}.stat-label{font-size:12px;color:#9291a5;margin:0 0 8px}.stat-value{font-size:27px;font-weight:bold}
.section{margin-bottom:32px;scroll-margin-top:18px}.section-head{margin-bottom:15px}.analytics{display:grid;grid-template-columns:1fr 1fr;gap:14px}.donut{width:145px;height:145px;border-radius:50%;display:grid;place-items:center;margin:20px auto}.donut-inner{width:108px;height:108px;border-radius:50%;background:white;display:grid;place-content:center;text-align:center}.donut-inner strong{font-size:25px}.donut-inner span{font-size:11px;color:#9291a5}.legend{display:flex;justify-content:center;gap:16px;font-size:11px;color:#77768b}.legend i{display:inline-block;width:8px;height:8px;border-radius:50%;background:#7867e9;margin-right:5px}.legend span+span i{background:#e9e7f2}
.metric{display:flex;justify-content:space-between;padding:14px 0;border-bottom:1px solid #f0eff5;font-size:13px;color:#77768b}.metric strong{color:#29283e}.track{height:8px;background:#eeedf5;border-radius:20px;overflow:hidden}.track span{display:block;height:100%;background:linear-gradient(90deg,#7867e9,#b2a5ff);border-radius:20px}.bars{display:grid;gap:16px;margin-top:20px}.bar-row{display:grid;grid-template-columns:minmax(90px,1fr) 2fr 40px;gap:10px;align-items:center;font-size:12px}.bar-row strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.bar-row b{text-align:right;color:#7867e9}
.form{display:grid;grid-template-columns:1fr 1.3fr auto;gap:10px;margin-top:14px}.field{width:100%;min-width:0;border:1px solid #e7e6ef;border-radius:9px;padding:12px;background:white;color:#29283e;font-size:13px;outline:none}.field:focus{border-color:#9d91f0;box-shadow:0 0 0 3px #7867e91a}.btn{border:0;border-radius:9px;padding:11px 15px;background:#7867e9;color:white;font-size:12px;font-weight:bold}.btn:hover{background:#6655d7}.toolbar{margin-bottom:14px}.search{max-width:240px}.filters{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:15px}.filter{border:1px solid #e7e6ef;background:white;color:#77768b;border-radius:8px;padding:8px 12px;font-size:11px}.filter.active{background:#f0edff;color:#7867e9;border-color:#7867e9}
.project-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.project-top{display:flex;justify-content:space-between;gap:10px}.project h3{overflow-wrap:anywhere}.desc{font-size:11px;color:#9291a5;margin:0}.delete{border:0;background:transparent;color:#aaa8b8;font-size:20px;border-radius:7px}.delete:hover{color:#d65f69;background:#fff0f0}.progress-label{display:flex;justify-content:space-between;margin:18px 0 8px;font-size:11px;color:#9291a5}.progress-label strong{color:#7867e9}.task-list{margin:14px 0}.task label{display:flex;align-items:center;gap:8px;min-width:0;font-size:12px;color:#55536a}.task label span{overflow-wrap:anywhere}.task input{accent-color:#7867e9}.done{text-decoration:line-through;color:#aaa8b8}.task-form{display:flex;gap:8px}.task-form .field{flex:1}.add{width:42px;padding:0;font-size:20px}.counter{font-size:10px;color:#9997aa;margin:10px 0 0}.empty{border:1px dashed #dedce9;border-radius:12px;padding:30px;text-align:center;color:#9997aa;font-size:13px}.footer{text-align:center;color:#aaa8b8;font-size:10px;padding:12px}
@media(max-width:850px){.side{width:185px}.main{padding:24px 18px}.stats{grid-template-columns:repeat(2,minmax(0,1fr))}.form{grid-template-columns:1fr 1fr}.form button{grid-column:1/-1}}
@media(max-width:640px){.app{display:block}.side{width:100%;padding:14px}.brand{margin:0 0 10px}.nav{display:flex}.nav a{flex:1;text-align:center;padding:9px 4px}.note{display:none}.main{padding:22px 14px}.header,.section-head,.toolbar{align-items:stretch;flex-direction:column}.analytics,.project-grid{grid-template-columns:1fr}.form{grid-template-columns:1fr}.form button{grid-column:auto;min-height:42px}.search{max-width:none}.bar-row{grid-template-columns:80px 1fr 35px}}
`;

export default function App() {
  const [user, setUser] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
});

function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setUser(null);
}
  const [projects, setProjects] = useState(getSavedProjects);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [taskInputs, setTaskInputs] = useState({});
  const [taskPriorities, setTaskPriorities] = useState({});
  const [taskDueDates, setTaskDueDates] = useState({});
  const [taskAssignees, setTaskAssignees] = useState({});
  const [draggedTask, setDraggedTask] = useState(null);
  const [search, setSearch] = useState("");
  const [taskSearch, setTaskSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [filter, setFilter] = useState("all");

const [loadingProjects, setLoadingProjects] = useState(true);
const [users, setUsers] = useState([]);
useEffect(() => {
  if (!user) return;

  async function loadProjects() {
      async function loadUsers() {
    try {
      const response = await API.get("/auth/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Could not load users:", error);
    }
  }

  loadUsers();
    try {
      const [projectsResponse, tasksResponse] = await Promise.all([
        API.get("/projects"),
        API.get("/tasks"),
      ]);

      const loadedProjects = projectsResponse.data.map((project) => ({
        id: project.id,
        name: project.name,
        description: project.description || "",
        tasks: tasksResponse.data
         .filter((task) => String(task.project_id) === String(project.id))
          .map((task) => ({
            id: task.id,
            name: task.title,
            description: task.description || "",
            status: task.status,
             priority: task.priority || "Medium",
             due_date: task.due_date || null,
             assignee_id: task.assignee_id || null,
            completed: task.status === "Done",
          })),
      }));

      setProjects(loadedProjects);
    } catch (error) {
      console.error("Could not load projects:", error);
    } finally {
      setLoadingProjects(false);
    }
  }

  loadProjects();
}, [user]);

  const total = projects.reduce((n, p) => n + p.tasks.length, 0);
  const completed = projects.reduce((n, p) => n + p.tasks.filter(t => t.completed).length, 0);
  const active = total - completed;
  const percent = total ? Math.round(completed / total * 100) : 0;
  const shownProjects = useMemo(
    () => projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase())),
    [projects, search]
  );
if (!user) {
  return <Auth onLogin={setUser} />;
}

if (loadingProjects) {
  return <p style={{ padding: 30 }}>Loading projects...</p>;
}
 async function addProject(event) {
  event.preventDefault();

  const name = projectName.trim();
  if (!name) return;

  try {
    const response = await API.post("/projects", {
      name,
      description: description.trim(),
    });

    const newProject = response.data.project;

    setProjects((old) => [
      ...old,
      {
        id: newProject.id,
        name: newProject.name,
        description: newProject.description || "",
        tasks: [],
      },
    ]);

    setProjectName("");
    setDescription("");
  } catch (error) {
    console.error("Could not create project:", error);
    alert(error.response?.data?.message || "Could not create project.");
  }
}
  async function addTask(event, projectId) {
  event.preventDefault();

  const name = (taskInputs[projectId] || "").trim();
  if (!name) return;

  try {
    const response = await API.post("/tasks", {
      title: name,
      description: "",
      status: "To Do",
      priority: taskPriorities[projectId] || "Medium",
      due_date: taskDueDates[projectId] || null,
      project_id: projectId,
      assignee_id: taskAssignees[projectId]
  ? Number(taskAssignees[projectId])
  : null,
    });

    const newTask = response.data.task;

    setProjects((old) =>
      old.map((project) =>
        project.id === projectId
          ? {
              ...project,
              tasks: [
                ...project.tasks,
                {
                  id: newTask.id,
                  name: newTask.title,
                  description: newTask.description || "",
                  status: newTask.status,
                  priority: newTask.priority || "Medium",
                  due_date: newTask.due_date || null,
                  assignee_id: newTask.assignee_id || null,
                  completed: newTask.status === "Done",
                },
              ],
            }
          : project
      )
    );

    setTaskInputs((old) => ({ ...old, [projectId]: "" }));
  } catch (error) {
    console.error("Could not create task:", error);
    alert(error.response?.data?.message || "Could not create task.");
  }
}

async function updateTaskStatus(projectId, taskId, newStatus) {
console.log("UPDATING TASK:", projectId, taskId, newStatus);

  setProjects((old) =>
    old.map((project) =>
      String(project.id) === String(projectId)
        ? {
            ...project,
            tasks: project.tasks.map((task) =>
              String(task.id) === String(taskId)
                ? {
                    ...task,
                    status: newStatus,
                    completed: newStatus === "Done",
                  }
                : task
            ),
          }
        : project
    )
  );


  try {
    await API.put(`/tasks/${taskId}`, {
      status: newStatus,
    });
  } catch (error) {
    console.error("Could not update task status:", error);
    alert(error.response?.data?.message || "Could not update task status.");
  }
}

async function toggleTask(projectId, taskId) {
  const project = projects.find((p) => p.id === projectId);
  const task = project?.tasks.find((t) => t.id === taskId);

  if (!task) return;

  const newStatus = task.completed ? "To Do" : "Done";

  await updateTaskStatus(projectId, taskId, newStatus);
}

function editTask(projectId, taskId) {
  const project = projects.find(
    (p) => String(p.id) === String(projectId)
  );

  const task = project?.tasks.find(
    (t) => String(t.id) === String(taskId)
  );

  if (!task) return;

  const newName = prompt("Enter a new task name:", task.name);
const newDescription = prompt("Enter a task description:", task.description || "");
  if (newName === null || newName.trim() === "") return;

  API.put(`/tasks/${taskId}`, {
    title: newName.trim(),
      description: newDescription.trim(),
  })
    .then(() => {
     setProjects((old) =>
  old.map((p) =>
    String(p.id) === String(projectId)
      ? {
          ...p,
          tasks: p.tasks.map((t) =>
            String(t.id) === String(taskId)
              ? {
                  ...t,
                  name: newName.trim(),
                  description: newDescription.trim(),
                }
              : t
          ),
        }
      : p
  )
);
    })
    .catch((error) => {
      console.error("Could not edit task:", error);
      alert("Could not edit task.");
    });
}

async function deleteTask(projectId, taskId) {
  try {
    await API.delete(`/tasks/${taskId}`);

    setProjects((old) =>
      old.map((p) =>
        String(p.id) === String(projectId)
          ? {
              ...p,
              tasks: p.tasks.filter(
                (t) => String(t.id) !== String(taskId)
              ),
            }
          : p
      )
    );
  } catch (error) {
    console.error("Could not delete task:", error);
    alert(error.response?.data?.message || "Could not delete task.");
  }
}

async function deleteProject(projectId) {
  try {
    await API.delete(`/projects/${projectId}`);

    setProjects((old) =>
      old.filter(
        (project) => String(project.id) !== String(projectId)
      )
    );
  } catch (error) {
    console.error("Could not delete project:", error);
    alert(error.response?.data?.message || "Could not delete project.");
  }
}

return (
  <div className="tanksync-root">
    <style>{css}</style>

      <div className="app">
        <aside className="side">
          <div className="brand"><span className="logo">✓</span>TankSync</div>
          <nav className="nav">
            <a href="#dashboard">▦ Dashboard</a>
            <a href="#analytics">◔ Analytics</a>
            <a href="#projects">▣ Projects</a>
          </nav>
          <div className="note"><strong>Stay organized.</strong><br />Make progress every day.</div>
        </aside>

        <main className="main" id="dashboard">
          <header className="header">
            <div><p className="kicker">YOUR WORKSPACE</p><h1>Dashboard</h1><p className="muted">Manage your projects and tasks in one place.</p></div>
            <span className="muted">
  ● {user.name}
  <button
    type="button"
    className="filter"
    onClick={handleLogout}
    style={{ marginLeft: 10 }}
  >
    Log Out
  </button>
</span>
          </header>

          <section className="stats">
            <article className="card"><p className="stat-label">Total Projects</p><div className="stat-value">{projects.length}</div></article>
            <article className="card"><p className="stat-label">Total Tasks</p><div className="stat-value">{total}</div></article>
            <article className="card"><p className="stat-label">Completed Tasks</p><div className="stat-value">{completed}</div></article>
            <article className="card"><p className="stat-label">Overall Progress</p><div className="stat-value">{percent}%</div></article>
          </section>

          <section className="section" id="analytics">
            <div className="section-head"><div><p className="kicker">YOUR PERFORMANCE</p><h2>Analytics</h2><p className="muted">A live overview of your tasks and projects.</p></div></div>
            <div className="analytics">
              <article className="panel">
                <h3>Task Overview</h3><p className="muted">Completed compared with active tasks</p>
                <div className="donut" style={{ background: `conic-gradient(#7867e9 ${percent}%, #e9e7f2 ${percent}% 100%)` }}>
                  <div className="donut-inner"><strong>{percent}%</strong><span>Completed</span></div>
                </div>
                <div className="legend"><span><i />Completed: {completed}</span><span><i />Active: {active}</span></div>
              </article>
              <article className="panel">
                <h3>Task Statistics</h3>
                <div className="metric"><span>Total tasks</span><strong>{total}</strong></div>
                <div className="metric"><span>Completed</span><strong>{completed}</strong></div>
                <div className="metric"><span>Active</span><strong>{active}</strong></div>
                <div className="track" style={{ marginTop: 22 }}><span style={{ width: `${percent}%` }} /></div>
                <p className="muted" style={{ marginTop: 10 }}>{total === 0 ? "Add tasks to start tracking progress." : `${active} tasks left to complete.`}</p>
              </article>
            </div>
          <article className="panel" style={{ marginTop: 14 }}>
  <h3>Project Progress</h3>

  {projects.length === 0 ? (
    <p className="muted">
      Create a project to see its progress.
    </p>
  ) : (
    <div className="bars">
      {projects.map((p) => {
        const done = p.tasks.filter((t) => t.completed).length;
        const pct = p.tasks.length
          ? Math.round((done / p.tasks.length) * 100)
          : 0;

        return (
          <div className="bar-row" key={p.id}>
            <strong title={p.name}>{p.name}</strong>
            <div className="track">
              <span style={{ width: `${pct}%` }} />
            </div>
            <b>{pct}%</b>
          </div>
        );
      })}
    </div>
  )}
</article>
          </section>

          <section className="section">
            <div className="section-head"><div><p className="kicker">GET STARTED</p><h2>Create a Project</h2><p className="muted">Add a project and start listing its tasks.</p></div></div>
            <form className="form" onSubmit={addProject}>
              <input className="field" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Project name..." required />
              <input className="field" value={description} onChange={e => setDescription(e.target.value)} placeholder="Project description (optional)" />
              <button className="btn" type="submit">+ Create Project</button>
            </form>
          </section>

          <section className="section" id="projects">
           <div className="toolbar">
  <div>
    <p className="kicker">YOUR WORK</p>
    <h2>My Projects</h2>
    <p className="muted">Your projects and their tasks.</p>
  </div>

  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
    <input
      className="field search"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search projects..."
    />

    <input
      className="field search"
      value={taskSearch}
      onChange={(e) => setTaskSearch(e.target.value)}
      placeholder="Search tasks..."
    />
  </div>
</div>
              
            <div className="filters">
              {["all", "active", "completed"].map(value => <button key={value} type="button" className={`filter ${filter === value ? "active" : ""}`} onClick={() => setFilter(value)}>{value === "all" ? "All Tasks" : value === "active" ? "Active" : "Completed"}</button>)}
              <button
  className={priorityFilter === "all" ? "filter active" : "filter"}
  onClick={() => setPriorityFilter("all")}
>
  All priorities
</button>

<button
  className={priorityFilter === "High" ? "filter active" : "filter"}
  onClick={() => setPriorityFilter("High")}
>
  High
</button>

<button
  className={priorityFilter === "Medium" ? "filter active" : "filter"}
  onClick={() => setPriorityFilter("Medium")}
>
  Medium
</button>

<button
  className={priorityFilter === "Low" ? "filter active" : "filter"}
  onClick={() => setPriorityFilter("Low")}
>
  Low
</button>
            </div>
            {shownProjects.length === 0 ? <div className="empty">{projects.length === 0 ? "No projects yet. Create your first project above." : "No projects match your search."}</div> : (
              <div className="project-grid">
                {shownProjects.map(project => {
                  const done = project.tasks.filter(t => t.completed).length;
                  const count = project.tasks.length;
                  const pct = count ? Math.round(done / count * 100) : 0;
                  
const visible = project.tasks.filter((task) => {
  const matchesStatus =
    filter === "all" ||
    (filter === "active" ? !task.completed : task.completed);

  const matchesSearch = (task.name || "")
    .toLowerCase()
    .includes(taskSearch.trim().toLowerCase());

  const matchesPriority =
    priorityFilter === "all" ||
    (task.priority || "Medium") === priorityFilter;

  return matchesStatus && matchesSearch && matchesPriority;
});

                  return (
                    <article className="project" key={project.id}>
                      <div className="project-top"><div><h3>{project.name}</h3><p className="desc">{project.description || "No description added"}</p></div><button className="delete" type="button" onClick={() => deleteProject(project.id)} aria-label="Delete project">×</button></div>
                      <div className="progress-label"><span>Progress</span><strong>{pct}%</strong></div>
                      <div className="track"><span style={{ width: `${pct}%` }} /></div>
                     <div className="task-list">
  {["To Do", "In Progress", "Done"].map((status) => {
    const statusTasks = visible.filter(
      (task) =>
        (task.status || (task.completed ? "Done" : "To Do")) === status
    );

    return (
      <div
  className="kanban-column"
  key={status}
onDragOver={(event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  event.currentTarget.classList.add("drag-over");
}}
onDragLeave={(event) => {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    event.currentTarget.classList.remove("drag-over");
  }
}}
  onDrop={(event) => {
  event.preventDefault();

  console.log("DROP EVENT WORKS!");

  const taskId = event.dataTransfer.getData("text/plain");

  console.log("TASK ID:", taskId);
  console.log("DRAGGED TASK:", draggedTask);
  console.log("TARGET STATUS:", status);

  if (!taskId || !draggedTask) return;

  updateTaskStatus(
    draggedTask.projectId,
    taskId,
    status
  );

  setDraggedTask(null);
}}
>
        <h4>{status} ({statusTasks.length})</h4>

        {statusTasks.map((task) => (
          <div
 className={`task ${String(draggedTask?.taskId) === String(task.id) ? "dragging" : ""}`}
  key={task.id}
  draggable={true}
onDragStart={(event) => {
  event.dataTransfer.setData("text/plain", String(task.id));
  event.dataTransfer.effectAllowed = "move";

  const dragPreview = event.currentTarget.cloneNode(true);

  dragPreview.style.background = "linear-gradient(135deg, #a855f7, #6d28d9)";
  dragPreview.style.color = "#ffffff";
  dragPreview.style.opacity = "1";
  dragPreview.style.border = "2px solid #e9d5ff";
  dragPreview.style.borderRadius = "16px";
  dragPreview.style.width = event.currentTarget.offsetWidth + "px";
  dragPreview.style.position = "fixed";
  dragPreview.style.top = "-1000px";
  dragPreview.style.boxShadow = "0 0 20px #c084fc, 0 0 40px #9333ea";
  dragPreview.style.filter = "brightness(1.2)";

  document.body.appendChild(dragPreview);

  event.dataTransfer.setDragImage(
    dragPreview,
    event.currentTarget.offsetWidth / 2,
    30
  );

  setTimeout(() => dragPreview.remove(), 0);

  setDraggedTask({
    taskId: task.id,
    projectId: project.id,
  });
}}
onDragEnd={() => setDraggedTask(null)}
>
            <div>
  <span className={task.completed ? "done" : ""}>
    {task.name}
  </span>
<p className="task-assignee">
  Assigned to:{" "}
  {users.find(
    (person) => String(person.id) === String(task.assignee_id)
  )?.name || "Unassigned"}
</p>
  <span className={`priority priority-${(task.priority || "Medium").toLowerCase()}`}>
    {task.priority || "Medium"}
  </span>

  {task.due_date && (
  <p className={
    task.due_date < new Date().toISOString().slice(0, 10) &&
    task.status !== "Done"
      ? "task-due overdue"
      : "task-due"
  }>
    Due: {task.due_date}
  </p>
)}
</div>

            <select
              value={task.status || (task.completed ? "Done" : "To Do")}
              onChange={(event) =>
                updateTaskStatus(project.id, task.id, event.target.value)
              }
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>

           <button
  type="button"
  onClick={() => editTask(project.id, task.id)}
  aria-label="Edit task"
>
  ✏️
</button>

<button
  className="delete"
  type="button"
  onClick={() => deleteTask(project.id, task.id)}
  aria-label="Delete task"
>
  ×
</button>
          </div>
        ))}
      </div>
    );
  })}
</div>
<form className="task-form" onSubmit={(event) => addTask(event, project.id)}>
  <input
    className="field"
    value={taskInputs[project.id] || ""}
    onChange={(event) =>
      setTaskInputs((old) => ({
        ...old,
        [project.id]: event.target.value,
      }))
    }
    placeholder="Add a new task..."
    required
  />
<select
  className="field"
  value={taskPriorities[project.id] || "Medium"}
  onChange={(event) =>
    setTaskPriorities((old) => ({
      ...old,
      [project.id]: event.target.value,
    }))
  }
>
  <option value="Low">Low</option>
  <option value="Medium">Medium</option>
  <option value="High">High</option>
</select>

<input
  className="field"
  type="date"
  value={taskDueDates[project.id] || ""}
  onChange={(event) =>
    setTaskDueDates((old) => ({
      ...old,
      [project.id]: event.target.value,
    }))
  }
/>
<select
  className="field"
  value={taskAssignees[project.id] || ""}
  onChange={(event) =>
    setTaskAssignees((old) => ({
      ...old,
      [project.id]: event.target.value,
    }))
  }
>
  <option value="">Unassigned</option>
  {users.map((person) => (
    <option key={person.id} value={person.id}>
      {person.name}
    </option>
  ))}
</select>
  <button className="btn add" type="submit">+</button>
</form>

<p className="counter">
  {done} of {count} tasks completed
</p>
</article>
);
})}
</div>
)}
</section>
</main>
</div>
</div>
);
}
