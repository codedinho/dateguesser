const eventDescription = document.querySelector('.event-description');
const yearDigits = document.querySelectorAll('.year-digit');
const numberButtons = document.querySelectorAll('.number-button');
const submitButton = document.getElementById('submitGuess');
const feedback = document.querySelector('.feedback');
const nextButton = document.querySelector('.next-button');
const backspaceButton = document.getElementById('backspaceButton');

let isGameActive = false;
let eventDataList = [];
let previousEventId = null;
let selectedYear = '';
let gameMode = 'Survival'; // Set the initial game mode to 'Survival'
let totalRating = 0;
let totalQuestions = 0; // Total number of questions in the game
let currentQuestion = '';
let totalHealth = 250; // Total score for the game
let totalRound = 1; //Total rounds for the game
let highestScore = 1;
let comboValue = 0;
let correctQuestions = 0;
let comboMultiplier = 1.25; // Initial combo multiplier
let allEventData = []; // Store all event data without filtering
const comboMultiplierincrement = 0.2;

yearDigits.forEach(digit => {
  digit.addEventListener('touchend', () => {
    digit.style.transform = 'scale(1)';
  });
});

// Initialize default game state
const defaultGameState = {
  totalRound: 1,
  totalHealth: 250,
  comboValue: 0,
  correctQuestions: 0,
  totalQuestions: 0,
  gameMode: 'Survival',
  isGameActive: false,
  previousEventId: null, // Add previousEventId to default game state
};

// Retrieve the saved game state from local storage
let savedGameState = JSON.parse(localStorage.getItem('gameState'));

// Check if there's no saved game state or it matches the default
if (!savedGameState || isDefaultGameState(savedGameState)) {
  savedGameState = defaultGameState;
  localStorage.setItem('gameState', JSON.stringify(savedGameState));
}

// Restore the game mode from the saved game state
gameMode = savedGameState.gameMode;

// Function to check if the saved game state matches the default game state
function isDefaultGameState(state) {
  return (
    state.totalRound === defaultGameState.totalRound &&
    state.totalHealth === defaultGameState.totalHealth &&
    state.comboValue === defaultGameState.comboValue &&
    state.correctQuestions === defaultGameState.correctQuestions &&
    state.totalQuestions === defaultGameState.totalQuestions &&
    state.gameMode === defaultGameState.gameMode
  );
}

// Update the game state in local storage
localStorage.setItem('gameState', JSON.stringify(savedGameState));

// Add this code inside the "load" event listener
window.addEventListener('load', () => {
  // Call the function to restore saved game state
  restoreValuesGameState();
  // Update the score display based on the restored game state
  updateScoreDisplay();

  // Retrieve the highest score from local storage
  const savedHighestScore = localStorage.getItem('highestScore');
  if (savedHighestScore) {
    highestScore = parseInt(savedHighestScore);
  }

  // Display the highest score in the "topScore" div
  const topScoreElement = document.getElementById('topScore');
  topScoreElement.textContent = `Highest Round: ${highestScore}`; 
});

// Function to restore values from the saved game state
function restoreValuesGameState() {
  // Restore values from the saved game state
  totalRound = savedGameState.totalRound;
  totalHealth = savedGameState.totalHealth;
  comboValue = savedGameState.comboValue;
  correctQuestions = savedGameState.correctQuestions;
  totalQuestions = savedGameState.totalQuestions;
  isGameActive = savedGameState.isGameActive; // Restore isGameActive
}


restoreValuesGameState();
// Update the score display
updateScoreDisplay();


// Fetch the list of historical events from dates.json
async function fetchEventData() {
  try {
    const response = await fetch('./assets/json/dates.json');
    eventDataList = await response.json();
  } catch (error) {
    console.error('Error fetching event data:', error);
  }
}

function updateRoundDisplay(round) {
  const roundValueElement = document.querySelector('.round-value');
  roundValueElement.textContent = round;
}

function updateTotalRatingDisplay(totalRating) {
  const totalHealthValueElement = document.querySelector('.total-health-value');
  totalHealthValueElement.textContent = totalRating;
}

function updateComboValueDisplay(comboValue) {
  const comboValueElement = document.querySelector('.combo-value');
  comboValueElement.textContent = comboValue;
}

function updateBoxColors(correctYear) {
  for (let i = 0; i < 4; i++) {
    if (selectedYear[i] === correctYear[i]) {
      yearDigits[i].style.backgroundColor = '#86dc3d'; // Green for correct digit
    } else {
      yearDigits[i].style.backgroundColor = '#ff6666'; // Red for incorrect digit
    }
  }
}

function populateYearDigits(number) {
  if (selectedYear.length < 4) {
    selectedYear += number;
    updateYearDisplay();
    updateBoxOutlines(); // Update the box outlines

    const digitIndex = selectedYear.length - 1;
    const yearDigitElement = document.querySelector(`.year-digit-${digitIndex + 1}`);

    if (yearDigitElement) {
      yearDigitElement.style.backgroundImage = `url('./assets/number-icons/${number}.png')`;
      yearDigitElement.style.backgroundColor = 'transparent';
    }
  }
}

function clearYearDigits() {
  selectedYear = '';
  updateYearDisplay(); // Update the displayed input
  updateBoxOutlines(); // Update the box outlines
}


// Fetch the list of historical events from dates.json
async function fetchAllEventData() {
  try {
    const response = await fetch('./assets/json/dates.json');
    allEventData = await response.json();
  } catch (error) {
    console.error('Error fetching event data:', error);
  }
}

// Call fetchAllEventData at the beginning to populate allEventData
fetchAllEventData();

//show the submit, backspace and clear guess buttons
function showSubmitClearButtons() {
  submitButton.style.display = 'inline-block';
  clearButton.style.display = 'inline-block';
  backspaceButton.style.display = 'inline-block';
}
//hide the submit, backspace and clear guess buttons
function hideSubmitClearButtons() {
  submitButton.style.display = 'none';
  clearButton.style.display = 'none';
  backspaceButton.style.display = 'none';
}

const eventTypeButtons = document.querySelectorAll('.event-type-button');
const warningPopup = document.getElementById('warningPopup');

// Create a variable to track whether the warning popup is shown
let isWarningPopupShown = false;
let selectedEventTypeBeforeWarning = null; // Store the selected event type before showing the warning

// Function to enable or disable event listeners for changing the tab
function toggleTabChangeListeners(enable) {
  eventTypeButtons.forEach(button => {
    if (enable) {
      button.addEventListener('click', tabChangeHandler);
    } else {
      button.removeEventListener('click', tabChangeHandler);
    }
  });
}

// Event handler for changing the tab
function tabChangeHandler() {
  const selectedEventType = this.getAttribute('data-event-type');

  // Store the selected event type before showing the warning
  selectedEventTypeBeforeWarning = selectedEventType;

  // Check if the game mode is not "Freeplay"
  if (gameMode !== 'Freeplay') {
    // Show the warning popup
    showWarningPopup();
  } else {
    // If in "Freeplay" mode, directly change the tab
    comboValue = 0;
    totalRound = 1;
    filterEvents(selectedEventType);
  }
}

// Event listeners for each button (initial setup)
toggleTabChangeListeners(true);

// Handle confirm button click in the warning popup
const confirmButton = warningPopup.querySelector('#confirmButton');
confirmButton.addEventListener('click', () => {
  // Use the stored selected event type
  const selectedEventType = selectedEventTypeBeforeWarning;

  // If the user confirms, reset combo and round values
  comboValue = 0;
  totalRound = 1;
  filterEvents(selectedEventType);

  // Hide the warning popup
  hideWarningPopup();

  // Re-enable tab change listeners
  toggleTabChangeListeners(true);
});

// Handle cancel button click in the warning popup
const cancelButton = warningPopup.querySelector('#cancelButton');
cancelButton.addEventListener('click', () => {
  // Hide the warning popup
  hideWarningPopup();

  // Re-enable tab change listeners
  toggleTabChangeListeners(true);
});

// Event listener to show the warning popup when changing the tab
eventTypeButtons.forEach(button => {
  button.addEventListener('click', tabChangeHandler);
});



function setLocalStorage() {
  const gameState = {
    totalRound,
    totalHealth,
    comboValue,
    correctQuestions,
    totalQuestions,
    highestScore // Add the highest score property here
  };
  localStorage.setItem('gameState', JSON.stringify(gameState));
}



function filterEvents(selectedEventType) {
  // Remove the "active" class from all event type buttons
  eventTypeButtons.forEach(button => {
    button.classList.remove('active');
  });

  // Add the "active" class to the clicked button
  const clickedButton = document.querySelector(`[data-event-type="${selectedEventType}"]`);
  clickedButton.classList.add('active');

  const filteredEvents = eventDataList.filter(event => {
    return selectedEventType === 'all' || event.eventType === selectedEventType;
  });

  // Update the eventDataList to hold only the filtered events
  eventDataList = filteredEvents;

  // Start a new event with the filtered data
  startNewGame();
  
}
//update score display for Round, Health, Combo
function updateScoreDisplay() {
  const roundValueElement = document.querySelector('.round-value');
  const healthValueElement = document.querySelector('.total-health-value');
  const comboValueElement = document.querySelector('.combo-value');

  roundValueElement.textContent = totalRound; // Update the round value
  healthValueElement.textContent = Math.round(totalHealth); // Update the rating value
  comboValueElement.textContent = comboValue; // Update the combo value
}

// Save the game state including the previousEventId
const gameStateToSave = {
  totalRound: totalRound,
  totalHealth: totalHealth,
  comboValue: comboValue,
  correctQuestions: correctQuestions,
  totalQuestions: totalQuestions,
  previousEventId: previousEventId, // Save the previous event ID
};

localStorage.setItem('gameState', JSON.stringify(gameStateToSave));

function updateTotalHealthDisplay(totalHealth) {
  const totalHealthValueElement = document.querySelector('.total-health-value');
  totalHealthValueElement.textContent = totalHealth;

  const startingHealth = 250; // Set the starting health score
  const twentyPercentOfStartingHealth = 0.2 * startingHealth;

  // Check if total health is less than or equal to 20% of the starting score
  if (totalHealth <= twentyPercentOfStartingHealth) {
      totalHealthValueElement.style.color = 'red';
  } else {
      totalHealthValueElement.style.color = 'black'; // Set it back to the default color
  }
}


function showWarningPopup() {
  warningPopup.style.display = 'block';
}

function hideWarningPopup() {
  // Display the popup
  warningPopup.style.display = 'none';
}

function updateHighScore() {
  // Display the highest score in the "topScore" div
  const topScoreElement = document.getElementById('topScore');
  if (gameMode !== 'Freeplay') {
    if (totalRound > highestScore) {
      highestScore = totalRound; // Update the highest score
      // Save the highest score in local storage
      localStorage.setItem('highestScore', highestScore);
    }
  }
  topScoreElement.textContent = `Top Score: ${highestScore}`;
}

// Function to end the game
function endGame() {
  isGameActive = false;
  resumeButton.style.display = 'none';
  // Update the correct questions, total questions, and round in the popup
  const correctQuestionsElement = document.getElementById('correctQuestions');
  correctQuestionsElement.textContent = correctQuestions;
  
  const totalQuestionsElement = document.getElementById('totalQuestions');
  totalQuestionsElement.textContent = totalQuestions;
  
  const endRoundElement = document.getElementById('endRound');
  endRoundElement.textContent = totalRound;
  
  // Delay the game over popup by 2000ms (2 seconds)
  setTimeout(() => {
      // Get the correct year from the current event
      const currentEvent = eventDataList.find(event => event.description === eventDescription.textContent);
      const correctYear = currentEvent ? new Date(currentEvent.correctDate).getFullYear().toString() : null;

      // Show the game over popup with the correct year
      showGameOverPopup(correctYear);

      // Reset game data
      totalRound = 1;
      totalHealth = 0;
      comboValue = 0;
      correctQuestions = 0;
      totalQuestions = 0;

      // Update the score display
      updateScoreDisplay();

      // Clear the selected year and feedback
      selectedYear = '';
      feedback.textContent = '';

      updateGameState();

      localStorage.setItem('gameState', JSON.stringify(savedGameState));
  }, 0);

  hideSubmitClearButtons();
}



function showActionButtons() {
  const actionButtons = document.querySelectorAll('.action-button');
  actionButtons.forEach(button => {
    button.style.display = 'inline-block';
  });
}

function hideActionButtons() {
  const actionButtons = document.querySelectorAll('.action-button');
  actionButtons.forEach(button => {
    button.style.display = 'none';
  });
}

function updateGameModeText() {
  const gamemodeText = document.querySelector('.gamemode-text');
  gamemodeText.textContent = gameMode;
}

const restartButton = document.querySelector('.restart-game-button');
const confirmRestartButton = document.getElementById('confirm-restart');
const cancelRestartButton = document.getElementById('cancel-restart');
const customRestart = document.getElementById('custom-restart');
const menuButton = document.querySelector('.menu-button');

// Add event listener for the "Swap Gamemode" button
menuButton.addEventListener('click', () => {
  showOverlayAndPopup(); // Show the start game popup
});

// Add event listener for the "Restart" button
restartButton.addEventListener('click', () => {
  // Show the custom Restart
  customRestart.style.display = 'block';
});

// Add event listener for the "Confirm Restart" button
confirmRestartButton.addEventListener('click', () => {
  // Hide the custom Restart
  customRestart.style.display = 'none';

  // Perform the game restart logic here
  startNewGame(); // Call your restart function here
});

// Add event listener for the "Cancel Restart" button
cancelRestartButton.addEventListener('click', () => {
  // Hide the custom modal
  customRestart.style.display = 'none';
});


// Add event listener for the "Backspace" button
backspaceButton.addEventListener('click', () => {
  // Remove the last digit from the selectedYear array
  if (selectedYear.length > 0) {
    const digitIndex = selectedYear.length - 1; // Index of the removed digit
    selectedYear = selectedYear.slice(0, -1);
    updateYearDisplay(); // Update the displayed input
    updateBoxOutlines(); // Update the box outlines

    // Get the year-digit element of the removed digit
    const yearDigitElement = document.querySelector(`.year-digit-${digitIndex + 1}`);

    if (yearDigitElement) {
      yearDigitElement.style.backgroundImage = 'url("./assets/number-icons/empty.png")';
      yearDigitElement.style.backgroundColor = 'transparent';

      // Restore the style of the cleared box
      clearLastBoxOutline(digitIndex);
    }
  }
});

// Attach the "Next" button click event listener outside of the submitGuess function
nextButton.addEventListener('click', () => {
  // Check if health is above 0
  setLocalStorage();
  rating = 0;
  updateRoundDisplay(totalRound); // Update the round value on the screen
  startNewEvent(); // Trigger a new event
  feedback.textContent = ''; // Clear the feedback text
  hideActionButtons();
  if (totalHealth > 0) {
    totalRound++; // Increment totalRound if health is above 0
    updateRoundDisplay(totalRound);
  }
  showSubmitClearButtons();
});


// Function to update the displayed year input
function updateYearDisplay() {
  for (let i = 0; i < 4; i++) {
    if (i < selectedYear.length) {
      yearDigits[i].textContent = selectedYear[i];
    } else {
      yearDigits[i].textContent = '';
    }
  }
}

function updateGameState() {
  updateHighScore();
  savedGameState.totalRound = totalRound;
  savedGameState.totalHealth = totalHealth;
  savedGameState.comboValue = comboValue;
  savedGameState.correctQuestions = correctQuestions;
  savedGameState.totalQuestions = totalQuestions;
}

function submitGuess() {
  if (!selectedYear || selectedYear.length !== 4) {
    const popup = document.querySelector('.popup-message');
    popup.textContent = 'Date incomplete';
    popup.style.opacity = 1;

    yearDigits.forEach(digitBox => {
      digitBox.classList.remove('wiggle-animation');
      void digitBox.offsetWidth;
      digitBox.classList.add('wiggle-animation');
    });

    setTimeout(() => {
      popup.style.opacity = 0;
    }, 2500);
    setLocalStorage();
    return; // Don't proceed with further logic
  } else {
    // Increase correctly value and update display
    totalQuestions++;
    
    updateRoundDisplay(totalRound);
    // Show the submit and clear buttons
    showSubmitClearButtons();

    const currentEvent = eventDataList.find(event => event.description === eventDescription.textContent);
    const correctYear = currentEvent ? new Date(currentEvent.correctDate).getFullYear().toString() : null;

    if (selectedYear !== correctYear) {
      playIncorrectSound();
    }
    
    if (selectedYear === correctYear) {
      playCorrectSound();
      feedback.innerHTML = `<span style="color: #00FF00; font-size: 30px;">Correct!</span> You guessed the year!`;

      // Increase combo value and update display
      comboValue++;

      // Increase correctly value and update display
      correctQuestions++;
      
      // Update the round display
      updateRoundDisplay(totalRound);

      // Update the Combo display
      updateComboValueDisplay(comboValue);

      // Update the combo multiplier based on the combo value
      comboMultiplier = 1.2 + (comboMultiplierincrement * comboValue);
      
      // Calculate the health increment based on the combo multiplier
      let healthIncrement = 0;

      if (gameMode === 'Survival') {
        healthIncrement = parseInt(25 * comboMultiplier); // Convert to integer
        totalHealth += healthIncrement;
        updateTotalHealthDisplay(totalHealth);

        // Show health increment element
        const healthIncrementElement = document.getElementById('healthIncrement');
        healthIncrementElement.textContent = `+${healthIncrement}`;
        healthIncrementElement.style.display = 'block';

        // Hide the health increment element after 4 seconds
        setTimeout(() => {
          healthIncrementElement.style.display = 'none';
        }, 6000);
      }

      // Update the Total Health display
      updateTotalHealthDisplay(totalHealth);

      // Update the display with new values
      updateScoreDisplay();

      // Update the totalRound and comboValue in the savedGameState
      savedGameState.comboValue = comboValue;

      // Update the game state in local storage
      localStorage.setItem('gameState', JSON.stringify(savedGameState));

    } else {

      // Convert selectedYear and correctYear to numbers using parseInt
      const selectedYearNum = parseInt(selectedYear);
      const correctYearNum = parseInt(correctYear);

      // Calculate the year difference using the converted numbers
      const yearDifference = Math.abs(selectedYearNum - correctYearNum);

      // Increase combo value and update display
      comboValue = 0;
      updateComboValueDisplay(comboValue);

      // Calculate the maximum damage that can be taken before the score becomes 0
      const maxDamage = totalHealth;

      // Deduct health based on the absolute value of the year difference, limited by maxDamage
      const healthDeduction = Math.min(Math.abs(yearDifference), maxDamage);

      // Update the totalHealth display
      updateTotalHealthDisplay(totalHealth);

      if (gameMode !== 'Freeplay') {
        totalHealth -= healthDeduction;

        updateGameState();
        
        updateScoreDisplay(comboValue)
        updateTotalHealthDisplay(totalHealth);

        // Update the game state in local storage
        localStorage.setItem('gameState', JSON.stringify(savedGameState));

        // Show health deduction element
        const healthDeductionElement = document.getElementById('healthDeduction');
        healthDeductionElement.textContent = `-${healthDeduction}`;
        healthDeductionElement.style.display = 'block';

        // Hide the health deduction element after 4 seconds
        setTimeout(() => {
          healthDeductionElement.style.display = 'none';
        }, 6000);
      
        if (totalHealth === 0) {
          updateRoundDisplay(totalRound);
          endGame();
          return; // Exit the function early to avoid further logic
        }
      }

      // Update the game state in local storage
      localStorage.setItem('gameState', JSON.stringify(savedGameState));

      // Hide the action buttons
      hideActionButtons();

      if (yearDifference <= 1) {
        feedback.innerHTML = `<span style="color: #FF0000; font-size: 30px;">Oh no!</span> You're only 1 year off! It's <span class="correct-year">${correctYear}</span>`;
      } else {
        feedback.innerHTML = `<span style="color: #FF0000; font-size: 30px;">Oops!</span> It's <span class="correct-year">${correctYear}</span>`;
      }

      if (yearDifference <= 1) {
        feedback.innerHTML = `<span style="color: #FF0000; font-size: 30px;">Oh no!</span> You're only 1 year off! It's <span class="correct-year">${correctYear}.</span>`;
        playCloseSound();
      } else if (yearDifference <= 5) {
        feedback.innerHTML = `<span style="color: #FF0000; font-size: 30px;">Not bad!</span> Only ${yearDifference} years away. It's <span class="correct-year">${correctYear}.</span>`;
      } else if (yearDifference <= 10) {
        feedback.innerHTML = `<span style="color: #FF0000; font-size: 30px;">Close!</span> You're ${yearDifference} years away. It's <span class="correct-year">${correctYear}.</span>`;
      } else if (yearDifference <= 100) {
        feedback.innerHTML = `<span style="color: #FF0000; font-size: 30px;">Nope.  </span> You're ${yearDifference} years off. It's <span class="correct-year">${correctYear}.</span>`;
      } else {
        feedback.innerHTML = `<span style="color: #FF0000; font-size: 30px;">Yikes!</span> You're ${yearDifference} years off. It's <span class="correct-year">${correctYear}.</span>`;
        playFailSound();
      }
    }

    feedback.style.fontSize = '24px'; // Set the font size for the rest of the message

    // Update the box colors for the correct year
    updateBoxColors(correctYear);

    hideSubmitClearButtons();
    showActionButtons(); // Show or hide the action buttons based on the message
  }
}

// Function to update box outlines based on whether a box contains a number or not
function updateBoxOutlines() {
  for (let i = 0; i < 4; i++) {
    if (selectedYear[i]) {
      yearDigits[i].style.borderWidth = '2px';
      yearDigits[i].style.borderStyle = 'solid';
      yearDigits[i].style.borderColor = '#ffffff'; // Light gray outline
    } else {
      yearDigits[i].style.borderWidth = '3px';
      yearDigits[i].style.borderStyle = 'solid';
      yearDigits[i].style.borderColor = '#ffffff'; // Default outline
    }
  }
}

// Call this function to reset the outline colors when starting a new event
function resetBoxOutlines() {
  for (let i = 0; i < 4; i++) {
    yearDigits[i].style.borderWidth = '3px'; // Default border width
    yearDigits[i].style.borderStyle = 'solid'; // Default border style
    yearDigits[i].style.borderColor = '#ffffff'; // Default outline color
  }
}

clearButton.addEventListener('click', () => {
  selectedYear = '';
  updateYearDisplay();
  clearBoxStyles();
  resetBoxOutlines(); // Reset box outline colors
});

submitButton.addEventListener('click', () => {
  submitGuess();
});

numberButtons.forEach(img => {
  img.addEventListener('click', () => {
    const number = img.getAttribute('data-number');
    populateYearDigits(number);
  });
});

function clearBoxStyles() {
  for (let i = 0; i < 4; i++) {
    yearDigits[i].textContent = '';
    yearDigits[i].style.backgroundImage = 'none'; // Reset background image
    yearDigits[i].style.backgroundColor = '#f0f9ff'; // Reset box color to default
  }
}

function clearLastBoxOutline(digitIndex) {
  yearDigits[digitIndex].textContent = '';
  yearDigits[digitIndex].style.backgroundImage = 'none'; // Reset background image
  yearDigits[digitIndex].style.backgroundColor = '#f0f9ff'; // Reset box color to default
}

async function startNewEvent() {
  await fetchEventData();

  const currentEventType = document.querySelector('.event-type-button.active').getAttribute('data-event-type');
  const filteredEvents = eventDataList.filter(event => currentEventType === 'all' || event.eventType === currentEventType);

  hideActionButtons();
  showSubmitClearButtons();
  updateGameState();
  updateGameModeText(); // Update the displayed game mode

  // Inside the startNewEvent() function
  if (filteredEvents.length > 0) {
    let randomEvent;
    do {
      randomEvent = filteredEvents[Math.floor(Math.random() * filteredEvents.length)];
    } while (randomEvent.id === savedGameState.previousEventId); // Update here
    savedGameState.previousEventId = randomEvent.id; // Update previousEventId


    previousEventId = randomEvent.id;
    eventDescription.textContent = randomEvent.description;
    clearBoxStyles(); // Clear box colors and digits
    selectedYear = '';
    feedback.textContent = '';
    resetBoxOutlines(); // Reset box outline colors
  } else {
    eventDescription.textContent = `No events available for the selected type: ${currentEventType}.`;
    clearBoxStyles(); // Clear box colors and digits
    selectedYear = '';
    feedback.textContent = '';
    resetBoxOutlines(); // Reset box outline colors
  }
}
const startGameOverlay = document.getElementById('startGameOverlay');
const startGameButton = document.getElementById('startGameButton');
const freeplayButton = document.getElementById('freeplayButton');
const freeplayAgainButton = document.getElementById('freeplayAgainButton');
const playAgainButton = document.getElementById('playAgainButton');
const resumeButton = document.getElementById('resumeButton'); // Change the ID to match your HTML
const gamemodeButton = document.getElementById('gamemodeButton');

gamemodeButton.addEventListener('click', () => {
  showOverlayAndPopup(); // Show the start game popup
  updateGameModeText(); // Update the displayed game mode
});

if (!isGameActive) {
resumeButton.style.display = 'none';
}

if (isGameActive) {
  resumeButton.style.display = 'inline-block';
  }

// When the resume button is clicked
resumeButton.addEventListener('click', () => {
  // Check if the game is active before resuming
  if (isGameActive) {
    // Hide the overlay and popup
    hideOverlayAndPopup();
  }
});

// Function to show the overlay and pop-up
function showOverlayAndPopup() {
  var menu = document.querySelector('.mobile-menu');
  menu.classList.remove('active');
  startGameOverlay.style.visibility = 'visible';
  startGameOverlay.style.opacity = 1;
}

// Function to hide the overlay and pop-up
function hideOverlayAndPopup() {
  startGameOverlay.style.visibility = 'hidden';
  startGameOverlay.style.opacity = 0;
}


// Add event listener to the "Freeplay" button
freeplayButton.addEventListener('click', () => {
  // Hide the game over popup
  gameOverPopup.style.display = 'none';
  // Set the game mode to "Freeplay"
  gameMode = 'Freeplay';
  // Start a new game
  startNewGame();
  updateGameModeText();
  // Hide the overlay and pop-up
  hideOverlayAndPopup();
});

// Add event listener to the "Start Game" button
startGameButton.addEventListener('click', () => {
  // Hide the pop-up
  gameOverPopup.style.display = 'none';
  // Set the game mode to "Game"
  gameMode = 'Survival';
  // Start a new game
  startNewGame();
  updateGameModeText();
  // Hide the overlay and pop-up
  hideOverlayAndPopup();
});


// Add event listener to the "Freeplay Again" button
freeplayAgainButton.addEventListener('click', () => {
  // Hide the pop-up
  gameOverPopup.style.display = 'none';
  // Set the game mode to "Freeplay"
  gameMode = 'Freeplay';
  // Start a new game
  startNewGame();
  updateGameModeText();

  // Hide the overlay and pop-up
  hideOverlayAndPopup();
});

// Attach the "Play Again" button click event listener
playAgainButton.addEventListener('click', () => {
  // Hide the game over popup
  gameOverPopup.style.display = 'none';
  // Set the game mode to "Survival"
  gameMode = 'Survival';
  // Start a new game
  startNewGame();
  updateGameModeText();
  // Hide the overlay and pop-up
  hideOverlayAndPopup();
});

const gameOverPopup = document.getElementById('gameOverPopup');

function showGameOverPopup(correctYear) {
  playGameOverSound();
  // Get the correctYearInPopup span element
  const correctYearInPopup = document.getElementById('correctYearInPopup');

  // Update the content of the span element with the correct year
  correctYearInPopup.textContent = correctYear;

  gameOverPopup.style.display = 'block';
}


// Modify the startNewGame() function
function startNewGame() {
  isGameActive = true;
  resumeButton.style.display = 'inline-block';
  comboValue = 0; // Reset the combo value
  totalRating = 0; // Reset the total rating
  totalRound = 1; // Reset the total round
  totalHealth = 250;
  correctQuestions = 0;
  totalQuestions = 0;
  updateScoreDisplay(); // Update the score display
  
  // Update the round display
  updateRoundDisplay(totalRound);

  updateTotalHealthDisplay(totalHealth)

  updateGameModeText(); // Update the displayed game mode
  
  startNewEvent(); // Start a new event

  // Update the game state in local storage, including the game mode
  savedGameState.gameMode = gameMode;
  localStorage.setItem('gameState', JSON.stringify(savedGameState));
}


// Function to play a correct sound with reduced volume
function playCorrectSound() {
  const audioCorrect = new Audio('./assets/sounds/correct.mp3');
  const audioClap = new Audio('./assets/sounds/clap.mp3');
  audioCorrect.volume = 0.4; // Set the volume to 50%
  audioClap.volume = 0.4; // Set the volume to 50%
  audioClap.play();
}

// Function to play an incorrect sound with reduced volume
function playIncorrectSound() {
  const audio = new Audio('./assets/sounds/incorrect.mp3');
  audio.volume = 0.3; // Set the volume to 50%
  audio.play();
}

function playGameOverSound() {
  const audioGameOver = new Audio('./assets/sounds/game-over.mp3');
  audioGameOver.volume = 0.2; // Set the volume to 40%
  audioGameOver.play();
}

// Function to play a close sound with reduced volume
function playCloseSound() {
  const audio = new Audio('./assets/sounds/close.mp3');
  audio.volume = 0.4; // Set the volume to 50%
  audio.play();
}

// Function to play a fail sound with reduced volume
function playFailSound() {
  const audio = new Audio('./assets/sounds/fail.mp3');
  audio.volume = 0.2; // Set the volume to 50%
  audio.play();
}

function openTab(tabName) {
  var i, tabContent, tabButtons;
  tabContent = document.getElementsByClassName("tab-content");
  tabButtons = document.getElementsByClassName("tab");
  // Close the mobile menu by removing the 'active' class
  var menu = document.querySelector('.mobile-menu');
  menu.classList.remove('active');

  // Hide all tab contents and remove active class from all tabs
  for (i = 0; i < tabContent.length; i++) {
    tabContent[i].style.display = "none";
    tabButtons[i].classList.remove("active");
  }

  // Check if the tabName is "Dates"
  if (tabName === "Dates") {
    // Call the function to show overlay and popup
    document.querySelector(".container").style.display = "block";
    showOverlayAndPopup();
  }

  if (tabName === "Capitals") {
    // Call the function to show overlay and popup
    showCapitalsOverlayAndPopup();
  }

  // Show the selected tab and add active class to the selected tab
  var selectedTabContent = document.getElementById(tabName + "Content");
  selectedTabContent.style.display = "block";

  // Show Leaderboard and Account headers when their respective tabs are clicked
  if (tabName === "Leaderboard") {
    document.getElementById("LeaderboardContent").style.display = "block";
  } else if (tabName === "Account") {
    document.getElementById("AccountContent").style.display = "block";
  }

  // Display the selected tab and add active class to the selected tab
  document.getElementById(tabName + "Content").style.display = "block";
  for (i = 0; i < tabButtons.length; i++) {
      if (tabButtons[i].textContent === tabName) {
          tabButtons[i].classList.add("active");
      }
  }
}


