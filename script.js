// Each category contains its own question bank. The quiz randomly selects and shuffles 10 questions.
const QUESTION_COUNT = 10;
const QUIZ_SECONDS = 600;
const STORAGE_KEY = "interactiveQuizBestScores";

const questionBank = {
  web: {
    name: "Web Development",
    questions: [
      { question: "Which language is used to create the structure of a web page?", options: ["HTML", "CSS", "JavaScript", "Python"], answer: 0 },
      { question: "Which language is used for styling a web page?", options: ["HTML", "CSS", "Java", "C++"], answer: 1 },
      { question: "Which language is commonly used to add interactivity to a webpage?", options: ["HTML", "CSS", "JavaScript", "SQL"], answer: 2 },
      { question: "Which HTML tag creates a paragraph?", options: ["<p>", "<h1>", "<br>", "<div>"], answer: 0 },
      { question: "Which symbol selects an ID in CSS?", options: [".", "#", "*", "&"], answer: 1 },
      { question: "Which HTML tag creates a hyperlink?", options: ["<link>", "<a>", "<href>", "<url>"], answer: 1 },
      { question: "Which CSS property changes text color?", options: ["font-color", "text-color", "color", "background"], answer: 2 },
      { question: "Which HTML tag is the largest standard heading?", options: ["<h6>", "<head>", "<h1>", "<heading>"], answer: 2 },
      { question: "Which attribute provides alternative text for an image?", options: ["src", "alt", "href", "title-only"], answer: 1 },
      { question: "Which CSS layout system is designed for rows or columns?", options: ["Flexbox", "SQL", "DOM", "JSON"], answer: 0 },
      { question: "Which tag is used to add JavaScript to an HTML page?", options: ["<javascript>", "<script>", "<code>", "<js>"], answer: 1 },
      { question: "What does CSS stand for?", options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative System Syntax", "Colorful Style Setup"], answer: 1 }
    ]
  },
 html: {
    name: "HTML",
    questions: [
        {
            question: "What does HTML stand for?",
            options: [
                "Hyper Text Markup Language",
                "High Text Machine Language",
                "Hyper Transfer Markup Language",
                "Home Tool Markup Language"
            ],
            answer: 0
        },
        {
            question: "Which tag creates a paragraph?",
            options: ["<para>", "<p>", "<text>", "<pg>"],
            answer: 1
        },
        {
            question: "Which tag inserts an image?",
            options: ["<image>", "<pic>", "<img>", "<src>"],
            answer: 2
        },
        {
            question: "Which attribute specifies an image path?",
            options: ["href", "src", "alt", "path"],
            answer: 1
        },
        {
            question: "Which tag creates a hyperlink?",
            options: ["<a>", "<linkto>", "<href>", "<url>"],
            answer: 0
        },
        {
            question: "Which tag creates the largest heading?",
            options: ["<h6>", "<head>", "<h1>", "<heading>"],
            answer: 2
        },
        {
            question: "Which tag creates an unordered list?",
            options: ["<ol>", "<ul>", "<li>", "<list>"],
            answer: 1
        },
        {
            question: "Which tag creates a table row?",
            options: ["<td>", "<th>", "<tr>", "<table-row>"],
            answer: 2
        },
        {
            question: "Which tag inserts a line break?",
            options: ["<break>", "<br>", "<lb>", "<newline>"],
            answer: 1
        },
        {
            question: "Which tag creates a list item?",
            options: ["<item>", "<li>", "<ul>", "<ol>"],
            answer: 1
        },
        {
            question: "Which tag creates a form?",
            options: ["<input>", "<form>", "<fieldset-only>", "<submit>"],
            answer: 1
        },
        {
            question: "Which attribute specifies a hyperlink destination?",
            options: ["src", "href", "alt", "action"],
            answer: 1
        }
    ]
},
  computer: {
    name: "Computer Basics",
    questions: [
      { question: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Control Processing User"], answer: 0 },
      { question: "Which device is primarily used to type text?", options: ["Monitor", "Keyboard", "Speaker", "Printer"], answer: 1 },
      { question: "Which of these is an operating system?", options: ["Windows", "HTML", "Mouse", "Google Search"], answer: 0 },
      { question: "Which component temporarily stores data currently in use?", options: ["RAM", "DVD", "Keyboard", "Printer"], answer: 0 },
      { question: "Which device displays visual output?", options: ["Scanner", "Monitor", "Microphone", "Router"], answer: 1 },
      { question: "What does URL identify?", options: ["A web resource address", "A type of CPU", "A spreadsheet formula", "A computer cable"], answer: 0 },
      { question: "Which of these is an input device?", options: ["Projector", "Speaker", "Mouse", "Monitor"], answer: 2 },
      { question: "Which application is commonly used to create spreadsheets?", options: ["Microsoft Excel", "Paint", "Notepad", "Calculator"], answer: 0 },
      { question: "What is the main purpose of antivirus software?", options: ["Create presentations", "Help detect and remove malicious software", "Increase screen size", "Print documents"], answer: 1 },
      { question: "Which unit is commonly used to measure digital file size?", options: ["Kilogram", "Byte", "Litre", "Metre"], answer: 1 },
      { question: "Which network is generally used within a limited area such as an office?", options: ["LAN", "WAN only", "GPS", "HTML"], answer: 0 },
      { question: "What is a strong password practice?", options: ["Use 123456", "Reuse one password everywhere", "Use a long, unique password", "Share it publicly"], answer: 2 }
    ]
  }
};

let currentCategory = "";
let quizQuestions = [];
let currentQuestion = 0;
let selectedAnswers = [];
let timeLeft = QUIZ_SECONDS;
let timerInterval = null;
let quizFinished = false;

const $ = (id) => document.getElementById(id);

function readBestScores() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (error) {
    return {};
  }
}

function saveBestScore(category, percentage) {
  const bestScores = readBestScores();
  const previousBest = Number(bestScores[category] || 0);
  if (percentage > previousBest) {
    bestScores[category] = percentage;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bestScores));
    } catch (error) {
      // The quiz still works if browser storage is unavailable.
    }
  }
  updateBestScoreLabels();
  return Number((readBestScores())[category] || 0);
}

function updateBestScoreLabels() {
  const bestScores = readBestScores();
  const category = $("categorySelect").value;
  $("homeBestScore").textContent = category ? `${bestScores[category] || 0}%` : `${Math.max(0, ...Object.values(bestScores).map(Number))}%`;
}

function shuffle(array) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function startQuiz() {
  const chosenCategory = $("categorySelect").value;
  if (!chosenCategory || !questionBank[chosenCategory]) {
    $("startHint").textContent = "Please choose a category before starting.";
    $("categorySelect").focus();
    return;
  }

  currentCategory = chosenCategory;
  // Shuffle question order, then shuffle each question's options while preserving its correct answer.
  quizQuestions = shuffle(questionBank[currentCategory].questions)
    .slice(0, Math.min(QUESTION_COUNT, questionBank[currentCategory].questions.length))
    .map((q) => {
      const shuffledOptions = shuffle(q.options.map((text, index) => ({ text, isCorrect: index === q.answer })));
      return { question: q.question, options: shuffledOptions.map(o => o.text), answer: shuffledOptions.findIndex(o => o.isCorrect) };
    });

  currentQuestion = 0;
  selectedAnswers = new Array(quizQuestions.length).fill(null);
  timeLeft = QUIZ_SECONDS;
  quizFinished = false;
  $("timer").textContent = timeLeft;
  $("timer").parentElement.classList.remove("warning");
  $("startScreen").hidden = true;
  $("resultScreen").hidden = true;
  $("quizScreen").hidden = false;
  $("categoryName").textContent = questionBank[currentCategory].name;
  $("answerHint").textContent = "";
  showQuestion();
  startTimer();
}

function showQuestion() {
  const q = quizQuestions[currentQuestion];
  $("questionNumber").textContent = `Question ${currentQuestion + 1} of ${quizQuestions.length}`;
  $("question").textContent = q.question;
  $("options").replaceChildren();

  q.options.forEach((option, index) => {
    const optionButton = document.createElement("button");
    optionButton.type = "button";
    optionButton.className = "option";
    optionButton.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
    optionButton.setAttribute("aria-pressed", String(selectedAnswers[currentQuestion] === index));
    if (selectedAnswers[currentQuestion] === index) optionButton.classList.add("selected");
    optionButton.addEventListener("click", () => {
      selectedAnswers[currentQuestion] = index;
      $("answerHint").textContent = "Answer saved.";
      showQuestion();
    });
    $("options").appendChild(optionButton);
  });

  $("progressBar").style.width = `${((currentQuestion + 1) / quizQuestions.length) * 100}%`;
  $("prevBtn").disabled = currentQuestion === 0;
  $("nextBtn").style.display = currentQuestion === quizQuestions.length - 1 ? "none" : "inline-block";
  $("submitBtn").style.display = currentQuestion === quizQuestions.length - 1 ? "inline-block" : "none";
}

function nextQuestion() {
  if (currentQuestion < quizQuestions.length - 1) {
    currentQuestion++;
    $("answerHint").textContent = "";
    showQuestion();
  }
}

function previousQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    $("answerHint").textContent = "";
    showQuestion();
  }
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (quizFinished) return;
    timeLeft--;
    $("timer").textContent = timeLeft;
    if (timeLeft <= 10) $("timer").parentElement.classList.add("warning");
    if (timeLeft <= 0) submitQuiz(true);
  }, 1000);
}

function submitQuiz(timeExpired = false) {
  if (quizFinished) return;
  quizFinished = true;
  clearInterval(timerInterval);

  let correct = 0;
  let attempted = 0;
  quizQuestions.forEach((q, index) => {
    if (selectedAnswers[index] !== null) attempted++;
    if (selectedAnswers[index] === q.answer) correct++;
  });

  const total = quizQuestions.length;
  const incorrect = attempted - correct;
  const unanswered = total - attempted;
  const percentage = Math.round((correct / total) * 100);
  const best = saveBestScore(currentCategory, percentage);

  $("quizScreen").hidden = true;
  $("resultScreen").hidden = false;
  $("score").textContent = `${correct} / ${total}`;
  $("message").textContent = `${timeExpired ? "Time is up! " : ""}${percentage >= 80 ? "Excellent work! 🎉" : percentage >= 50 ? "Good effort! Keep practicing. 👍" : "Keep learning and try again! 💪"}`;
  $("summaryTotal").textContent = total;
  $("summaryAttempted").textContent = attempted;
  $("summaryCorrect").textContent = correct;
  $("summaryIncorrect").textContent = incorrect + unanswered;
  $("summaryPercent").textContent = `${percentage}%`;
  $("resultBest").textContent = `${best}%`;

  const review = $("reviewList");
  review.replaceChildren();
  quizQuestions.forEach((q, index) => {
    const chosen = selectedAnswers[index];
    const isCorrect = chosen === q.answer;
    const item = document.createElement("article");
    item.className = `review-item ${isCorrect ? "correct" : "incorrect"}`;

    const title = document.createElement("div");
    title.className = "review-question";
    title.textContent = `${index + 1}. ${q.question}`;
    item.appendChild(title);

    const yourAnswer = document.createElement("p");
    yourAnswer.textContent = `Your answer: ${chosen === null ? "Not answered" : q.options[chosen]}${chosen === null ? "" : isCorrect ? " ✓" : " ✗"}`;
    item.appendChild(yourAnswer);

    const correctAnswer = document.createElement("p");
    correctAnswer.textContent = `Correct answer: ${q.options[q.answer]}`;
    item.appendChild(correctAnswer);
    review.appendChild(item);
  });
}

function restartQuiz() {
  startQuiz();
}

function anotherCategory() {
  clearInterval(timerInterval);
  quizFinished = true;
  $("quizScreen").hidden = true;
  $("resultScreen").hidden = true;
  $("startScreen").hidden = false;
  $("startHint").textContent = "Choose a category to start another quiz.";
  updateBestScoreLabels();
}

$("startBtn").addEventListener("click", startQuiz);
$("prevBtn").addEventListener("click", previousQuestion);
$("nextBtn").addEventListener("click", nextQuestion);
$("submitBtn").addEventListener("click", () => submitQuiz(false));
$("restartBtn").addEventListener("click", restartQuiz);
$("anotherCategoryBtn").addEventListener("click", anotherCategory);
$("categorySelect").addEventListener("change", updateBestScoreLabels);

updateBestScoreLabels();
