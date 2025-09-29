let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentIndex = 0;
let running = false;

const taskList = document.getElementById("taskList");
const addTaskBtn = document.getElementById("addTaskBtn");
const createTaskBtn = document.getElementById("createTaskBtn");
const taskForm = document.getElementById("taskForm");
const startAllBtn = document.getElementById("startAllBtn");
const endEarlyBtn = document.getElementById("endEarlyBtn");

const timerPopup = document.createElement("div");
timerPopup.className = "timer-popup";
timerPopup.style.display = "none";
document.body.appendChild(timerPopup);

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true
  };
  return date.toLocaleString("en-US", options);
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    if (task.status === "Done" || task.status === "Skipped") return;

    const div = document.createElement("div");
    div.className = "task";
    div.draggable = true;
    div.dataset.index = index;

    div.innerHTML = `
      <div>
        <b>${task.name}</b> <br>
        Date: ${formatDate(task.date)} | Duration: ${task.duration}s
      </div>
      <div class="task-actions">
        <button onclick="completeTask(${index})">Complete</button>
        <button onclick="skipTask(${index})">Skip</button>
      </div>
    `;

    div.addEventListener("dragstart", dragStart);
    div.addEventListener("dragover", dragOver);
    div.addEventListener("drop", drop);

    taskList.appendChild(div);
  });

  document.getElementById("totalTasks").innerText = `${tasks.length} Task`;
  document.getElementById("inProgress").innerText = `${tasks.filter(t => t.status === "In Progress").length} In Progress`;
  document.getElementById("doneTasks").innerText = `${tasks.filter(t => t.status === "Done").length} Done`;
}

function addTask() {
  const name = document.getElementById("taskName").value;
  const date = document.getElementById("taskDate").value;
  const duration = parseInt(document.getElementById("taskDuration").value);

  if (!name || !date || !duration || duration < 1) {
    return alert("Duration must be at least 1 second!");
  }

  tasks.push({ name, date, duration, status: "Not Started", executedAt: null });
  saveTasks();
  renderTasks();
  taskForm.classList.add("hidden");
}

function completeTask(index) {
  tasks[index].status = "Done";
  tasks[index].executedAt = new Date().toISOString();
  saveTasks();
  renderTasks();
}

function skipTask(index) {
  tasks[index].status = "Skipped";
  tasks[index].executedAt = new Date().toISOString();
  saveTasks();
  renderTasks();
}

function startAllTasks() {
  if (running) return;
  running = true;
  currentIndex = 0;
  runNextTask();
}

function checkScheduledTasks() {
  const now = new Date();
  tasks.forEach((task, index) => {
    const taskTime = new Date(task.date);

    if (now >= taskTime && task.status === "Not Started") {
      startTask(index);
    }
  });
}

function startTask(index) {
  const task = tasks[index];
  task.status = "In Progress";
  renderTasks();

  timerPopup.style.display = "block";
  timerPopup.innerHTML = `Task: ${task.name} <br> Time remaining: <span id="timer">${task.duration}</span>s`;

  let countdown = task.duration;
  const timerInterval = setInterval(() => {
    countdown--;
    document.getElementById("timer").innerText = countdown;
    if (countdown <= 0) {
      clearInterval(timerInterval);
      task.status = "Done";
      task.executedAt = new Date().toISOString();
      saveTasks();
      renderTasks();
      timerPopup.style.display = "none";
    }
  }, 1000);
}

setInterval(checkScheduledTasks, 60000);

function finishAll() {
  localStorage.setItem("taskSummary", JSON.stringify(tasks));
  window.location.href = "summary.html";
}

let draggedIndex;
function dragStart(e) {
  draggedIndex = e.target.dataset.index;
}
function dragOver(e) {
  e.preventDefault();
}
function drop(e) {
  const targetIndex = e.target.closest(".task").dataset.index;
  const draggedItem = tasks.splice(draggedIndex, 1)[0];
  tasks.splice(targetIndex, 0, draggedItem);
  saveTasks();
  renderTasks();
}

addTaskBtn.onclick = () => taskForm.classList.toggle("hidden");
createTaskBtn.onclick = addTask;
startAllBtn.onclick = startAllTasks;
endEarlyBtn.onclick = finishAll;

renderTasks();
