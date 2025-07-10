let questionsData = {};
let user = { name: '', score: 0, blocks: [] };
let blockKeys = [];
let currentBlockIndex = 0;
let timeLeft = 0;
let timer;
let startTime;

// --- ТЕМА: сохранение и переключение ---
const themeToggle = document.getElementById("themeToggle");
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
  document.body.classList.add("dark-mode");
  themeToggle.textContent = "☀️";
}

themeToggle.onclick = () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("theme", isDark ? "dark" : "light");
};

// --- ОБРАБОТКА ВВОДА ИМЕНИ ---
window.addEventListener("DOMContentLoaded", () => {
  const usernameInput = document.getElementById("username");
  const startBtn = document.querySelector("button[onclick='startTest()']");
  usernameInput.addEventListener("input", () => {
    if (usernameInput.value.trim()) {
      startBtn.classList.add("pulsing-light");
    } else {
      startBtn.classList.remove("pulsing-light");
    }
  });
});

// --- СТАРТ ТЕСТА ---
async function startTest() {
  const usernameInput = document.getElementById("username");
  const name = usernameInput.value.trim();
  if (!name) return alert("名前を入力してください！");
  user.name = name;

  document.getElementById("user-form").classList.add("hidden");
  document.getElementById("test-section").classList.remove("hidden");

  await loadQuestions();
  blockKeys = Object.keys(questionsData); // Получаем список блоков
  currentBlockIndex = 0;
  user.blocks = [];

  loadBlock(blockKeys[currentBlockIndex]);
}

// --- ЗАГРУЗКА JSON ---
async function loadQuestions() {
  const res = await fetch("./json/shikenQuestions.json");
  questionsData = await res.json();
}

// --- ЗАПУСК БЛОКА ТЕСТОВ ---
function loadBlock(blockKey) {
  renderAllQuestions(blockKey);

  const blockTime = questionsData[blockKey].time ?? 300; // Установка времени (по умолч. 5 мин)
  startTimer(blockTime);

  // Кнопка 次へ / 完了
  const finishBtn = document.querySelector("button[onclick='confirmSubmit()']");
  finishBtn.textContent = currentBlockIndex < blockKeys.length - 1 ? "次へ" : "完了";
}

// --- ТАЙМЕР БЛОКА ---
function startTimer(seconds) {
  const timerElem = document.getElementById("time");
  clearInterval(timer);
  timeLeft = seconds;
  startTime = Date.now();

  timer = setInterval(() => {
    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const secondsLeft = String(timeLeft % 60).padStart(2, '0');
    timerElem.textContent = `${minutes}:${secondsLeft}`;
    if (--timeLeft < 0) {
      clearInterval(timer);
      handleNext(); // Авто-переход по таймеру
    }
  }, 1000);
}

// --- ОТОБРАЖЕНИЕ ВОПРОСОВ БЛОКА ---
function renderAllQuestions(blockKey) {
  const form = document.getElementById("test-form");
  form.innerHTML = "";

  const block = questionsData[blockKey];
  for (const cls in block) {
    if (cls === "time") continue; // Пропустить поле time
    const classData = block[cls];
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

// --- УНИВЕРСАЛЬНАЯ КНОПКА: 次へ / 完了 ---
async function confirmSubmit() {
  const isLastBlock = currentBlockIndex >= blockKeys.length - 1;
  const confirmText = isLastBlock ? "テストを終了しますか？" : "次のブロックへ進みますか？";
  if (await showConfirm(confirmText)) {
    clearInterval(timer);
    handleNext();
  }
}

// --- ПЕРЕХОД К СЛЕДУЮЩЕМУ БЛОКУ ИЛИ РЕЗУЛЬТАТЫ ---
function handleNext() {
  const blockKey = blockKeys[currentBlockIndex];
  const inputs = document.querySelectorAll("input[type=radio]:checked");
  let blockScore = 0;

  inputs.forEach(input => {
    if (input.value === input.dataset.answer) {
      blockScore += parseFloat(input.dataset.points);
    }
  });

  const timeSpent = Math.floor((Date.now() - startTime) / 1000);

  user.blocks.push({
    name: blockKey,
    score: blockScore,
    time: timeSpent
  });

  user.score += blockScore;
  currentBlockIndex++;

  if (currentBlockIndex < blockKeys.length) {
    loadBlock(blockKeys[currentBlockIndex]);
  } else {
    showResults();
  }
}

// --- ВЫВОД ИТОГОВ ВСЕХ БЛОКОВ ---
function showResults() {
  document.getElementById("test-section").classList.add("hidden");
  document.getElementById("result-section").classList.remove("hidden");

  const resultElem = document.getElementById("score-result");
  let html = `<h3>${user.name}さん、テスト結果:</h3><ul>`;
  let totalTime = 0;

  user.blocks.forEach(block => {
    const min = Math.floor(block.time / 60);
    const sec = block.time % 60;
    totalTime += block.time;
    html += `<li><b>${block.name}</b>：${block.score} 点（${min}分${sec}秒）</li>`;
  });

  const min = Math.floor(totalTime / 60);
  const sec = totalTime % 60;

  html += `</ul><p><b>総得点：</b>${user.score} 点</p>`;
  html += `<p><b>総時間：</b>${min}分${sec}秒</p>`;

  resultElem.innerHTML = html;
  saveResult();
}

// --- ВОЗВРАТ В ГЛАВНОЕ МЕНЮ ---
async function goToMainMenu() {
  if (await showConfirm("メインメニューに戻りますか？")) {
    window.location.href = "index.html";
  }
}

// --- ВОЗВРАТ В НАЧАЛО ---
async function confirmExit() {
  if (await showConfirm("レジストリ メニューに戻りますか?")) {
    location.reload();
  }
}

// --- СТАНДАРТНОЕ ОКНО ПОДТВЕРЖДЕНИЯ ---
function showConfirm(text) {
  return new Promise(res => {
    let modal = document.getElementById("confirm-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "confirm-modal";
      modal.style.position = "fixed";
      modal.style.top = "0";
      modal.style.left = "0";
      modal.style.right = "0";
      modal.style.bottom = "0";
      modal.style.background = "rgba(0,0,0,0.6)";
      modal.style.display = "flex";
      modal.style.justifyContent = "center";
      modal.style.alignItems = "center";
      modal.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 10px; max-width: 300px; text-align: center;">
          <p id="confirm-text" style="margin-bottom: 15px;"></p>
          <button id="confirm-yes">はい</button>
          <button id="confirm-no" style="margin-left: 10px;">いいえ</button>
        </div>`;
      document.body.appendChild(modal);
    }
    document.getElementById("confirm-text").textContent = text;
    modal.classList.remove("hidden");
    document.getElementById("confirm-yes").onclick = () => { modal.classList.add("hidden"); res(true); };
    document.getElementById("confirm-no").onclick = () => { modal.classList.add("hidden"); res(false); };
  });
}

// --- СОХРАНЕНИЕ РЕЗУЛЬТАТА ---
function saveResult() {
  const history = JSON.parse(localStorage.getItem("results") || "[]");
  history.push({ name: user.name, score: user.score, blocks: user.blocks, date: new Date().toISOString() });
  localStorage.setItem("results", JSON.stringify(history));
}

startTest