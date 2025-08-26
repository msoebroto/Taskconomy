let currentUser = null;
let users = JSON.parse(localStorage.getItem("users")) || {};

document.getElementById("showPassword").addEventListener("change", (e) => {
  const passwordField = document.getElementById("password");
  passwordField.type = e.target.checked ? "text" : "password";
});

function handleAuth() {
  if (currentUser) {
    // Logout
    currentUser = null;
    document.getElementById("authButton").textContent = "Login / Signup";
    document.getElementById("app").style.display = "none";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    return;
  }

  // Login / Signup
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Please enter username and password");
    return;
  }

  if (!users[username]) {
    // new signup
    users[username] = { password, points: 0, tasks: [], rewards: [] };
    alert("New account created!");
  } else if (users[username].password !== password) {
    alert("Incorrect password!");
    return;
  }

  currentUser = username;
  saveUsers();

  document.getElementById("authButton").textContent = "Logout";
  document.getElementById("app").style.display = "block";

  // Hide the welcome description after login
  document.getElementById("description").style.display = "none";

  loadUserData();
}

function logout() {
  localStorage.removeItem("currentUser");
  document.getElementById("authBox").style.display = "block";
  document.getElementById("app").style.display = "none";
  document.getElementById("authButton").textContent = "Login / Signup";
  document.getElementById("description").style.display = "block";
}


function saveUsers() {
  localStorage.setItem("users", JSON.stringify(users));
}

function loadUserData() {
  const user = users[currentUser];
  points = user.points || 0;
  tasks = user.tasks || [];
  rewards = user.rewards || [];

  document.getElementById("points").textContent = points.toFixed(1);
  renderTasks();
  renderRewards();
}

let tasks = [];
let points = 0;
let rewards = [];

// Save current user’s data
function saveData() {
  if (!currentUser) return;
  users[currentUser].points = points;
  users[currentUser].tasks = tasks;
  users[currentUser].rewards = rewards;
  saveUsers();
}

// ---- TASKS ----
function renderTasks() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";
  tasks.forEach(task => {
    const taskDiv = document.createElement("div");
    taskDiv.className = "task" + (task.completed ? " completed" : "");
    taskDiv.innerHTML = `
      <div class="task-title">
        <strong>${task.title}</strong> - ${Math.floor(task.hours)} hr ${Math.round((task.hours % 1) * 60)} min = ${task.points.toFixed(1)} pts
        <em>(${task.category})</em>
      </div>
      <div class="task-actions">
        <button onclick="toggleTask(${task.id})">${task.completed ? "Undo" : "Complete"}</button>
        <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
      </div>
    `;
    taskList.appendChild(taskDiv);
  });
}

function addTask() {
  const title = document.getElementById("taskTitle").value.trim();
  const hours = Number(document.getElementById("taskHours").value);
  const minutes = Number(document.getElementById("taskMinutes").value);
  const category = document.getElementById("taskCategory").value;

  if (!title || (hours === 0 && minutes === 0)) return;

  // Convert total time to fractional hours
  const totalHours = hours + minutes / 60;
  const points = totalHours * 10; // 1 hour = 10 points

  const newTask = {
    id: Date.now(),
    title,
    hours: totalHours,
    points,
    completed: false,
    category
  };

  tasks.push(newTask);
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskHours").value = 0;
  document.getElementById("taskMinutes").value = 30;
  renderTasks();
  saveData();
}

function toggleTask(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      if (!task.completed) {
        points += task.points;
      } else {
        points -= task.points;
      }
      task.completed = !task.completed;
    }
    return task;
  });
  document.getElementById("points").textContent = points.toFixed(1);
  renderTasks();
  saveData();
}

function deleteTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task?.completed) {
    points -= task.points;
  }
  tasks = tasks.filter(task => task.id !== id);
  document.getElementById("points").textContent = points.toFixed(1);
  renderTasks();
  saveData();
}

let taskTimer = null;
let taskStartTime = null;

function startTaskTimer() {
    const title = document.getElementById("taskTitle").value.trim();
    if (!title) return alert("Enter a task title before starting the timer!");

    taskStartTime = Date.now();
    document.getElementById("startTaskTimerBtn").disabled = true;
    document.getElementById("stopTaskTimerBtn").disabled = false;

    taskTimer = setInterval(() => {
        const elapsed = Date.now() - taskStartTime;
        const hrs = Math.floor(elapsed / (1000 * 60 * 60));
        const mins = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((elapsed % (1000 * 60)) / 1000);
        document.getElementById("taskTimerDisplay").textContent =
            `${hrs.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
    }, 1000);
}

function stopTaskTimer() {
    if (!taskStartTime) return;

    const elapsedMs = Date.now() - taskStartTime;
    clearInterval(taskTimer);
    taskTimer = null;
    document.getElementById("startTaskTimerBtn").disabled = false;
    document.getElementById("stopTaskTimerBtn").disabled = true;

    // Convert ms to total minutes, round up
    const totalMinutes = Math.floor(elapsedMs / (1000 * 60));
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const totalHours = totalMinutes / 60; // fractional hours for points
    const pointsEarned = totalHours * 10; // 1 hour = 10 pts

    // Auto-add task using the title and category from inputs
    const title = document.getElementById("taskTitle").value.trim();
    const category = document.getElementById("taskCategory").value;

    if (!title) return alert("Task title is required!");

    const newTask = {
        id: Date.now(),
        title,
        hours: totalHours,
        points: pointsEarned,
        completed: true, // mark completed automatically
        category
    };

    tasks.push(newTask);
    points += pointsEarned;

    // Reset inputs and timer display
    document.getElementById("taskTitle").value = "";
    document.getElementById("taskHours").value = 0;
    document.getElementById("taskMinutes").value = 30;
    document.getElementById("taskTimerDisplay").textContent = "00:00:00";
    document.getElementById("points").textContent = points.toFixed(1);

    renderTasks();
    saveData();
}


// ---- REWARDS ----
function redeemReward() {
    const name = document.getElementById("rewardName").value.trim();
    const hours = Number(document.getElementById("rewardHours").value);
    const minutes = Number(document.getElementById("rewardMinutes").value);
    const category = document.getElementById("rewardCategory").value;

    if (!name || (hours === 0 && minutes === 0)) {
        return alert("Enter a valid reward and time!");
    }

    const totalHours = hours + minutes / 60;
    const cost = totalHours * 40; // 1 hour reward = 40 points

    if (points < cost) return alert("Not enough points!");

    points -= cost;
    rewards.push({
        id: Date.now(),
        name,
        hours: totalHours,
        cost,
        category
    });

    document.getElementById("points").textContent = points.toFixed(1);
    document.getElementById("rewardName").value = "";
    document.getElementById("rewardHours").value = 0;
    document.getElementById("rewardMinutes").value = 30;
    renderRewards();
    saveData();
}

function renderRewards() {
    const rewardHistory = document.getElementById("rewardHistory");
    rewardHistory.innerHTML = "";

    rewards.forEach(r => {
        const rewardDiv = document.createElement("div");
        rewardDiv.className = "reward-item";

        const hrs = Math.floor(r.hours);
        const mins = Math.round((r.hours % 1) * 60);

        rewardDiv.innerHTML = `
          <div class="reward-title">
            <strong>${r.name}</strong> - ${hrs} hr ${mins} min = ${r.cost.toFixed(1)} pts
            <em>(${r.category})</em>
          </div>
          <div class="reward-actions">
                <button onclick="undoReward(${r.id})">Undo</button>
                <button class="delete-btn" onclick="deleteReward(${r.id})">Delete</button>
          </div>
        `;

        rewardHistory.appendChild(rewardDiv);
    });
}

// Undo a reward: refund points and remove reward
function undoReward(id) {
    const rewardIndex = rewards.findIndex(r => r.id === id);
    if (rewardIndex === -1) return;

    const reward = rewards[rewardIndex];
    points += reward.cost;  // refund points
    rewards.splice(rewardIndex, 1);

    document.getElementById("points").textContent = points.toFixed(1);
    renderRewards();
    saveData();
}

// Delete a reward and refund points
function deleteReward(id) {
    const rewardIndex = rewards.findIndex(r => r.id === id);
    if (rewardIndex === -1) return;

    const reward = rewards[rewardIndex];

    // Refund points
    points += reward.cost;

    // Remove reward
    rewards.splice(rewardIndex, 1);

    document.getElementById("points").textContent = points.toFixed(1);
    renderRewards();
    saveData();
}


let rewardTimer = null;
let rewardStartTime = null;

function startRewardTimer() {
    const name = document.getElementById("rewardName").value.trim();
    if (!name) return alert("Enter a reward name before starting the timer!");

    rewardStartTime = Date.now();
    document.getElementById("startTimerBtn").disabled = true;
    document.getElementById("stopTimerBtn").disabled = false;

    rewardTimer = setInterval(() => {
        const elapsed = Date.now() - rewardStartTime;
        const hrs = Math.floor(elapsed / (1000 * 60 * 60));
        const mins = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((elapsed % (1000 * 60)) / 1000);
        document.getElementById("timerDisplay").textContent =
            `${hrs.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
    }, 1000);
}

function stopRewardTimer() {
    if (!rewardStartTime) return;

    const elapsedMs = Date.now() - rewardStartTime;
    clearInterval(rewardTimer);
    rewardTimer = null;
    document.getElementById("startTimerBtn").disabled = false;
    document.getElementById("stopTimerBtn").disabled = true;

    // Convert ms to total minutes, round up
    const totalMinutes = Math.ceil(elapsedMs / (1000 * 60));
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const totalHours = totalMinutes / 60; // fractional hours for points

    const cost = totalHours * 40;
    if (points < cost) return alert("Not enough points for this reward!");

    points -= cost;

    const name = document.getElementById("rewardName").value.trim();
    const category = document.getElementById("rewardCategory").value;

    rewards.push({
        id: Date.now(),
        name,
        hours: totalHours,
        cost,
        category
    });

    // Reset display and inputs
    document.getElementById("points").textContent = points.toFixed(1);
    document.getElementById("rewardName").value = "";
    document.getElementById("rewardHours").value = 0;
    document.getElementById("rewardMinutes").value = 30;
    document.getElementById("timerDisplay").textContent = "00:00:00";

    renderRewards();
    saveData();
}