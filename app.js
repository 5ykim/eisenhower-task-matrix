// 할 일 목록은 여러 값을 순서대로 저장하는 배열(list)입니다.
let tasks = loadTasks();

const quadrantInfo = {
  do: { listId: "do-list", empty: "지금 처리할 할 일이 없습니다." },
  plan: { listId: "plan-list", empty: "일정을 잡을 중요한 일이 없습니다." },
  delegate: { listId: "delegate-list", empty: "위임할 일이 없습니다." },
  later: { listId: "later-list", empty: "나중에 할 일이 없습니다." },
};

const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");
const importanceInput = document.querySelector("#importance");
const urgencyInput = document.querySelector("#urgency");
const formMessage = document.querySelector("#form-message");
const taskCount = document.querySelector("#task-count");
const taskTemplate = document.querySelector("#task-template");

// 조건문(if / else if / else)으로 중요도와 긴급도를 네 영역 중 하나로 분류합니다.
function classifyTask(importance, urgency) {
  if (importance === "important" && urgency === "urgent") {
    return "do";
  } else if (importance === "important" && urgency === "not-urgent") {
    return "plan";
  } else if (importance === "not-important" && urgency === "urgent") {
    return "delegate";
  } else {
    return "later";
  }
}

// 입력값을 확인하는 함수입니다. 제목이 비어 있으면 false를 반환합니다.
function isValidTitle(title) {
  return title.trim().length > 0;
}

// 폼을 제출했을 때 새 할 일을 배열에 추가합니다.
function addTask(event) {
  event.preventDefault();

  const title = titleInput.value.trim();

  if (!isValidTitle(title)) {
    formMessage.textContent = "할 일 내용을 입력해 주세요.";
    titleInput.focus();
    return;
  }

  // 객체(dictionary)는 한 할 일의 여러 정보를 이름표와 함께 저장합니다.
  const newTask = {
    id: Date.now(),
    title: title,
    quadrant: classifyTask(importanceInput.value, urgencyInput.value),
    isComplete: false,
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  form.reset();
  formMessage.textContent = `“${title}”을(를) 추가했습니다.`;
  titleInput.focus();
}

// 반복문(for ... of)으로 배열 안의 모든 할 일을 차례대로 화면에 표시합니다.
function renderTasks() {
  for (const key in quadrantInfo) {
    const list = document.querySelector(`#${quadrantInfo[key].listId}`);
    list.innerHTML = "";
  }

  for (const task of tasks) {
    const list = document.querySelector(`#${quadrantInfo[task.quadrant].listId}`);
    const taskElement = createTaskElement(task);
    list.append(taskElement);
  }

  for (const key in quadrantInfo) {
    const list = document.querySelector(`#${quadrantInfo[key].listId}`);
    if (list.children.length === 0) {
      const emptyMessage = document.createElement("li");
      emptyMessage.className = "empty-message";
      emptyMessage.textContent = quadrantInfo[key].empty;
      list.append(emptyMessage);
    }
  }

  const completedCount = tasks.filter((task) => task.isComplete).length;
  taskCount.textContent = `등록된 할 일 ${tasks.length}개 · 완료 ${completedCount}개`;
}

// 한 개의 할 일 카드를 만드는 함수입니다.
function createTaskElement(task) {
  const fragment = taskTemplate.content.cloneNode(true);
  const item = fragment.querySelector(".task-item");
  const checkbox = fragment.querySelector(".complete-checkbox");
  const text = fragment.querySelector(".task-text");
  const deleteButton = fragment.querySelector(".delete-button");

  text.textContent = task.title;
  checkbox.checked = task.isComplete;
  item.classList.toggle("is-complete", task.isComplete);

  checkbox.addEventListener("change", () => toggleTask(task.id));
  deleteButton.addEventListener("click", () => deleteTask(task.id));

  return fragment;
}

function toggleTask(id) {
  for (const task of tasks) {
    if (task.id === id) {
      task.isComplete = !task.isComplete;
      break;
    }
  }

  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

function saveTasks() {
  localStorage.setItem("eisenhower-tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const savedTasks = localStorage.getItem("eisenhower-tasks");
  return savedTasks ? JSON.parse(savedTasks) : [];
}

form.addEventListener("submit", addTask);
renderTasks();
