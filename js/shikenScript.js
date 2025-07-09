let questionsData = {};
let user = { name: '', score: 0 };
let timeLeft = 3000;
let timer;

const themeToggle = document.getElementById("themeToggle");
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
  document.body.classList.add("dark-mode");
  themeToggle.textContent = "☀️";
}

// Тема
themeToggle.onclick = () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("theme", isDark ? "dark" : "light");
};

// Старт теста
async function startTest() {
  const nameInput = document.getElementById("username");
  const name = nameInput.value.trim();
  if (!name) return alert("名前を入力してください！");
  user.name = name;

  document.getElementById("user-form").classList.add("hidden");
  document.getElementById("test-section").classList.remove("hidden");

  await loadQuestions();
  renderAllQuestions();
  startTimer();
}

// Загрузка
async function loadQuestions() {
  const res = await fetch("shikenQuestions.json");
  questionsData = await res.json();
}

// Отображение
function renderAllQuestions() {
  const form = document.getElementById("test-form");
  form.innerHTML = "";

  for (const cls in questionsData) {
    const classData = questionsData[cls];
    const classBlock = document.createElement("div");
    classBlock.className = "class-block";

    const title = document.createElement("h3");
    title.textContent = classData.title || cls;
    classBlock.appendChild(title);

    if (classData.photos) {
      const limit = classData.limit ?? classData.photos.length;
      const photos = classData.photos.sort(() => Math.random() - 0.5).slice(0, limit);
      photos.forEach((photo, pIdx) => {
        const img = document.createElement("img");
        img.src = photo.image;
        classBlock.appendChild(img);

        photo.questions.forEach((q, qIdx) => {
          const id = `photo-${pIdx}-${qIdx}`;
          const div = document.createElement("div");
          div.innerHTML = `<p>${q.question}</p>` +
            q.options.sort(() => Math.random() - 0.5).map(opt =>
              `<label><input type="radio" name="${id}" value="${opt}" data-answer="${q.answer}" data-points="${classData.points}"> ${opt}</label><br>`
            ).join("");
          classBlock.appendChild(div);
        });
      });
    } else if (classData.questions) {
      const limit = classData.limit ?? classData.questions.length;
      classData.questions.sort(() => Math.random() - 0.5).slice(0, limit).forEach((q, qIdx) => {
        const id = `${cls}-${qIdx}`;
        const div = document.createElement("div");
        div.innerHTML = `<p>${q.question}</p>` +
          q.options.sort(() => Math.random() - 0.5).map(opt =>
            `<label><input type="radio" name="${id}" value="${opt}" data-answer="${q.answer}" data-points="${classData.points}"> ${opt}</label><br>`
          ).join("");
        classBlock.appendChild(div);
      });
    }

    form.appendChild(classBlock);
  }
}

// Таймер
function startTimer() {
  const timerElem = document.getElementById("time");
  timer = setInterval(() => {
    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const seconds = String(timeLeft % 60).padStart(2, '0');
    timerElem.textContent = `${minutes}:${seconds}`;
    if (--timeLeft < 0) {
      clearInterval(timer);
      finishTest();
    }
  }, 1000);
}

// Завершение вручную
function confirmSubmit() {
  if (confirm("テストを終了しますか？")) {
    clearInterval(timer);
    finishTest();
  }
}

// Выход
function confirmExit() {
  if (confirm("メインメニューに戻りますか？")) {
    location.reload();
  }
}

// Завершение и подсчёт
function finishTest() {
  const inputs = document.querySelectorAll("input[type=radio]:checked");
  let score = 0;
  inputs.forEach(input => {
    if (input.value === input.dataset.answer) {
      score += parseInt(input.dataset.points);
    }
  });
  user.score = score;

  document.getElementById("test-section").classList.add("hidden");
  document.getElementById("result-section").classList.remove("hidden");
  document.getElementById("score-result").textContent = `${user.name}さん、あなたのスコアは： ${score} 点です。`;

  saveResult();
}

// Сохранение
function saveResult() {
  const history = JSON.parse(localStorage.getItem("results") || "[]");
  history.push({ name: user.name, score: user.score, date: new Date().toISOString() });
  localStorage.setItem("results", JSON.stringify(history));
}