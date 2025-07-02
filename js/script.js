let questions = [];
let timer;
let timeLeft = 3600;
let userAnswers = [];
let subject = null;

// URL パラメータ取得
const params = new URLSearchParams(window.location.search);
subject = params.get('subject') || "文法";

// 初期ダイアログ設定
window.onload = () => {
  document.getElementById("start-settings-modal").style.display = "flex";
  document.getElementById("test-title").textContent = "日本語オンラインテスト： " + subject;
};

// テーマ切り替え
document.addEventListener('DOMContentLoaded', () => {
  const themeButton = document.getElementById('toggle-theme');
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.body.classList.add('dark-mode');
    themeButton.textContent = '☀️';
  }

  themeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeButton.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
});

// Начало теста
document.getElementById("start-test-btn").addEventListener("click", () => {
  const count = parseInt(document.getElementById("question-count").value) || 20;
  const time = parseInt(document.getElementById("time-limit").value) || 60;
  timeLeft = time * 60;

  fetch('questions.json')
    .then(res => res.json())
    .then(data => {
      questions = shuffleArray(data[subject] || []).slice(0, count);
      displayQuestions();
      startTimer();
      document.getElementById("start-settings-modal").style.display = "none";
    });
});

// Вопросы
function displayQuestions() {
  const container = document.getElementById("questions-container");
  container.innerHTML = '';

  questions.forEach((q, index) => {
    const div = document.createElement('div');
    div.className = 'question';
    let html = `<p><strong>${index + 1}. ${q.question}</strong></p>`;

    if (q.image) {
      html += `<img src="${q.image}" alt="question image" style="max-width: 300px;"><br>`;
    }

    const options = shuffleArray(q.options.map((opt, i) =>
      typeof opt === 'string' ? { text: opt, index: i } : { ...opt, index: i }
    ));

    options.forEach(opt => {
      const id = `q${index}_o${opt.index}`;
      html += `<label><input type="radio" name="q${index}" value="${opt.index}">`;
      html += opt.image
        ? ` <img src="${opt.image}" alt="option image" style="max-width: 150px;">`
        : ` ${opt.text}`;
      html += `</label><br>`;
    });

    div.innerHTML = html;
    container.appendChild(div);
  });
}

// Таймер
function startTimer() {
  const timerElem = document.getElementById("timer");
  timer = setInterval(() => {
    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const seconds = String(timeLeft % 60).padStart(2, '0');
    timerElem.textContent = `${minutes}:${seconds}`;
    if (--timeLeft < 0) {
      clearInterval(timer);
      submitTest();
    }
  }, 1000);
}

// Перемешивание
function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// Подтверждение завершения
document.getElementById("stop_test").addEventListener("click", () => {
  document.getElementById("confirm-end-modal").style.display = "flex";
});

document.getElementById("confirm-end-yes").addEventListener("click", () => {
  document.getElementById("confirm-end-modal").style.display = "none";
  submitTest();
});

document.getElementById("confirm-end-no").addEventListener("click", () => {
  document.getElementById("confirm-end-modal").style.display = "none";
});

// Подтверждение выхода
document.getElementById("back_button").addEventListener("click", () => {
  document.getElementById("confirm-exit-modal").style.display = "flex";
});

document.getElementById("confirm-exit-yes").addEventListener("click", () => {
  window.location.href = 'index.html';
});

document.getElementById("confirm-exit-no").addEventListener("click", () => {
  document.getElementById("confirm-exit-modal").style.display = "none";
});

// Проверка
function submitTest() {
  clearInterval(timer);
  const allQuestions = document.querySelectorAll('.question');
  let correctCount = 0;
  userAnswers = [];

  questions.forEach((q, i) => {
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    const selectedIndex = selected ? parseInt(selected.value) : -1;
    userAnswers.push(selectedIndex);

    const options = allQuestions[i].querySelectorAll('input[type=radio]');
    options.forEach(opt => {
      const optIndex = parseInt(opt.value);
      const label = opt.parentElement;

      if (optIndex === q.answer) label.classList.add('correct-answer');
      if (opt.checked && optIndex === q.answer) {
        correctCount++;
        label.classList.add('correct');
      } else if (opt.checked && optIndex !== q.answer) {
        label.classList.add('incorrect');
      }

      opt.disabled = true;
    });
  });

  const result = document.createElement('p');
  result.innerHTML = `<strong>正解: ${questions.length} 点中 ${correctCount}点</strong>`;
  document.getElementById("questions-container").appendChild(result);
}