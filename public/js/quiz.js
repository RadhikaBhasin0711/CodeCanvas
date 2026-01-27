// public/quiz.js - Client-side Quiz with debug logs

console.log("quiz.js loaded successfully");

const topic = window.location.pathname.split('/').pop(); // e.g., 'array'
console.log("Current topic:", topic);

let questions = [];
let currentQuestionIndex = 0;
let score = 0;

const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");
const quizSection = document.getElementById("quiz-section");
const scoreSection = document.getElementById("score-section");
const scoreMessage = document.getElementById("score-message");

if (!nextButton) console.error("next-btn not found in HTML");
if (!scoreSection) console.error("score-section not found in HTML");

// Fetch fresh questions from server
async function fetchQuestions() {
    console.log("fetchQuestions() called");
    try {
        questionElement.innerHTML = "Loading fresh questions...";
        const response = await fetch(`/api/questions/${topic}`);
        console.log("Fetch response status:", response.status);

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        questions = await response.json();
        console.log("Questions loaded:", questions.length, "questions");

        if (questions.length === 0) {
            questionElement.innerHTML = 'No questions available.';
            return;
        }

        startQuiz();
    } catch (error) {
        console.error('Fetch error:', error);
        questionElement.innerHTML = 'Failed to load fresh questions. Check console.';
    }
}

// Start or restart quiz
function startQuiz() {
    console.log("startQuiz() called");
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerHTML = "Next Question";
    nextButton.style.display = "block";

    // Show quiz, hide score
    quizSection.style.display = "block";
    scoreSection.style.display = "none";

    showQuestion();
}

// Show current question
function showQuestion() {
    console.log("showQuestion() called - index:", currentQuestionIndex);
    resetState();

    const currentQuestion = questions[currentQuestionIndex];
    questionElement.innerHTML = `${currentQuestionIndex + 1}. ${currentQuestion.question}`;

    currentQuestion.options.forEach((opt, i) => {
        const button = document.createElement("button");
        button.innerHTML = opt;
        button.classList.add("option-btn");
        button.dataset.correct = String.fromCharCode(65 + i) === currentQuestion.correct ? "true" : "false";
        answerButtons.appendChild(button);
        button.addEventListener("click", selectAnswer);
    });
}

// Reset answer buttons
function resetState() {
    nextButton.style.display = "none";
    while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
}

// Handle answer selection
function selectAnswer(e) {
    console.log("Answer selected");
    const selectedBtn = e.target;
    const isCorrect = selectedBtn.dataset.correct === "true";

    if (isCorrect) score++;

    selectedBtn.classList.add(isCorrect ? "correct" : "incorrect");

    Array.from(answerButtons.children).forEach(button => {
        if (button.dataset.correct === "true") {
            button.classList.add("correct");
        }
        button.disabled = true;
    });

    nextButton.style.display = "block";
}

// Show final score
function showScore() {
    console.log("showScore() called - final score:", score);
    resetState();

    const total = questions.length;
    scoreMessage.innerHTML = `You scored <strong>${score}</strong> out of <strong>${total}</strong>`;

    nextButton.innerHTML = "Play Again";
    nextButton.style.display = "block";

    quizSection.style.display = "none";
    scoreSection.style.display = "block";
}

// Next / Play Again logic
nextButton.addEventListener("click", () => {
    console.log("Next/Play Again clicked - current index:", currentQuestionIndex, "total:", questions.length);

    if (currentQuestionIndex < questions.length - 1) {
        // Next question during quiz
        currentQuestionIndex++;
        showQuestion();
    } else if (currentQuestionIndex === questions.length - 1) {
        // Last question answered → show score
        showScore();
    } else {
        // "Play Again" clicked → fetch fresh questions
        console.log("Play Again clicked - fetching new questions");
        fetchQuestions();
    }
});

// Back to Topics
document.getElementById("back-to-topics-btn").addEventListener("click", () => {
    console.log("Back to Topics clicked");
    window.location.href = "/practice"; // Change to your topics page if different
});

// Load initial questions
console.log("Initial fetch starting...");
fetchQuestions();