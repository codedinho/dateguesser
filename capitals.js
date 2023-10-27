const countries = []; // Store fetched country data here
let usedCountries = []; // Store used countries here
let currentCountry = null;
let combo = 0;
let capitalCorrectQuestions = 0; 
let capitalTotalQuestions = 1; 
let capitalEndRound = 1; 



function startGame() {
    // Check if all countries have been used, reset the used countries if so
    if (usedCountries.length >= countries.length) {
        usedCountries = [];
    }

    // Get a random country from the remaining countries
    let validCountryFound = false;
    while (!validCountryFound) {
        currentCountry = getRandomCountry();
        // Check if the selected country has a valid capital
        if (currentCountry.capital && currentCountry.capital[0]) {
            validCountryFound = true;
        }
    }

    // Get a random country from the remaining countries
    currentCountry = getRandomCountry();
    // Log the current country object to inspect its structure
    console.log(currentCountry);

    // Display the country name to the user
    document.getElementById('country-name').textContent = `What is the capital of ${currentCountry.name.common}?`;

    // Display the country flag as a small circular icon next to the country name
    const flagElement = document.createElement('img');
    flagElement.src = currentCountry.flags.svg; // Assuming the API provides SVG flag URLs
    flagElement.alt = 'Country Flag';
    flagElement.classList.add('flag-icon'); // Add a class for styling if needed
    document.getElementById('country-name').appendChild(flagElement);

    // Add the current country to the used countries list
    usedCountries.push(currentCountry);
}


function getRandomCountry() {
    // Get a random index from the remaining countries array
    const remainingCountries = countries.filter(country => !usedCountries.includes(country) && country.capital && country.capital[0]);
    
    // Check if there are remaining countries with valid capital data
    if (remainingCountries.length === 0) {
        // Handle the case where no valid countries with capital data are available
        console.error('No valid countries with capital data available.');
        return null;
    }

    const randomIndex = Math.floor(Math.random() * remainingCountries.length);
    // Return the country at the random index
    return remainingCountries[randomIndex];
}


function normalizeInput(input) {
    // Normalize input to ignore character accents, remove common prefixes, replace hyphens with spaces, replace abbreviations, and remove "city"
    const normalizedInput = input.trim().toLowerCase().normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/'|’/g, " ") // Replace single quotes with spaces
        .replace(/-/g, " ") // Replace hyphens with spaces
        .replace(/\bcity of\b/g, "")
        .replace(/\bcity\b/g, "") // Remove the word "city"
        .replace(/\bthe\b/g, "") // Remove the word "the"
        .replace(/\btown of\b/g, "") // Remove the phrase "town of"
        .replace(/\bst\.?\b/g, 'saint') // Handle various forms of "st."
        .replace(/[^a-zA-Z0-9\s]/g, "") // Remove non-alphanumeric characters except spaces
        .replace(/\s+/g, " ") // Replace multiple spaces with a single space
        .trim(); // Remove leading and trailing spaces

    return normalizedInput;
}

function checkGuess() {
    const userGuess = normalizeInput(document.getElementById('user-guess').value);
    const feedbackElement = document.getElementById('feedback');
    const correctCapital = normalizeInput(currentCountry.capital[0]);
    const funFactBox = document.getElementById('funFactBox');

    // Remove spaces from user input and correct capital before comparison
    const formattedUserGuess = userGuess.replace(/\s/g, '');
    const formattedCorrectCapital = correctCapital.replace(/\s/g, '');

    // Fetch and display fun fact along with feedback
    fetch(`https://restcountries.com/v3.1/name/${currentCountry.name.common}`)
        .then(response => response.json())
        .then(data => {
            const population = data[0]?.population?.toLocaleString() || 'N/A';
            const funFactContent = document.getElementById('funFactContent');
            funFactContent.textContent = `${currentCountry.name.common} is home to ${population} people.`;

        })
        .catch(error => {
            // Handle errors here
            console.error('Error fetching fun facts:', error);
        });

    // Check if the user input is empty
    if (formattedUserGuess === '') {
        feedbackElement.style.fontSize = '22px';
        feedbackElement.style.margin = '20px 0'; // Add margin-top and margin-bottom of 20px
        feedbackElement.innerHTML = '<span style="color: #000000; font-size: 22px;">Please enter a capital!</span>';

        // Set a timeout to hide the feedback message after 5 seconds (5000 milliseconds)
        setTimeout(function() {
            // Hide the feedback message after 5 seconds
            feedbackElement.innerHTML = ''; // Clear the inner HTML to hide the message
        }, 2500); // 5000 milliseconds = 5 seconds

        return; // Return early if input is empty
    }

    // Hide the Fun Fact box when clicking "Next"
    document.getElementById('nextQuestionButton').addEventListener('click', function() {
        funFactBox.style.display = 'none';
    });

    const defaultHealthIncrement = 35;
    // Calculate combo multiplier (starts at 0.35 and increases by 0.0025 for every correct answer)
    const comboMultiplier = Math.floor(35 * parseInt(document.getElementById("capitalCombo").textContent) / 4) + defaultHealthIncrement;

    if (formattedUserGuess === formattedCorrectCapital.toLowerCase()) { // Convert both to lowercase for case-insensitive comparison
        // Update health if the guess is correct
        updateHealth(comboMultiplier); // Increase health based on combo multiplier

        // Increment combo by 1 for every correct answer
        let currentCombo = parseInt(document.getElementById("capitalCombo").textContent);
        currentCombo += 1;
        capitalCorrectQuestions += 1;
        document.getElementById("capitalCombo").textContent = currentCombo;
        // Show the Fun Fact box
        funFactBox.style.display = 'block';

        // Trigger correct sound
        playClapSound();

        feedbackElement.style.fontSize = '22px'; // Set font size to 28px for Correct!
        feedbackElement.style.margin = '20px 0'; // Add margin-top and margin-bottom of 20px
        feedbackElement.innerHTML = `
            <span style="color: green; font-size: 28px; font-weight: 600;">Correct! <span style="color: black; font-size: 24px;">It is  
                <span style="color: green; font-size: 28px; font-weight: 600;">${correctCapital}.</span></span>`;

        // Check if health is zero or below
        if (getHealth() <= 0) {
            // Display game over popup with restart option
            displayGameOverPopup();
        }
        
    } else {
        // Reset combo to 0 on incorrect answer
        document.getElementById("capitalCombo").textContent = 0;

        // Show the Fun Fact box
        funFactBox.style.display = 'block';

        // Update health if the guess is incorrect
        updateHealth(-25); // Decrease health by 35

        // Trigger incorrect sound
        playIncorrectSound();

        feedbackElement.style.fontSize = '22px'; // Set font size to 28px for Incorrect!
        feedbackElement.style.margin = '20px 0'; // Add margin-top and margin-bottom of 20px
        feedbackElement.innerHTML = `
            <span style="color: #ff0000; font-size: 28px; font-weight: 600;">Wrong! <span style="color: black; font-size: 24px;">The capital is
                <span style="color: green; font-size: 28px; font-weight: 600;">${correctCapital}.
                </span>
            </span>`;           

        // Check if health is zero or below
        if (getHealth() <= 0) {
            // Display game over popup with restart option
            showCapitalGameOverPopup(correctCapital);
        }
    }

    // Check if health is zero or below
    if (getHealth() > 0) {
        capitalEndRound++;
        capitalTotalQuestions++;
    }

    document.getElementById('nextQuestionButton').style.display = 'block';
    document.getElementById('restartButton').style.display = 'block';
    document.getElementById('submitGuessButton').style.display = 'none';
}


function getComboMultiplier() {
    // Calculate the combo multiplier based on the current combo value
    const currentCombo = parseFloat(document.getElementById("capitalCombo").textContent);
    const comboMultiplier = Math.floor(currentCombo / 4) * 0.25; // Increase multiplier every 4 correct answers by 0.25
    return comboMultiplier;
}

function updateHealth(value) {
    const healthElement = document.getElementById("capitalHealth");
    const healthDeductionElement = document.getElementById("capitalHealthDeduction");
    const healthIncrementElement = document.getElementById("capitalHealthIncrement");

    // Check if the value is positive (increment) or negative (deduction)
    if (value > 0) {
        // Show and set the health increment value in green
        const healthIncrement = `+${value}`;
        healthIncrementElement.textContent = healthIncrement;
        healthIncrementElement.style.color = 'green';
        healthIncrementElement.style.opacity = 1;
        setTimeout(() => {
            healthIncrementElement.style.opacity = 0;
        }, 2500); // Delay for 2.5 seconds to create a flashing effect
    } else if (value < 0) {
        // Show and set the health deduction value in red
        healthDeductionElement.textContent = `${value}`;
        healthDeductionElement.style.color = 'red';
        healthDeductionElement.style.opacity = 1;
        setTimeout(() => {
            healthDeductionElement.style.opacity = 0;
        }, 2500); // Delay for 0.5 seconds to create a flashing effect
    }
    
    // Update health
    const currentHealth = parseInt(healthElement.textContent);
    healthElement.textContent = currentHealth + value;

    // Ensure the health value doesn't go below 0
    if (getHealth() < 0) {
        healthElement.textContent = 0;
    }
}


function getHealth() {
    // Get the current health value as an integer
    return parseInt(document.getElementById("capitalHealth").textContent);
}

function displayGameOverPopup() {
    // Display the game over popup with restart options
    const gameOverPopup = document.getElementById('gameOverPopup');
    const correctYearInPopup = document.getElementById('correctYearInPopup');
    const endRound = document.getElementById('endRound');
    const correctQuestions = document.getElementById('correctQuestions');
    const totalQuestions = document.getElementById('totalQuestions');

    correctYearInPopup.textContent = currentCountry.capital[0];
    endRound.textContent = document.getElementById('capitalRound').textContent;
    correctQuestions.textContent = 0; // Set correct questions to 0 (adjust this based on your game logic)
    totalQuestions.textContent = usedCountries.length; // Set total questions to the number of asked questions

    gameOverPopup.style.display = 'block'; // Show the game over popup
}

// Function to restart the game
function restartGame() {
    // Reset player's health and round number (adjust these values based on your game logic)
    document.getElementById("capitalHealth").textContent = 250; // Set initial health value
    document.getElementById("capitalRound").textContent = 1; // Set initial round number
    // Hide the game over popup
    document.getElementById('gameOverPopup').style.display = 'none';
    // Start a new game
    startGame();
}

function nextQuestion() {
    // Increment the capital round by 1
    const capitalRoundElement = document.getElementById("capitalRound");
    capitalRoundElement.textContent = parseInt(capitalRoundElement.textContent) + 1;

    // Clear user input and feedback
    document.getElementById('user-guess').value = '';
    document.getElementById('feedback').textContent = '';
    document.getElementById('nextQuestionButton').style.display = 'none';
    document.getElementById('restartButton').style.display = 'none';
    document.getElementById('submitGuessButton').style.display = 'block';
    startGame();
}


// Call this function when you want to update the score in the "Capitals" section
function handleCapitalAnswer(round, rating, health, healthDeduction, healthIncrement, combo) {
    // Update the score in the "Capitals" section
    updateCapitalScore(round, rating, health, healthDeduction, healthIncrement, combo);
  }
  

function updateCapitalScore(round, rating, health, healthDeduction, healthIncrement, combo) {
    // Update round
    document.getElementById("capitalRound").textContent = round;

    // Update rating (if needed)
    document.getElementById("capitalRating").textContent = rating;

    // Update health
    document.getElementById("capitalHealth").textContent = health;

    // Update health deduction (if needed)
    document.getElementById("capitalHealthDeduction").textContent = healthDeduction;

    // Update health increment (if needed)
    document.getElementById("capitalHealthIncrement").textContent = healthIncrement;

    // Update combo
    document.getElementById("capitalCombo").textContent = combo.toFixed(2); // Display combo with 2 decimal places
}

const capitalGameOverPopup = document.getElementById('capitalGameOverPopup');

function showCapitalGameOverPopup(correctCapital) {
    playGameOverSound();
    // Get the correctCapitalInPopup span element
    const correctCapitalInPopup = document.getElementById('correctCapitalInPopup');
    const correctQuestions = document.getElementById('capitalCorrectQuestions'); // Get correct questions element
    const totalQuestions = document.getElementById('capitalTotalQuestions'); // Get total questions element
    const totalRound = document.getElementById('capitalEndRound'); // Get end round element


    // Update the content of the span element with the correct capital
    correctCapitalInPopup.textContent = correctCapital;
    
    // Display correct and total questions count in the popup
    correctQuestions.textContent = capitalCorrectQuestions;
    totalQuestions.textContent = capitalTotalQuestions;
    totalRound.textContent = capitalEndRound;


    capitalGameOverPopup.style.display = 'block';
}

// Call this function when the "Play Again" button is clicked in the capital game over popup
document.getElementById('capitalPlayAgainButton').addEventListener('click', function() {
    capitalGameOverPopup.style.display = 'none';
    // Reset the game state
    resetGame();
});


function resetGame() {
    // Reset game-related variables
    capitalCorrectQuestions = 0;
    capitalTotalQuestions = 1;
    capitalEndRound = 1;
    combo = 0;

    // Reset UI elements
    document.getElementById("capitalHealth").textContent = 250;
    document.getElementById("capitalRound").textContent = 1;
    document.getElementById("capitalCombo").textContent = 0;
    document.getElementById("user-guess").value = '';
    document.getElementById("feedback").textContent = '';
    document.getElementById("nextQuestionButton").style.display = 'none';
    document.getElementById("restartButton").style.display = 'none';
    document.getElementById("submitGuessButton").style.display = 'block';

    // Start a new game
    startGame();
}

function playIncorrectSound() {
    const audioIncorrect = new Audio('./assets/sounds/incorrect.mp3');
    audioIncorrect.volume = 0.4; // Set the volume to 40%
    audioIncorrect.play();
}

function playGameOverSound() {
    const audioGameOver = new Audio('./assets/sounds/game-over.mp3');
    audioGameOver.volume = 0.4; // Set the volume to 40%
    audioGameOver.play();
}

function playClapSound() {
    const audioClap = new Audio('./assets/sounds/clap.mp3');
    audioClap.volume = 0.4; // Set the volume to 40%
    audioClap.play();
}

// Add an event listener to the "Next Question" button
document.getElementById('restartButton').addEventListener('click', resetGame);

// Add an event listener to the "Next Question" button
document.getElementById('nextQuestionButton').addEventListener('click', nextQuestion);

// Call the API and start the game when the data is fetched
fetch('https://restcountries.com/v3.1/all')
  .then(response => response.json())
  .then(data => {
    // Store the fetched data in the countries array
    countries.push(...data);
    // Start the game
    startGame();
  })
  .catch(error => {
    // Handle errors here
    console.error('Error fetching data:', error);
  });

