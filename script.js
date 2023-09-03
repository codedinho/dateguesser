const eventDescription = document.querySelector('.event-description');
const yearDigits = document.querySelectorAll('.year-digit');
const numberButtons = document.querySelectorAll('.number-button');
const submitButton = document.getElementById('submitGuess');
const feedback = document.querySelector('.feedback');
const nextButton = document.querySelector('.next-button');
const backspaceButton = document.getElementById('backspaceButton');

let eventDataList = [];
let previousEventId = null;
let selectedYear = '';
let gameMode = 'Freeplay'; // Set the initial game mode to 'Survival'
let totalRating = 0;
let totalQuestions = 0; // Total number of questions in the game
let currentQuestion = '';
let totalHealth = 250; // Total score for the game
let totalRound = 1; //Total rounds for the game
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
  gameMode: 'Survival' // Set the initial game mode to 'Survival'
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

// Restore values from the saved game state
totalRound = savedGameState.totalRound;
totalHealth = savedGameState.totalHealth;
comboValue = savedGameState.comboValue;
correctQuestions = savedGameState.correctQuestions;
totalQuestions = savedGameState.totalQuestions;

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
eventTypeButtons.forEach(button => {
  button.addEventListener('click', () => {
    const selectedEventType = button.getAttribute('data-event-type');
    //reset combo value
    comboValue = 0;
    //reset round value
    totalRound = 1;
    // Check if the clicked tab is already active
    if (!button.classList.contains('active')) {
      filterEvents(selectedEventType);
    } else {
      // Display "Select a date" message if the tab is already active
      clearBoxStyles(); // Clear box colors and digits
      selectedYear = '';
      feedback.textContent = '';
      resetBoxOutlines(); // Reset box outline colors
    }
  });
});


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



function updateTotalHealthDisplay(totalHealth) {
  const totalHealthValueElement = document.querySelector('.total-health-value');
  totalHealthValueElement.textContent = totalHealth;
}

const gameOverPopup = document.getElementById('gameOverPopup');

function showGameOverPopup() {
  // Display the popup
  gameOverPopup.style.display = 'block';
}


// Function to end the game
function endGame() {
  // Update the correct questions, total questions, and round in the popup
  const correctQuestionsElement = document.getElementById('correctQuestions');
  correctQuestionsElement.textContent = correctQuestions;
  
  const totalQuestionsElement = document.getElementById('totalQuestions');
  totalQuestionsElement.textContent = totalQuestions;
  
  const endRoundElement = document.getElementById('endRound');
  endRoundElement.textContent = totalRound;

  // Show the game over popup
  showGameOverPopup();

  submitButton.style.display = 'none';
  clearButton.style.display = 'none';

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
const menuButton = document.querySelector('.menu-button');

// Add event listener for the "Swap Gamemode" button
menuButton.addEventListener('click', () => {
  console.log('Button clicked');
  showOverlayAndPopup(); // Show the start game popup
});

// Add event listener for the "Restart" button
restartButton.addEventListener('click', () => {
  // Show a confirmation dialog
  const confirmed = confirm("Are you sure you want to restart the game?");
  
  if (confirmed) {
    // Perform the game restart logic here
    startNewGame(); // Call your restart function here
  }
});


// Add event listener for the "Restart" button
restartButton.addEventListener('click', () => {
  // Restart the current game mode
  startNewGame();
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
  console.log('Next button clicked');
  rating = 0;
  updateRoundDisplay(totalRound); // Update the round value on the screen
  startNewEvent(); // Trigger a new event
  feedback.textContent = ''; // Clear the feedback text
  hideActionButtons();
  showSubmitClearButtons();

  // Update the totalRound and comboValue in the savedGameState
  savedGameState.totalRound = totalRound;

  // Update the game state in local storage
  localStorage.setItem('gameState', JSON.stringify(savedGameState));
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


function submitGuess() {
  localStorage.setItem('gameState', JSON.stringify({
    totalRound,
    totalHealth,
    comboValue,
    correctQuestions,
    totalQuestions
  }));

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

    return; // Don't proceed with further logic
  } else {

    // Increase correctly value and update display
    totalQuestions++;

    totalRound++;
    updateRoundDisplay(totalRound);
    

    // Show the submit and clear buttons
    showSubmitClearButtons();

    const currentEvent = eventDataList.find(event => event.description === eventDescription.textContent);
    const correctYear = currentEvent ? new Date(currentEvent.correctDate).getFullYear().toString() : null;
    
    if (selectedYear === correctYear) {
      feedback.innerHTML = `<span style="color: #00FF00; font-size: 30px;">Correct!</span> You guessed the year!`;

      // Increase combo value and update display
      comboValue++;

      // Increase correctly value and update display
      correctQuestions++;

      totalRound++;
      updateRoundDisplay(totalRound);

      // Update the Combo display
      updateComboValueDisplay(comboValue);

      // Update the combo multiplier based on the combo value
      comboMultiplier = 1.2 + (comboMultiplierincrement * comboValue);
      
      // Calculate the health increment based on the combo multiplier
      let healthIncrement = 0;

      if (gameMode === 'Survival') {
        healthIncrement = 25 * comboMultiplier;
        totalHealth += healthIncrement;
        updateTotalHealthDisplay(totalHealth);

        // Show health increment element
        const healthIncrementElement = document.getElementById('healthIncrement');
        healthIncrementElement.textContent = `+${healthIncrement}`;
        healthIncrementElement.style.display = 'block';

        // Hide the health increment element after 4 seconds
        setTimeout(() => {
          healthIncrementElement.style.display = 'none';
        }, 4000);
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
      console.log('Year Difference:', yearDifference);

      // Increase combo value and update display
      comboValue = 0;
      updateComboValueDisplay(comboValue);

      // Calculate the maximum damage that can be taken before the score becomes 0
      const maxDamage = totalHealth;

      // Deduct health based on the absolute value of the year difference, limited by maxDamage
      const healthDeduction = Math.min(Math.abs(yearDifference), maxDamage);

      // Update the totalHealth display
      updateTotalHealthDisplay(totalHealth);

      console.log('Health Deduction:', healthDeduction);

      // Log the updated health value
      console.log('Health:', totalHealth);
      console.log('Round:', totalRound)
      console.log('Combo Level:', comboValue)
    
      if (gameMode !== 'Freeplay') {
        const healthDeduction = Math.min(Math.abs(yearDifference), maxDamage);
        totalHealth -= healthDeduction;
      
        // Log the updated health value
        console.log('Health:', totalHealth);
        console.log('Round:', totalRound)
        console.log('Combo Level:', comboValue)
 
        // Update the totalHealth in the saved game state
        savedGameState.totalHealth = totalHealth;
        savedGameState.totalRound = totalRound;
        savedGameState.comboValue = comboValue;
        savedGameState.totalQuestions = totalQuestions;
        savedGameState.correctQuestions = correctQuestions;
        
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
        }, 4000);
      
        if (totalHealth === 0) {
          totalRound--;
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
        feedback.innerHTML = `<span style="color: #FF0000; font-size: 30px;">Oh no!</span> You're only 1 year off! It's <span class="correct-year">${correctYear}.</span>`;
      } else if (yearDifference <= 5) {
        feedback.innerHTML = `<span style="color: #FF0000; font-size: 30px;">Not bad!</span> Only ${yearDifference} years away. It's <span class="correct-year">${correctYear}.</span>`;
      } else if (yearDifference <= 10) {
        feedback.innerHTML = `<span style="color: #FF0000; font-size: 30px;">Close!</span> You're ${yearDifference} years away. It's <span class="correct-year">${correctYear}.</span>`;
      } else if (yearDifference <= 100) {
        feedback.innerHTML = `<span style="color: #FF0000; font-size: 30px;">Nope.  </span> You're ${yearDifference} years off. It's <span class="correct-year">${correctYear}.</span>`;
      } else {
        feedback.innerHTML = `<span style="color: #FF0000; font-size: 30px;">Yikes!</span> You're ${yearDifference} years off. It's <span class="correct-year">${correctYear}.</span>`;
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

submitButton.addEventListener('click', submitGuess);

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

  updateGameModeText(); // Update the displayed game mode

  if (filteredEvents.length > 0) {
    let randomEvent;

    do {
      randomEvent = filteredEvents[Math.floor(Math.random() * filteredEvents.length)];
    } while (randomEvent.id === previousEventId);

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
  console.log('Button clicked');
  console.log('Current game mode:', gameMode);
  showOverlayAndPopup(); // Show the start game popup
  updateGameModeText(); // Update the displayed game mode
});

// Show the overlay and pop-up when the page loads
showOverlayAndPopup();

// Hide the overlay and pop-up when clicking outside the pop-up or gamemode box
startGameOverlay.addEventListener('click', (event) => {
  if (event.target === startGameOverlay || event.target === gamemodeButton) {
    hideOverlayAndPopup();
  }
});

// resume button

// When the resume button is clicked
resumeButton.addEventListener('click', async () => {
  const savedGameState = JSON.parse(localStorage.getItem('gameState'));
  if (savedGameState) {
    totalRound = savedGameState.totalRound;
    totalHealth = savedGameState.totalHealth;
    comboValue = savedGameState.comboValue;
    correctQuestions = savedGameState.correctQuestions;
    totalQuestions = savedGameState.totalQuestions;

    // Update the score display
    updateScoreDisplay();
    
    // Clear the selected year and feedback
    selectedYear = '';
    feedback.textContent = '';

    // Update the round display
    updateRoundDisplay(totalRound);

    // Update the combo and score displays
    updateScoreDisplay();
    updateComboValueDisplay(comboValue);
    updateTotalHealthDisplay(totalHealth);
    updateGameModeText();

    // Fetch event data
    await fetchEventData();


    // Find the saved event by event ID
    const savedEvent = eventDataList.find(event => event.id === savedGameState.previousEventId);

    // Start the saved event if it exists
    if (savedEvent) {
      eventDescription.textContent = savedEvent.description;

      // Update box outlines
      updateBoxOutlines();

      // Update box colors for the saved event
      const correctYear = new Date(savedEvent.correctDate).getFullYear().toString();
      updateBoxColors(correctYear);

      // Show the submit and clear buttons
      showSubmitClearButtons();

      // Start the event
      startNewGame();
    } else {
      startNewEvent();
    }

    // Hide the overlay and popup
    hideOverlayAndPopup();
  }
});



// Function to show the overlay and pop-up
function showOverlayAndPopup() {
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

// Show the overlay and pop-up when the page loads
showOverlayAndPopup();

// Hide the overlay and pop-up when clicking outside the pop-up
startGameOverlay.addEventListener('click', (event) => {
  if (event.target === startGameOverlay) {
    hideOverlayAndPopup();
  }
});

// Modify the startNewGame() function
function startNewGame() {
  comboValue = 0; // Reset the combo value
  totalRating = 0; // Reset the total rating
  totalRound = 1; // Reset the total round
  totalHealth = 250;
  correctQuestions = 0;
  totalQuestions = 0;
  updateScoreDisplay(); // Update the score display
  
  // Update the round display
  updateRoundDisplay(totalRound);

  updateGameModeText(); // Update the displayed game mode
  
  startNewEvent(); // Start a new event

  // Update the game state in local storage, including the game mode
  savedGameState.gameMode = gameMode;
  localStorage.setItem('gameState', JSON.stringify(savedGameState));

}

// Populate the year digits when the page loads
updateYearDisplay();


