let questions = [];
let timer;
let timeLeft = 3600; // Общее время на тест — 1 час (можно изменить)
//let timeLeft = parseInt(params.get('time')) || 3600; // Пользовательский выбор или 1 час
let userAnswers = [];

// Получаем параметры из URL — subject (тема) и count (кол-во вопросов)
const params = new URLSearchParams(window.location.search);
const subject = params.get('subject');
const count = parseInt(params.get('count')) || 200; // по умолчанию 6 вопросов

// Загружаем вопросы из JSON по выбранной теме
if (subject) {
  fetch('questions.json')
    .then(res => res.json())
    .then(data => {
      // Перемешиваем и берем только нужное количество вопросов
      questions = shuffleArray(data[subject]).slice(0, count);
      displayQuestions();   // отображаем вопросы
      startTimer();         // запускаем таймер
      document.getElementById("test-title").textContent = "日本語オンラインテスト： " + subject;
    });
}

// Отображение вопросов и вариантов
function displayQuestions() {
  const container = document.getElementById("questions-container");

  questions.forEach((q, index) => {
    const div = document.createElement('div');
    div.className = 'question';

    // Заголовок вопроса
    let html = `<p><strong>${index + 1}. ${q.question}</strong></p>`;

    // Если есть изображение вопроса
    if (q.image) {
      html += `<img src="${q.image}" alt="question image" style="max-width: 300px;"><br>`;
    }

    // Обрабатываем варианты — могут быть текстом или изображением
    const options = shuffleArray(q.options.map((opt, i) => {
      return typeof opt === 'string'
        ? { text: opt, index: i }
        : { ...opt, index: i }; // если opt — объект с text/image
    }));

    // Создаем HTML для каждого варианта
    options.forEach(opt => {
      const id = `q${index}_o${opt.index}`;
      html += `<label><input type="radio" name="q${index}" value="${opt.index}">`;

      if (opt.image) {
        html += ` <img src="${opt.image}" alt="option image" style="max-width: 150px;">`;
      } else {
        html += ` ${opt.text}`;
      }

      html += `</label><br>`;
    });

    div.innerHTML = html;
    container.appendChild(div);
  });
}

// Перемешивание массива (вопросов или вариантов)
function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// Запуск таймера
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

// Обработка отправки теста
function submitTest() {
  clearInterval(timer);
  const allQuestions = document.querySelectorAll('.question');
  let correctCount = 0;
  userAnswers = [];

  // Проверяем каждый вопрос
  questions.forEach((q, i) => {
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    const selectedIndex = selected ? parseInt(selected.value) : -1;
    userAnswers.push(selectedIndex);

    const options = allQuestions[i].querySelectorAll('input[type=radio]');
    options.forEach(opt => {
      const optIndex = parseInt(opt.value);
      const label = opt.parentElement;

      if (optIndex === q.answer) {
        label.classList.add('correct-answer');
      }

      if (opt.checked && optIndex === q.answer) {
        correctCount++;
        label.classList.add('correct');
      } else if (opt.checked && optIndex !== q.answer) {
        label.classList.add('incorrect');
      }

      opt.disabled = true;
    });
  });

  // Показываем результат
  const result = document.createElement('p');
  result.innerHTML = `<strong>正解: ${questions.length} 点中 ${correctCount}点</strong>`;
  document.getElementById("questions-container").appendChild(result);

  // Сравнение ответов
  displayAnswerComparison();
}

document.addEventListener('DOMContentLoaded', () => {
  const themeButton = document.getElementById('toggle-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Установить тему из localStorage или по умолчанию
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.body.classList.add('dark-mode');
    themeButton.textContent = '☀️'; //\u2600
  }

  themeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');

    themeButton.textContent = isDark ? '☀️' : '🌙'; //\u2600   \u263C
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
});