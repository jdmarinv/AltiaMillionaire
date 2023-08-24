

const fadeInAnswers = () => {
  let answersList = document.querySelectorAll(".answers li");
  answersList.forEach((answer, index) => {
    setTimeout(() => {
      answer.style.opacity = "1";
    }, index * 2000); // 2-second interval
  });
};
const currentTeamSelector = document.getElementById("current-team");
const currentTeamNameDiv = document.getElementById("current-team-name");
let currentTeam = "team1"; // Default team
let score_multiplier = 100; // Define score multiplier
let scores = { team1: 0 }; // Define scores for teams

currentTeamSelector.addEventListener("change", (e) => {
  currentTeam = e.target.value;
  currentTeamNameDiv.textContent = e.target.selectedOptions[0].text + " is playing";
  currentTeamSelector.classList.add("hidden");
  currentTeamNameDiv.classList.remove("hidden");
});

// Variable declarations
const URL = "https://raw.githubusercontent.com/aaronnech/Who-Wants-to-Be-a-Millionaire/master/questions.json";
const gameContainer = document.querySelector(".game-container");
const startBtn = document.querySelector(".start");
const questionContainer = document.querySelector(".question-container");
const answersContainer = document.querySelector(".answers");
const nextQuestionBtn = document.querySelector(".next-question");
const secondGuessBtn = document.querySelector(".second-guess-button");
const fiftyFiftyBtn = document.querySelector(".fifty-fifty");
const countDownClock = document.querySelector(".timer");
const gameStatusContainer = document.querySelector(".game-status-container");
const nextQuestionContainer = document.querySelector(".next-question-container");
const pointsContainer = document.querySelector(".points-container");

// Selecting audio files
const letsPlayAudio = document.getElementById("lets-play");
const easyAudio = document.getElementById("easy");
const wrongAnswerAudio = document.getElementById("wrong-answer");
const correctAnswerAudio = document.getElementById("correct-answer");

let gameOn = false;
let timesToGuess = 1;
let correctAnswer;
let questionList;
let listOfAnswers;
let currentTime;
let data;
let currentQuestion = {};
let randomGameNum = 0;
let randomQuestionNum = 0;
let questionsAsked = [];
let timeoutId;
let intervalId;
let points = 0;

const randomNumHelperFunc = (num) => Math.floor(Math.random() * num);
const dataLoad = async () => {
  data = await fetch(URL).then(res => res.json());
};
const randomQuestionGenerator = () => {
  randomGameNum = randomNumHelperFunc(4);
  randomQuestionNum = randomNumHelperFunc(15);

  if (questionsAsked.findIndex(item => item[randomGameNum] === randomQuestionNum) === -1) {
    currentQuestion[randomGameNum] = randomQuestionNum;
    questionsAsked.push(currentQuestion);
    currentQuestion = {};
  } else {
    randomQuestionGenerator();
  }
};
const fiftyFiftyGenerator = num => {
  let randomFirst;
  let randomSecond;
  randomFirst = randomNumHelperFunc(4);
  while (randomFirst === num) {
    randomFirst = randomNumHelperFunc(4);
  }

  randomSecond = randomNumHelperFunc(4);
  while (randomSecond === randomFirst || randomSecond === num) {
    randomSecond = randomNumHelperFunc(4);
  }
  document.querySelector(`[id='${randomFirst}']`).style.visibility = "hidden";
  document.querySelector(`[id='${randomSecond}']`).style.visibility = "hidden";
};
const startTimerMusic = () => {
  timer();
  letsPlayAudio.play();
  letsPlayAudio.volume = 0.3;
  timeoutId = setTimeout(() => {
    easyAudio.play();
    easyAudio.volume = 0.3;
  }, 4000);
};
const stopTimerMusic = () => {
  clearTimeout(timeoutId);
  clearInterval(intervalId);
  letsPlayAudio.pause();
  letsPlayAudio.currentTime = 0;
  easyAudio.pause();
  easyAudio.currentTime = 0;
  wrongAnswerAudio.pause();
  wrongAnswerAudio.currentTime = 0;
  correctAnswerAudio.pause();
  correctAnswerAudio.currentTime = 0;
};

const resetPoints = () => {
  points = 0;
  score_multiplier = 100;
  // Resetting scores for all teams
  scores = { team1: 0, team2: 0, team3: 0 };
  document.getElementById("team1-score").textContent = "0";
  document.getElementById("team2-score").textContent = "0";
  document.getElementById("team3-score").textContent = "0";
};

const gameOver = () => {
  if (timesToGuess === 0) {
    stopTimerMusic();
    wrongAnswerAudio.play();
    wrongAnswerAudio.volume = 0.3;
    gameContainer.classList.add("hidden");
    gameStatusContainer.classList.remove("hidden");
    gameStatusContainer.textContent = `Game over. You answered incorrectly.`;
    startBtn.textContent = "START";
    pointsContainer.classList.add("hidden");
  }
};


const correctAnswerFunc = () => {
  points += score_multiplier;
  score_multiplier *= 2;
  scores[currentTeam] += points;
  document.getElementById(`${currentTeam}-score`).textContent = scores[currentTeam];

  if (questionsAsked.length < 12) {
    stopTimerMusic();
    correctAnswerAudio.play();
    correctAnswerAudio.volume = 0.3;
    nextQuestionFunc();
    secondGuessBtn.classList.remove("hidden");
    fiftyFiftyBtn.classList.remove("hidden");
  } else {
    stopTimerMusic();
    correctAnswerAudio.play();
    correctAnswerAudio.volume = 0.3;
    gameStatusContainer.classList.remove("hidden");
    gameContainer.classList.add("hidden");
    gameStatusContainer.textContent = "CONGRATULATIONS! You've become a Millionaire!";
    pointsContainer.textContent = `${points} / 12`;
  }
};

const nextQuestionFunc = () => {
  nextQuestionContainer.classList.add("hidden");
  stopTimerMusic();
  gameOn = true;
  gameContainer.classList.remove("hidden");
  gameStatusContainer.classList.add("hidden");
  startBtn.textContent = "QUIT";
  timesToGuess = 1;

  let answers = "";
  randomQuestionGenerator();
  startTimerMusic();

  correctAnswer = "";
  correctAnswer = data["games"][randomGameNum]["questions"][randomQuestionNum]["correct"];
  questionList = data["games"][randomGameNum]["questions"][randomQuestionNum]["content"];

  questionList.forEach((item, index) => {
    answers += `<li id="${index}">${item}</li>`;
  });

  questionContainer.textContent = data["games"][randomGameNum]["questions"][randomQuestionNum]["question"];
  answersContainer.innerHTML = answers; fadeInAnswers();
};

const timer = () => {
  currentTime = new Date().getTime();
  intervalId = setInterval(() => {
    const interval = Math.floor((40000 + currentTime - new Date().getTime()) / 1000);
    countDownClock.textContent = interval;
    if (interval === 0) {
      gameOver();
    }
    return interval;
  }, 100);
};

window.addEventListener("load", async () => {
  await dataLoad();
});

const resetGame = () => {
  points = 0;
  score_multiplier = 100;
  currentTeamSelector.disabled = gameOn;
};

startBtn.addEventListener("click", () => {
  if (!gameOn) {
    stopTimerMusic();
    resetPoints();
    secondGuessBtn.classList.remove("hidden");
    fiftyFiftyBtn.classList.remove("hidden");
    nextQuestionFunc();
    pointsContainer.classList.remove("hidden");
  } else {
    resetPoints();
    stopTimerMusic();
    gameOver();
    pointsContainer.classList.add("hidden");
  }
});

nextQuestionBtn.addEventListener("click", () => nextQuestionFunc());

const nextTeamBtn = document.querySelector(".next-question");

nextQuestionBtn.addEventListener("click", () => {
  if (!gameOn) {
    stopTimerMusic();
    resetPoints();
    secondGuessBtn.classList.remove("hidden");
    fiftyFiftyBtn.classList.remove("hidden");
    nextQuestionFunc();
    pointsContainer.classList.remove("hidden");
  } else {
    resetPoints();
    stopTimerMusic();
    gameOver();
    pointsContainer.classList.add("hidden");
    nextTeamBtn.classList.remove("hidden");
    nextTeamBtn.addEventListener("click", () => {
      currentTeam = Object.keys(scores)[currentTeam === "team1" ? 1 : 0];
      currentTeamNameDiv.textContent = `${currentTeam} is playing`;
      nextQuestionBtn.classList.add("hidden");
      secondGuessBtn.classList.add("hidden");
      fiftyFiftyBtn.classList.add("hidden");
      nextQuestionFunc();
    });
  }
});


secondGuessBtn.addEventListener("click", () => {
  timesToGuess = 2;
  secondGuessBtn.classList.add("hidden");
});
fiftyFiftyBtn.addEventListener("click", () => {
  fiftyFiftyGenerator(correctAnswer);
  fiftyFiftyBtn.classList.add("hidden");
});
answersContainer.addEventListener("click", e => {
  if (e.target.id == correctAnswer) {
    e.target.classList.add("hidden");
    correctAnswerFunc();
  } else {
    e.target.classList.add("hidden");
    timesToGuess -= 1;
    if (timesToGuess <= 0) {
      stopTimerMusic();
      gameOver();
    }
  }
});
