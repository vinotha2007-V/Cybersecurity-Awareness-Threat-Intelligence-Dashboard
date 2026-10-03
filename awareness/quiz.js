
"use strict";

const QUESTIONS_URL = "./quiz_questions.json";

let questions = [];
let currentIndex = 0;
let answers = {};

const $ = (id) => document.getElementById(id);

async function initializeQuiz() {
    try {
        const response = await fetch(QUESTIONS_URL);

        if (!response.ok) {
            throw new Error(`Could not load questions: HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error("The question file is empty or invalid.");
        }

        questions = data;

        const valid = questions.every((q) =>
            Number.isInteger(q.id) &&
            typeof q.question === "string" &&
            Array.isArray(q.options) &&
            q.options.length >= 2 &&
            Number.isInteger(q.answer) &&
            q.answer >= 0 &&
            q.answer < q.options.length &&
            typeof q.explanation === "string"
        );

        if (!valid) {
            throw new Error("One or more quiz questions have an invalid format.");
        }

        $("totalQuestions").textContent = questions.length;
        $("finalTotal").textContent = questions.length;

        buildQuestionGrid();
        renderQuestion();
        updateStats();
    } catch (error) {
        console.error("Quiz initialization failed:", error);
        $("questionText").textContent =
            "Quiz questions could not be loaded.";
        $("optionsContainer").replaceChildren();

        const feedback = $("feedback");
        feedback.hidden = false;
        feedback.textContent =
            "Check that quiz_questions.json is in the awareness folder and open quiz.html using Live Server.";
        $("nextBtn").disabled = true;
    }
}

function buildQuestionGrid() {
    const grid = $("questionGrid");
    grid.replaceChildren();

    questions.forEach((question, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "question-number";
        button.textContent = index + 1;
        button.setAttribute("aria-label", `Go to question ${index + 1}`);

        button.addEventListener("click", () => {
            currentIndex = index;
            renderQuestion();
        });

        grid.appendChild(button);
    });
}

function renderQuestion() {
    if (!questions.length) return;

    const question = questions[currentIndex];
    const selectedAnswer = answers[currentIndex];

    $("questionCounter").textContent =
        `QUESTION ${String(currentIndex + 1).padStart(2, "0")} / ${questions.length}`;

    $("categoryPill").textContent = question.category;
    $("questionText").textContent = question.question;

    $("progressFill").style.width =
        `${((currentIndex + 1) / questions.length) * 100}%`;

    const container = $("optionsContainer");
    container.replaceChildren();

    const letters = ["A", "B", "C", "D", "E", "F"];

    question.options.forEach((optionText, optionIndex) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "option";

        const letter = document.createElement("span");
        letter.className = "option-letter";
        letter.textContent = letters[optionIndex] || String(optionIndex + 1);

        const text = document.createElement("span");
        text.textContent = optionText;

        button.append(letter, text);

        if (selectedAnswer !== undefined) {
            button.disabled = true;

            if (optionIndex === question.answer) {
                button.classList.add("correct");
            }

            if (
                optionIndex === selectedAnswer &&
                selectedAnswer !== question.answer
            ) {
                button.classList.add("wrong");
            }

            if (optionIndex === selectedAnswer) {
                button.classList.add("selected");
            }
        } else {
            button.addEventListener("click", () => selectAnswer(optionIndex));
        }

        container.appendChild(button);
    });

    renderFeedback();
    updateNavigation();
    updateQuestionGrid();
    updateStats();
}

function selectAnswer(optionIndex) {
    if (answers[currentIndex] !== undefined) return;

    answers[currentIndex] = optionIndex;

    renderQuestion();
}

function renderFeedback() {
    const feedback = $("feedback");
    const selectedAnswer = answers[currentIndex];

    if (selectedAnswer === undefined) {
        feedback.hidden = true;
        feedback.className = "feedback";
        feedback.replaceChildren();
        return;
    }

    const question = questions[currentIndex];
    const isCorrect = selectedAnswer === question.answer;

    feedback.hidden = false;
    feedback.className = isCorrect
        ? "feedback correct-feedback"
        : "feedback wrong-feedback";

    const heading = document.createElement("strong");
    heading.textContent = isCorrect
        ? "✓ Correct answer!"
        : "✕ Not quite. Review the correct answer.";

    const explanation = document.createElement("div");
    explanation.textContent = question.explanation;

    feedback.replaceChildren(heading, explanation);
}

function updateNavigation() {
    $("previousBtn").disabled = currentIndex === 0;

    const hasAnswer = answers[currentIndex] !== undefined;
    const isLast = currentIndex === questions.length - 1;

    $("nextBtn").disabled = !hasAnswer;
    $("nextBtn").textContent = isLast
        ? "View Final Result →"
        : "Next Question →";
}

function updateQuestionGrid() {
    document.querySelectorAll(".question-number").forEach((button, index) => {
        button.classList.toggle("current", index === currentIndex);
        button.classList.toggle("answered", answers[index] !== undefined);
        button.setAttribute(
            "aria-current",
            index === currentIndex ? "step" : "false"
        );
    });
}

function getScore() {
    return questions.reduce((score, question, index) => {
        return score + (answers[index] === question.answer ? 1 : 0);
    }, 0);
}

function updateStats() {
    const answeredCount = Object.keys(answers).length;
    const score = getScore();
    const percentage = answeredCount
        ? Math.round((score / answeredCount) * 100)
        : 0;

    $("answeredCount").textContent = answeredCount;
    $("currentScore").textContent = `${percentage}%`;
    $("progressPercent").textContent =
        `${Math.round((answeredCount / (questions.length || 1)) * 100)}%`;
}

function goPrevious() {
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
    }
}

function goNext() {
    if (answers[currentIndex] === undefined) return;

    if (currentIndex < questions.length - 1) {
        currentIndex++;
        renderQuestion();
        return;
    }

    showResults();
}

function showResults() {
    const correct = getScore();
    const total = questions.length;
    const wrong = total - correct;
    const percentage = Math.round((correct / total) * 100);

    $("finalPercentage").textContent = `${percentage}%`;
    $("correctAnswers").textContent = correct;
    $("wrongAnswers").textContent = wrong;
    $("finalTotal").textContent = total;

    let heading;
    let description;

    if (percentage >= 85) {
        heading = "Excellent awareness!";
        description =
            "You demonstrated strong knowledge of these cybersecurity awareness topics. Continue practising and keep your security knowledge up to date.";
    } else if (percentage >= 60) {
        heading = "Good progress!";
        description =
            "You understand several key security practices. Review the questions you missed to strengthen your awareness.";
    } else {
        heading = "Keep learning!";
        description =
            "Cybersecurity awareness improves with practice. Review the explanations and retake the quiz to check your progress.";
    }

    $("resultHeading").textContent = heading;
    $("resultDescription").textContent = description;

    $("quizArea").hidden = true;
    $("resultArea").hidden = false;

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function restartQuiz() {
    currentIndex = 0;
    answers = {};

    $("resultArea").hidden = true;
    $("quizArea").hidden = false;

    renderQuestion();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

$("previousBtn").addEventListener("click", goPrevious);
$("nextBtn").addEventListener("click", goNext);
$("retryBtn").addEventListener("click", restartQuiz);

initializeQuiz();