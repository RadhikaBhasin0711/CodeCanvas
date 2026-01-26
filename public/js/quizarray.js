// quizarray.js - Array Practice Quiz

const questions = [
    {
        question: "Which of the following parenthesis are used while initialization of array?",
        answers: [
            { text: "[]", correct: true },
            { text: "{}", correct: false },
            { text: "()", correct: false },
            { text: "none", correct: false }
        ]
    },
    {
        question: "Which of the following is valid for declaration of float type array of 10 elements?",
        answers: [
            { text: "float arr[10];", correct: true },
            { text: "float arr(10);", correct: false },
            { text: "float arr{10};", correct: false },
            { text: "float arr<10>;", correct: false }
        ]
    },
    {
        question: "Array index starts with",
        answers: [
            { text: "0", correct: true },
            { text: "1", correct: false },
            { text: "2", correct: false },
            { text: "4", correct: false }
        ]
    },
    {
        question: "Objects in a sequence that have the same type, is called",
        answers: [
            { text: "Functions", correct: false },
            { text: "Operators", correct: false },
            { text: "Arrays", correct: true },
            { text: "Stacks", correct: false }
        ]
    }
];

const quizSection = document.getElementById("quiz-section");
const scoreSection = document.getElementById("score-section");
const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");
const scoreText = document.getElementById("score-text");
const totalQuestionsText = document.getElementById("total-questions");

let currentQuestionIndex = 0;
let score = 0;

// Start quiz
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerHTML = "Next";
    quizSection.style.display = "block";
    scoreSection.style.display = "none";
    showQuestion();
}

// Show current question
function showQuestion() {
    resetState();
    
    const currentQuestion = questions[currentQuestionIndex];
    const questionNo = currentQuestionIndex + 1;
    questionElement.innerHTML = `${questionNo}. ${currentQuestion.question}`;

    currentQuestion.answers.forEach(answer => {
        const button = document.createElement("button");
        button.innerHTML = answer.text;
        button.classList.add("option-btn");
        answerButtons.appendChild(button);
        
        if (answer.correct) {
            button.dataset.correct = "true";
        }
        
        button.addEventListener("click", selectAnswer);
    });
}

// Reset before new question
function resetState() {
    nextButton.style.display = "none";
    while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
}

// Answer selection
function selectAnswer(e) {
    const selectedBtn = e.target;
    const isCorrect = selectedBtn.dataset.correct === "true";

    if (isCorrect) {
        selectedBtn.classList.add("correct");
        score++;
    } else {
        selectedBtn.classList.add("incorrect");
    }

    Array.from(answerButtons.children).forEach(button => {
        if (button.dataset.correct === "true") {
            button.classList.add("correct");
        }
        button.disabled = true;
    });

    nextButton.style.display = "block";
}

// Show score screen
function showScore() {
    quizSection.style.display = "none";
    scoreSection.style.display = "block";
    
    scoreText.innerHTML = score;
    totalQuestionsText.innerHTML = questions.length;
}

// Next / Play Again handler
function handleNextButton() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showScore();
    }
}

// Event listeners
nextButton.addEventListener("click", () => {
    if (currentQuestionIndex < questions.length) {
        handleNextButton();
    } else {
        startQuiz(); // Play Again
    }
});

// Back to Topics
document.getElementById("back-btn").addEventListener("click", () => {
    window.location.href = "/practice"; // Change if your topics page is different
});

// Play Again button (optional second listener if needed)
document.getElementById("play-again-btn").addEventListener("click", startQuiz);

// Start quiz on load
startQuiz();