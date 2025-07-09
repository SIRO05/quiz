// === Загружаемые данные вопросов === //
let questionsData = {};

// === Информация о пользователе === //
let user = { name: "", score: 0 };

// === Время в секундах и объект таймера === //
let timeLeft = 3000;
let timer;

/**
 * === Переключение светлой и тёмной темы ===
 */
document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
  document.getElementById("themeToggle").textContent =
    document.body.classList.contains("dark") ? "☀️" : "🌙";
};

/**
 * === Старт теста после ввода имени ===
 */
async function startTest() {
  const name = document.getElementById("username").value.trim();
  if (!name) return alert("Введите имя!");

  user.name = name;

  document.getElementById("user-form").classList.add("hidden");
  document.getElementById("test-section").classList.remove("hidden");

  await loadQuestions();  // Загружаем JSON
  renderAllQuestions();   // Отображаем блоки
  startTimer();           // Запускаем таймер
}

/**
 * === Загрузка JSON с вопросами ===
 */
async function loadQuestions() {
  const res = await fetch("shikenQuestions.json");
  questionsData = await res.json();
}

/**
 * === Основной рендер вопросов по всем классам ===
 */
function renderAllQuestions() {
  const form = document.getElementById("test-form");
  form.innerHTML = ""; // Очищаем форму

  for (const cls in questionsData) {
    const classData = questionsData[cls];
    const classBlock = document.createElement("div");
    classBlock.className = "class-block";

    // === Заголовок блока (если указан) === //
    const title = document.createElement("h3");
    title.textContent = classData.title || cls;
    classBlock.appendChild(title);

    // === Фото-вопросы (особая структура) === //
if (classData.photos) {
  const photoLimit = classData.limit ?? classData.photos.length;

  // Перемешиваем фотоблоки перед тем как ограничивать
  const shuffledPhotos = classData.photos.sort(() => Math.random() - 0.5);

  shuffledPhotos
    .slice(0, photoLimit)
    .forEach((photo, pIdx) => {
      const img = document.createElement("img");
      img.src = photo.image;
      classBlock.appendChild(img);

      photo.questions.forEach((q, qIdx) => {
        const id = `photo-${pIdx}-${qIdx}`;
        const html = `<p>${q.question}</p>` +
          q.options.sort(() => Math.random() - 0.5).map(opt =>
            `<label><input type="radio" name="${id}" value="${opt}" data-answer="${q.answer}" data-points="${classData.points}"> ${opt}</label><br>`
          ).join("");

        const div = document.createElement("div");
        div.innerHTML = html;
        classBlock.appendChild(div);
      });
    });
}

    // === Обычные текстовые вопросы === //
    else if (classData.questions) {
      const limit = classData.limit ?? classData.questions.length;

      classData.questions
        .sort(() => Math.random() - 0.5)
        .slice(0, limit)
        .forEach((q, qIdx) => {
          const id = `${cls}-${qIdx}`;
          const html = `<p>${q.question}</p>` +
            q.options.sort(() => Math.random() - 0.5).map(opt =>
              `<label><input type="radio" name="${id}" value="${opt}" data-answer="${q.answer}" data-points="${classData.points}"> ${opt}</label><br>`
            ).join("");

          const div = document.createElement("div");
          div.innerHTML = html;
          classBlock.appendChild(div);
        });
    }

    // Добавляем сформированный блок в форму
    form.appendChild(classBlock);
  }
}

/**
 * === Таймер обратного отсчёта ===
 */
function startTimer() {
  const timerElem = document.getElementById("time");
  timer = setInterval(() => {
    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const seconds = String(timeLeft % 60).padStart(2, '0');
    timerElem.textContent = `${minutes}:${seconds}`;

    if (--timeLeft < 0) {
      clearInterval(timer);
      finishTest(); // Время вышло — завершение
    }
  }, 1000);
}

/**
 * === Завершение теста вручную по кнопке ===
 */
function confirmSubmit() {
  if (confirm("Вы уверены, что хотите завершить тест?")) {
    clearInterval(timer);
    finishTest();
  }
}

/**
 * === Выход без сохранения ===
 */
function confirmExit() {
  if (confirm("Вернуться в главное меню? Все ответы будут потеряны.")) {
    location.reload(); // Перезагрузка страницы
  }
}

/**
 * === Подсчёт очков и завершение теста ===
 */
function finishTest() {
  const inputs = document.querySelectorAll("input[type=radio]:checked");
  let score = 0;

  inputs.forEach(input => {
    const answer = input.dataset.answer;
    const value = input.value;
    const points = parseInt(input.dataset.points);
    if (value === answer) score += points;
  });

  user.score = score;

  // Отображаем результат
  document.getElementById("test-section").classList.add("hidden");
  document.getElementById("result-section").classList.remove("hidden");
  document.getElementById("score-result").textContent =
    `${user.name}, ваш результат: ${score} баллов.`;

  saveResult(); // Сохраняем результат
}

/**
 * === Сохраняем в историю (localStorage) ===
 */
function saveResult() {
  const history = JSON.parse(localStorage.getItem("results") || "[]");
  history.push({ name: user.name, score: user.score, date: new Date().toISOString() });
  localStorage.setItem("results", JSON.stringify(history));
}

// === Фото-вопросы (особая структура) === //