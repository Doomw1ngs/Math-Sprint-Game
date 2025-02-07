// Pages
const gamePage = document.getElementById('game-page');
const scorePage = document.getElementById('score-page');
const splashPage = document.getElementById('splash-page');
const countdownPage = document.getElementById('countdown-page');
// Splash Page
const startForm = document.getElementById('start-form');
const radioContainers = document.querySelectorAll('.radio-container');
const radioInputs = document.querySelectorAll('input');
const bestScores = document.querySelectorAll('.best-score-value');
// Countdown Page
const countdown = document.querySelector('.countdown');
// Game Page
const itemContainer = document.querySelector('.item-container');
// Score Page
const finalTimeEl = document.querySelector('.final-time');
const baseTimeEl = document.querySelector('.base-time');
const penaltyTimeEl = document.querySelector('.penalty-time');
const playAgainBtn = document.querySelector('.play-again');

// Equations
let questionAmount = 0;
let equationsArray = [];
let playerGuessArray = [];
let bestScoresArray = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = '0.0';

// Scroll
let valueY = 0;

// Refresh splash page best scores.
const bestScoresToDOM = () => {
  bestScores.forEach((score, index) => {
    score.textContent = `${bestScoresArray[index].bestScore}s`;
  });
};

// Check localStorage for best scores, set bestScoresArray.
const getSavedBestScores = () => {
  if (localStorage.getItem('bestScores')) {
    bestScoresArray = JSON.parse(localStorage.bestScores);
  } else {
    bestScoresArray = [
      { questions: 10, bestScore: finalTimeDisplay },
      { questions: 25, bestScore: finalTimeDisplay },
      { questions: 50, bestScore: finalTimeDisplay },
      { questions: 99, bestScore: finalTimeDisplay },
    ];
    localStorage.setItem('bestScores', JSON.stringify(bestScoresArray));
  }
  bestScoresToDOM();
};

// Update best score.
const updateBestScoreArray = () => {
  bestScoresArray.forEach((score) => {
    // Select correct best score to update.
    if (questionAmount == score.questions) {
      // Return best score as number with one decimal.
      const savedBestScore = Number(score.bestScore);
      // Update if the new final score is less or replacing zero (0).
      if (savedBestScore === 0 || savedBestScore > finalTime) {
        score.bestScore = finalTimeDisplay;
      }
    }
  });
  // Update splash page.
  bestScoresToDOM();
  // Save to localeStorage
  localStorage.setItem('bestScores', JSON.stringify(bestScoresArray));
};

// Reset the game.
const playAgain = () => {
  gamePage.addEventListener('click', startTimer);
  scorePage.hidden = true;
  splashPage.hidden = false;
  equationsArray = [];
  playerGuessArray = [];
  valueY = 0;
  playAgainBtn.hidden = true;
  location.reload();
};

// Show score page.
const showScorePage = () => {
  // Show Play Again button after 1 second.
  setTimeout(() => {
    playAgainBtn.hidden = false;
  }, 1000);
  gamePage.hidden = true;
  scorePage.hidden = false;
};

// Format & display time in DOM
const scoresToDOM = () => {
  finalTimeDisplay = finalTime.toFixed(1);
  baseTime = timePlayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);
  baseTimeEl.textContent = `Base Time: ${baseTime}s`;
  penaltyTimeEl.textContent = `Penalty: +${penaltyTime}s`;
  finalTimeEl.textContent = `${finalTimeDisplay}s`;
  updateBestScoreArray();
  // Scroll to top, go to score page
  itemContainer.scrollTo({ top: 0, behavior: 'instant' });
  showScorePage();
};

// Stop timer, Process results, go to score page.
const checkTime = () => {
  if (playerGuessArray.length == questionAmount) {
    clearInterval(timer);
    // Check for wrong guesses, add penalty time.
    equationsArray.forEach((equation, index) => {
      if (equation.evaluated === playerGuessArray[index]) {
        // Correct Guess, No penalty.
      } else {
        // Incorrect guess, add penalty.
        penaltyTime += 0.5;
      }
    });
    finalTime = timePlayed + penaltyTime;
    scoresToDOM();
  }
};

// Add a tenth of a second to timePlayed.
const addTime = () => {
  timePlayed += 0.1;
  checkTime();
};

// Start timer when game page is clicked.
const startTimer = () => {
  // Reset times.
  let timePlayed = 0;
  let penaltyTime = 0;
  let finalTime = 0;
  timer = setInterval(addTime, 100);
  gamePage.removeEventListener('click', startTimer);
};

// Scroll, Store user selection in PlayerGuessArray.
const select = (choice) => {
  // Scroll 80 pixels.
  valueY += 80;
  itemContainer.scroll(0, valueY);
  // Add player guess to array
  return choice
    ? playerGuessArray.push('true')
    : playerGuessArray.push('false');
};

// Displays game page
const showGamePage = () => {
  gamePage.hidden = false;
  countdownPage.hidden = true;
};

// Get random number up to a max number
const getRandomInt = (max) => Math.floor(Math.random() * Math.floor(max));

// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations = getRandomInt(questionAmount);
  // Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations;
  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: 'true' };
    equationsArray.push(equationObject);
  }
  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    const formatChoice = getRandomInt(3);
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: 'false' };
    equationsArray.push(equationObject);
  }
  shuffle(equationsArray);
}

// Add equations to DOM
const equationsToDOM = () => {
  equationsArray.forEach((equation) => {
    // Item.
    const item = document.createElement('div');
    item.classList.add('item');
    // Equation text.
    const equationText = document.createElement('h1');
    equationText.textContent = equation.value;
    // Append
    item.appendChild(equationText);
    itemContainer.appendChild(item);
  });
};

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = '';
  // Spacer
  const topSpacer = document.createElement('div');
  topSpacer.classList.add('height-240');
  // Selected Item
  const selectedItem = document.createElement('div');
  selectedItem.classList.add('selected-item');
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM
  createEquations();
  equationsToDOM();
  // Set Blank Space Below
  const bottomSpacer = document.createElement('div');
  bottomSpacer.classList.add('height-500');
  itemContainer.appendChild(bottomSpacer);
}

// Displays 3, 2, 1 go
const countdownStart = () => {
  let count = 3;
  const intervalId = setInterval(() => {
    countdown.textContent = count;
    if (count === 0) {
      countdown.textContent = 'GO!!!';
      clearInterval(intervalId);
    }
    count--;
  }, 1000);
};

// Navigate from Splash page to Countdown page.
const showCountDown = () => {
  countdownPage.hidden = false;
  splashPage.hidden = true;
  countdownStart();
  populateGamePage();
  setTimeout(showGamePage, 5000);
};

// Get the value from selected radio button.
const getRadioValue = () => {
  let radioValue;
  radioInputs.forEach((radioInput) => {
    if (radioInput.checked) {
      radioValue = radioInput.value;
    }
    return;
  });
  return radioValue;
};

// Form that decides amount of questions
const selectQuestionAmount = (e) => {
  e.preventDefault();
  questionAmount = getRadioValue();
  if (questionAmount) {
    showCountDown();
  }
};

// reset the question's page
const cleanWhite = () => {
  radioContainers.forEach((element) => {
    // Remove selected label styling
    element.classList.remove('selected-label');
    // Add it back if radio input is checked
    if (element.children[1].checked) {
      element.classList.add('selected-label');
    }
  });
};

// We add the styling on the question when select one
startForm.addEventListener('click', cleanWhite);

// Event Listeners
startForm.addEventListener('submit', selectQuestionAmount);
gamePage.addEventListener('click', startTimer);

// On Load
getSavedBestScores();
