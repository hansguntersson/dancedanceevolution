/*jslint plusplus: true */

/*global document, window, setInterval, clearInterval, checkKey, startUp, generateSequence, gameLoop, startGame, Audio, setupMenu, backMenu, endGame, cleanseSequence, countdownGame, mutationSound */

/* NOTES

Pro Mode: music 200bpm steps at 200bpm - 3.33 beats per second
Hard mode: music 150bpm steps at 75bpm - 1.25 beats per second 
Standard mode:  music 150bpm steps at 37.5bpm - 0.625 beats per second
Beginner mode: music 150bpm steps at 18.75 bpm - 0.3125 beats per second

50 frames per second
1000 ms in a second
1000 / 50 = 20 ms per loop iteration = 0.02 s per loop iteration

0.02 x 80 = 1.6s per round = 0.625 rounds per second
0.02 x 40 = 1.2s per round = 0.3125 rounds per second
0.02 x 20 = 0.8s per round = 1.25 rounds per second 
0.02 x 15 = 0.3s per round = 3.33 rounds per second

Maximum tolerance: 0 - 200
Minimum tolerance: 50 - 150

*/

/*--------------------------GLOBAL VARIABLES--------------------------*/

var BaseSequence = []; // Holds base sequence
var BaseLength; // Size of the Input sequence

var DefaultSequence = [0, 0, 0, 2, 1,
                       1, 2, 2, 0, 2,
                       2, 3, 1, 0, 2,
                       3, 2, 1, 1, 0,
                       3, 1, 3, 0, 1,
                       1, 1, 0, 3, 0]; // Holds default sequence

var InputSequence = []; // Holds inputted sequence
var InputLength = 0; // Size of the Input sequence

var HitSequence = []; // Array of hits or misses
var HitLength = 0; // Size of the Hit sequence

var MutationMessage = 0; // Whether a mutation message is on
var MutationFrequency = 100;

var MinimumValue = 0; // Start of the array
var MaximumValue = 1; // End of the 'live' array
var CurrentValue = 0; // Current level

var RoundCounter = 0; // Variable holding the number of rounds
var RoundLimit = 40; // How many loops run per round

var IntervalSet; // Variable holding game loop repeater
var IntervalSetcountdown; // Variable holding countdown repeater
var CountdownInteger = 5; // Countdown number
var CountdownRound = 0; // Width value for countdown

var FidelityThreshold = 75;
var ResultPercent;
var CarryThreshold = 50;

var FPS = 50; // Desired frames per second

var canvas; // Defines canvas element
var ctx; // Defines canvas 2d context

var HeightSequence = []; // Array holding starting heights for arrows
var ToleranceValue = 5; // Value of tolerance that drives sensitivity
var StartTolerance = 155; // Where does the arrow start registering
var EndTolerance = 45; // Where does the arrow stop registering
var ToleranceVisible = 0; // Toggle for whether tolerance lines are visible
var AlphaValue = 1; // Fill transparency for canvas

var img1;
var img2;
var img3;
var img4;

var img1a;
var img2a;
var img3a;
var img4a;

var Track1 = new Audio('audio/dd_evo_vshort_150bpm.mp3');
var Track2 = new Audio('audio/ddevo_vshort_200bpm.mp3');

var CurrentTrack = Track1; // Which Track is current

var TrackReady = new Audio('audio/areyouready.mp3');
var TrackMutation = new Audio('audio/mutation.mp3');
var TrackHypermutator = new Audio('audio/hypermutator.mp3');
var TrackHighFidelity = new Audio('audio/highfidelity.mp3');

var DifficultySetting = 1; // Difficulty settings
var DifficultyLabels = ['Beginner', 'Standard', 'Hard', 'Pro']; // Labels for difficulty
var DifficultyTracks = [Track1, Track1, Track1, Track2]; // Tracks for difficulty
var DifficultyFrequencies = [80, 40, 20, 15]; // Frequencies for difficulty

var SequenceLengthValue = 1; // Which sequence length is being used
var SequenceLengths = [15, 30, 45, 60]; // Sequence lengths

/*--------------------------FUNCTION TO RUN ON STARTUP--------------------------*/

document.addEventListener("DOMContentLoaded", function () { // Startup function
	'use strict';
    startUp();
});


/*--------------------------FUNCTIONS--------------------------*/

function startUp() { // Set up core menus
	'use strict';
        
    document.getElementById("main_game_screen").style.display = 'none';
    document.getElementById("main_setup_screen").style.display = 'none';
    document.getElementById("main_results_screen").style.display = 'none';
    
    document.getElementById("start_button_screen").addEventListener("click", startGame);
    document.getElementById("start_button_screen").style.cursor = "pointer";
    
    document.getElementById("setup_button_screen").addEventListener("click", setupMenu);
    document.getElementById("setup_button_screen").style.cursor = "pointer";
    
    document.getElementById("setup_back_button_screen").addEventListener("click", backMenu);
    document.getElementById("setup_back_button_screen").style.cursor = "pointer";
    
    document.getElementById("replay_button_screen").addEventListener("click", startGame);
    document.getElementById("replay_button_screen").style.cursor = "pointer";
    
    document.getElementById("results_back_button_screen").addEventListener("click", backMenu);
    document.getElementById("results_back_button_screen").style.cursor = "pointer";
    
    document.getElementById("reset_settings_screen").addEventListener("click", function () {
        
        // Default difficulty
        CurrentTrack = Track1;
        DifficultySetting = 1;
        RoundLimit = DifficultyFrequencies[DifficultySetting];
        document.getElementById("difficulty_screen").innerHTML = DifficultyLabels[DifficultySetting];
        
        // Default tolerance
        ToleranceValue = 5;
        StartTolerance = 180;
        EndTolerance = 20;
        document.getElementById("tolerance_screen").innerHTML = ToleranceValue;
        
        // Default sequence length
        BaseSequence = DefaultSequence;
        SequenceLengthValue = 1;
        document.getElementById("sequence_screen").innerHTML = 30;
        
        // Default Fidelity threshold
        FidelityThreshold = 75;
        document.getElementById("fidelity_screen").innerHTML = FidelityThreshold;
        
        // Default Carry over threshold
        CarryThreshold = 50;
        document.getElementById("carry_screen").innerHTML = CarryThreshold;
        
        // Default tolerance visibility setting
        ToleranceVisible = 0;
        document.getElementById("tolerance_text_screen").innerHTML = "OFF";

    });
    document.getElementById("reset_settings_screen").style.cursor = "pointer";
    
    
    
    // SEQUENCE SETTINGS ************************************************************
    
    document.getElementById("decrease_sequence_screen").addEventListener("click", function () {
        if (SequenceLengthValue !== 0) {
            SequenceLengthValue -= 1;
            document.getElementById("sequence_screen").innerHTML = SequenceLengths[SequenceLengthValue];
            generateSequence();
        }
    });
    document.getElementById("decrease_sequence_screen").style.cursor = "pointer";
    
    document.getElementById("increase_sequence_screen").addEventListener("click", function () {
        if (SequenceLengthValue !== 3) {
            SequenceLengthValue += 1;
            document.getElementById("sequence_screen").innerHTML = SequenceLengths[SequenceLengthValue];
            generateSequence();
        }
    });
    document.getElementById("increase_sequence_screen").style.cursor = "pointer";
    
    
    
    // DIFFICULTY SETTINGS ************************************************************
    
    document.getElementById("decrease_difficulty_screen").addEventListener("click", function () {
        if (DifficultySetting !== 0) {
            DifficultySetting -= 1;
            document.getElementById("difficulty_screen").innerHTML = DifficultyLabels[DifficultySetting];
            RoundLimit = DifficultyFrequencies[DifficultySetting];
            CurrentTrack = DifficultyTracks[DifficultySetting];
        }
    });
    document.getElementById("decrease_difficulty_screen").style.cursor = "pointer";
    
    document.getElementById("increase_difficulty_screen").addEventListener("click", function () {
        if (DifficultySetting !== 3) {
            DifficultySetting += 1;
            document.getElementById("difficulty_screen").innerHTML = DifficultyLabels[DifficultySetting];
            RoundLimit = DifficultyFrequencies[DifficultySetting];
            CurrentTrack = DifficultyTracks[DifficultySetting];
        }
    });
    document.getElementById("increase_difficulty_screen").style.cursor = "pointer";
    
    
    
    // TOLERANCE SETTINGS ************************************************************
    
    document.getElementById("decrease_tolerance_screen").addEventListener("click", function () {
        if (ToleranceValue > 0) {
            ToleranceValue -= 1;
            document.getElementById("tolerance_screen").innerHTML = ToleranceValue;
            StartTolerance = 180 - (50 - (ToleranceValue * 5));
            EndTolerance = 20 + (50 - (ToleranceValue * 5));
        }
    });
    document.getElementById("decrease_tolerance_screen").style.cursor = "pointer";
    
    document.getElementById("increase_tolerance_screen").addEventListener("click", function () {
        if (ToleranceValue < 10) {
            ToleranceValue += 1;
            document.getElementById("tolerance_screen").innerHTML = ToleranceValue;
            StartTolerance = 180 - (50 - (ToleranceValue * 5));
            EndTolerance = 20 + (50 - (ToleranceValue * 5));
        }
    });
    document.getElementById("increase_tolerance_screen").style.cursor = "pointer";
    
    
    // TOLERANCE SETTINGS ************************************************************
    
    document.getElementById("toggle_tolerance_screen").addEventListener("click", function () {
        if (ToleranceVisible === 0) {
            ToleranceVisible = 1;
            document.getElementById("tolerance_text_screen").innerHTML = "ON";
        } else {
            ToleranceVisible = 0;
            document.getElementById("tolerance_text_screen").innerHTML = "OFF";
        }
    });
    document.getElementById("toggle_tolerance_screen").style.cursor = "pointer";
    
    
    
    // FIDELITY SETTINGS ************************************************************
    
    document.getElementById("decrease_fidelity_screen").addEventListener("click", function () {
        if (FidelityThreshold > 5) {
            FidelityThreshold -= 5;
            document.getElementById("fidelity_screen").innerHTML = FidelityThreshold;
        }
    });
    document.getElementById("decrease_fidelity_screen").style.cursor = "pointer";
    
    document.getElementById("increase_fidelity_screen").addEventListener("click", function () {
        if (FidelityThreshold < 95) {
            FidelityThreshold += 5;
            document.getElementById("fidelity_screen").innerHTML = FidelityThreshold;
        }
    });
    document.getElementById("increase_fidelity_screen").style.cursor = "pointer";
    
    
    
    // CARRY SETTINGS ************************************************************
    
    document.getElementById("decrease_carry_screen").addEventListener("click", function () {
        if (CarryThreshold > 5) {
            CarryThreshold -= 5;
            document.getElementById("carry_screen").innerHTML = CarryThreshold;
        }
    });
    document.getElementById("decrease_carry_screen").style.cursor = "pointer";
    
    document.getElementById("increase_carry_screen").addEventListener("click", function () {
        if (CarryThreshold < 95) {
            CarryThreshold += 5;
            document.getElementById("carry_screen").innerHTML = CarryThreshold;
        }
    });
    document.getElementById("increase_carry_screen").style.cursor = "pointer";
    
    
    // GRAPHICS
    
    img1 = document.getElementById("LeftArrow");
    img2 = document.getElementById("DownArrow");
    img3 = document.getElementById("UpArrow");
    img4 = document.getElementById("RightArrow");
    
    img1a = document.getElementById("LeftArrowOutline");
    img2a = document.getElementById("DownArrowOutline");
    img3a = document.getElementById("UpArrowOutline");
    img4a = document.getElementById("RightArrowOutline");
    
    BaseSequence = DefaultSequence;
}


function setupMenu() {
    'use strict';
    document.getElementById("main_start_screen").style.display = 'none';
    document.getElementById("main_setup_screen").style.display = 'block';
}


function backMenu() {
    'use strict';
    document.getElementById("main_start_screen").style.display = 'block';
    document.getElementById("main_results_screen").style.display = 'none';
    document.getElementById("main_setup_screen").style.display = 'none';
}


function startGame() {
    'use strict';
    
    HeightSequence = []; // Array of timings
    HitSequence = []; // Array of hits or misses
    
    MinimumValue = 0; // Start of the array
    MaximumValue = 1; // End of the live array
    CurrentValue = 0; // Current level
    
    RoundCounter = 0; // Variable holding rounds
    
    MutationMessage = 0; // Whether the mutation message is on
    
    document.getElementById("main_start_screen").style.display = 'none';
    document.getElementById("main_results_screen").style.display = 'none';
    document.getElementById("main_game_screen").style.display = 'block';
    
    BaseLength = BaseSequence.length;
    cleanseSequence();
    
    window.onkeydown = checkKey;
    canvas = document.getElementById("myCanvas");
	ctx = canvas.getContext("2d");
    
    countdownGame();
    TrackReady.play();
    IntervalSetcountdown = setInterval(function () { countdownGame(); }, 1000 / FPS);
    
}


function countdownGame() {
    'use strict';
    
    ctx.clearRect(0, 0, 800, 600);
    
    if (CountdownInteger === 0) {
        clearInterval(IntervalSetcountdown);
        CountdownInteger = 5;
        IntervalSet = setInterval(function () { gameLoop(); }, 1000 / FPS);
        CurrentTrack.play();
    } else {
        if (CountdownRound === 50) {
            CountdownRound = 0;
            CountdownInteger -= 1;
        }

        ctx.font = "50px Arial Black";
        ctx.fillStyle = "#fff";

        ctx.fillText('READY TO REPLICATE?', 400, 150);

        ctx.fillStyle = "#cc0066";
        ctx.beginPath();
        ctx.arc(400, 300, CountdownRound + 25, 0, 2 * Math.PI, false);
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.font = (CountdownRound * 2) + 20 + "px Arial Black";
        ctx.textAlign = "center";
        ctx.textBaseline = 'middle';
        ctx.fillText(CountdownInteger, 400, 295);
        
        CountdownRound += 1;
    }
     
}


function checkKey() {
    'use strict';
    
    var e = window.event;

    if (e.keyCode === 37 && HeightSequence[CurrentValue] < 400) {
        // left arrow
        if (BaseSequence[CurrentValue] === 0 && HeightSequence[CurrentValue] <= StartTolerance && HeightSequence[CurrentValue] >= EndTolerance) {
            HitSequence[CurrentValue] = 1;
        } else {
            HitSequence[CurrentValue] = 0;
            MutationMessage = MutationFrequency;
            mutationSound();
        }
        InputSequence[CurrentValue] = 0;
        CurrentValue += 1;
    } else if (e.keyCode === 40 && HeightSequence[CurrentValue] < 400) {
        // down arrow
        if (BaseSequence[CurrentValue] === 1 && HeightSequence[CurrentValue] <= StartTolerance && HeightSequence[CurrentValue] >= EndTolerance) {
            HitSequence[CurrentValue] = 1;
        } else {
            HitSequence[CurrentValue] = 0;
            MutationMessage = MutationFrequency;
            mutationSound();
        }
        InputSequence[CurrentValue] = 1;
        CurrentValue += 1;
    } else if (e.keyCode === 38 && HeightSequence[CurrentValue] < 400) {
        // up arrow
        if (BaseSequence[CurrentValue] === 2 && HeightSequence[CurrentValue] <= StartTolerance && HeightSequence[CurrentValue] >= EndTolerance) {
            HitSequence[CurrentValue] = 1;
        } else {
            HitSequence[CurrentValue] = 0;
            MutationMessage = MutationFrequency;
            mutationSound();
        }
        InputSequence[CurrentValue] = 2;
        CurrentValue += 1;
    } else if (e.keyCode === 39 && HeightSequence[CurrentValue] < 400) {
        // right arrow
        if (BaseSequence[CurrentValue] === 3 && HeightSequence[CurrentValue] <= StartTolerance && HeightSequence[CurrentValue] >= EndTolerance) {
            HitSequence[CurrentValue] = 1;
        } else {
            HitSequence[CurrentValue] = 0;
            MutationMessage = MutationFrequency;
            mutationSound();
        }
        InputSequence[CurrentValue] = 3;
        CurrentValue += 1;
    }
}


function generateSequence() { // Generate sequence
	'use strict';
    var i, LengthVal;
    LengthVal = SequenceLengths[SequenceLengthValue];
    BaseSequence.length = LengthVal;
    for (i = 0; i < SequenceLengths[SequenceLengthValue]; i++) {
        if (BaseSequence[i] !== 0 && BaseSequence[i] !== 1 && BaseSequence[i] !== 2 && BaseSequence[i] !== 3) {
            BaseSequence[i] = Math.floor(Math.random() * 4);
        }
    }
}


function cleanseSequence() { // Replace any sequence gaps with random numbers
	'use strict';
    var i;
    for (i = 0; i < BaseLength; i++) {
        if (BaseSequence[i] === 4) {BaseSequence[i] = Math.floor(Math.random() * 4); }
        HeightSequence[i] = 600;
    }
}


function getSum(total, num) {
    'use strict';
    return total + num;
}

function mutationSound() {
    'use strict';
    var i;
    
    i = Math.floor(Math.random() * 4);
    
    if (i === 0) {
        TrackMutation.play();
    }
}


function renderLoop() { // Loop displaying arrows
	'use strict';
    
    var i, j, LetterVal, RadiusBeat;
    
    ctx.clearRect(0, 0, 800, 600);
    
    /* Lines for sensitivity testing
    ctx.fillRect(0, 50, 800, 5);
    ctx.fillRect(0, 150, 800, 5);
    ctx.fillRect(0, 250, 800, 5);
    
    ctx.fillRect(0, 100, 800, 5);
    ctx.fillRect(0, 200, 800, 5);
    ctx.fillRect(0, 300, 800, 5);
    */
    
    // Placeholder arrows
    ctx.globalAlpha = 1;
    
    ctx.font = "30px Arial Black";
    
    ctx.drawImage(img1a, 125, 50);
    ctx.drawImage(img2a, 275, 50);
    ctx.drawImage(img3a, 425, 50);
    ctx.drawImage(img4a, 575, 50);
    
    ctx.font = "100px Arial Black";
    ctx.strokeStyle = "#339966";
    ctx.lineWidth = 5;
    ctx.globalAlpha = 0.6;
    
    ctx.strokeText('C', 175, 220);
    ctx.strokeText('A', 325, 220);
    ctx.strokeText('T', 475, 220);
    ctx.strokeText('G', 625, 220);
    
    ctx.fillStyle = "#fff";
    ctx.globalAlpha = 0.5;

    if (ToleranceVisible === 1) {
        ctx.fillRect(0, StartTolerance, 800, 3);
        ctx.fillRect(0, EndTolerance, 800, 3);
    }
    // ctx.fillRect(0, HeightSequence[i], 800, 5);

    ctx.globalAlpha = 1;
    
    // Actual arrows
    for (i = 0; i < MaximumValue; i++) {
        AlphaValue = 1 - (HeightSequence[i] / 600);
        ctx.globalAlpha = AlphaValue;
        
        if (HitSequence[i] === 1 && i < HitLength) {
            ctx.fillStyle = "#339966";
        } else if (HitSequence[i] === 0 && i < HitLength) {
            ctx.fillStyle = "#cc0066";
        }
        
        switch (BaseSequence[i]) {
        case 0:
            if (i < HitLength && HeightSequence[i] > 0) {
                ctx.beginPath();
                ctx.arc(175, HeightSequence[i], 60, 0, 2 * Math.PI, false);
                ctx.fill();
            }
            ctx.drawImage(img1, 125, HeightSequence[i] - 50);
            ctx.font = "100px Arial Black";
            ctx.fillStyle = "#000";
            // ctx.fillText('C', 175, HeightSequence[i] + 50);
   
            break;
        case 1:
            if (i < HitLength && HeightSequence[i] > 0) {
                ctx.beginPath();
                ctx.arc(325, HeightSequence[i], 60, 0, 2 * Math.PI, false);
                ctx.fill();
            }
            ctx.drawImage(img2, 275, HeightSequence[i] - 50);
            ctx.font = "100px Arial Black";
            ctx.fillStyle = "#000";
            // ctx.fillText('A', 325, HeightSequence[i] + 50);
            break;
        case 2:
            if (i < HitLength && HeightSequence[i] > -100) {
                ctx.beginPath();
                ctx.arc(475, HeightSequence[i], 60, 0, 2 * Math.PI, false);
                ctx.fill();
            }
            ctx.drawImage(img3, 425, HeightSequence[i] - 50);
            ctx.font = "100px Arial Black";
            ctx.fillStyle = "#000";
            // ctx.fillText('T', 475, HeightSequence[i] + 50);
            break;
        case 3:
            if (i < HitLength && HeightSequence[i] > -100) {
                ctx.beginPath();
                ctx.arc(625, HeightSequence[i], 60, 0, 2 * Math.PI, false);
                ctx.fill();
            }
            ctx.drawImage(img4, 575, HeightSequence[i] - 50);
            ctx.font = "100px Arial Black";
            ctx.fillStyle = "#000";
            // ctx.fillText('G', 625, HeightSequence[i] + 50);
            break;
        default:
        }
    
    }
    
    // Output of letters
    ctx.globalAlpha = 1;
    ctx.font = "30px Arial Black";
    
    for (j = 0; j < HitLength; j++) {
        
        if (HitSequence[j] === 1) {
            ctx.fillStyle = "#339966";
        } else {
            ctx.fillStyle = "#cc0066";
        }
        
        
        switch (InputSequence[j]) {
        case 0:
            LetterVal = 'C';
            break;
        case 1:
            LetterVal = 'A';
            break;
        case 2:
            LetterVal = 'T';
            break;
        case 3:
            LetterVal = 'G';
            break;
        case 4:
            LetterVal = '-';
            break;
        default:
            LetterVal = '?';
        }
        
        if (j < 15) {
            ctx.fillRect(50 + (45 * j), 400, 40, 40);
            ctx.fillStyle = "#fff";
            ctx.fillText(LetterVal, 70 + (45 * j), 420);
        } else if (j < 30) {
            ctx.fillRect(50 + (45 * (j - 15)), 450, 40, 40);
            ctx.fillStyle = "#fff";
            ctx.fillText(LetterVal, 70 + (45 * (j - 15)), 470);
        } else if (j < 45) {
            ctx.fillRect(50 + (45 * (j - 30)), 500, 40, 40);
            ctx.fillStyle = "#fff";
            ctx.fillText(LetterVal, 70 + (45 * (j - 30)), 520);
        } else {
            ctx.fillRect(50 + (45 * (j - 45)), 550, 40, 40);
            ctx.fillStyle = "#fff";
            ctx.fillText(LetterVal, 70 + (45 * (j - 45)), 570);
        }
    }
    
    // Pulsing beat per round
    ctx.fillStyle = "#fff";
    ctx.globalAlpha = 0.7;
    
    
    if (40 - (RoundCounter) < 0) {
        RadiusBeat = 0;
    } else {
        RadiusBeat = 40 - (RoundCounter);
    }
    
    if (DifficultySetting !== 0) {
        ctx.beginPath();
        ctx.arc(50, 100, RadiusBeat, 0, 2 * Math.PI, false);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(750, 100, RadiusBeat, 0, 2 * Math.PI, false);
        ctx.fill();
    }
    
    ctx.globalAlpha = MutationMessage / MutationFrequency;
    
    if (MutationMessage > 0) {
        ctx.font = "110px Arial Black";
        ctx.fillStyle = "#cc0066";
        ctx.fillText("MUTATION!", 400, 330);
    }
    
    MutationMessage -= 1;
    
    ctx.globalAlpha = 1;
}


function gameLoop() { // Start sequence loop for letter calculations
	'use strict';
    var i;
    
    HitLength = HitSequence.length;
    InputLength = InputSequence.length;
    
    for (i = MinimumValue; i < MaximumValue; i++) {
        
        if (HeightSequence[i] > -100) {
            HeightSequence[i] -= 5;
        }
        
        if (HeightSequence[CurrentValue] === EndTolerance) {
            
            if (HitLength <= CurrentValue) {
                HitSequence[CurrentValue] = 0;
                InputSequence[CurrentValue] = 4;
                MutationMessage = MutationFrequency;
                mutationSound();
            }
            
            CurrentValue += 1;
        }
        
    }
    
    MinimumValue = 0; // CurrentValue - 1;
    
    RoundCounter += 1;
    
    if (HeightSequence[BaseLength - 1] < -50) { //  || BaseLength === HitLength
        
        clearInterval(IntervalSet);
        endGame();
    
    }
    
    // Reset round
    if (RoundCounter === RoundLimit) {
        RoundCounter = 0;
        // MutationMessage = 0;
        
        if (MaximumValue < BaseLength) {
            MaximumValue += 1;
        }
    }
    
    renderLoop();
}


function endGame() { // Routine called when game is ended
	'use strict';
    
    var i, j;
    
    CurrentTrack.pause();
    CurrentTrack.currentTime = 0;
    
    document.getElementById("main_game_screen").style.display = 'none';
    document.getElementById("main_results_screen").style.display = 'block';
    ctx.clearRect(0, 0, 800, 600);

    ResultPercent = Math.round(HitSequence.reduce(getSum) * 100 / BaseLength);

    document.getElementById("results_percentage_screen").innerHTML = ResultPercent + "%";

    if (ResultPercent >= FidelityThreshold && ResultPercent !== 0) {
        document.getElementById("results_text_screen").innerHTML = "High-Fidelity Replicator!";
        document.getElementById("results_text_screen").style.color = '#339966';
        TrackHighFidelity.play();
    } else {
        document.getElementById("results_text_screen").innerHTML = "Hypermutator!";
        document.getElementById("results_text_screen").style.color = '#cc0066';
        
        TrackHypermutator.play();
    }

    InputLength = InputSequence.length;
    HitLength = HitSequence.length;
    
    document.getElementById("box_container_screen").style.height = (InputLength / 15 * 50) + "px";
    document.getElementById("header_results_screen").style.marginTop = ((60 - InputLength) / 15 * 30) + "px";
    
    for (i = 0; i < InputLength; i++) {

        document.getElementById("box_letter_" + i).style.display = "block";
        
        if (HitSequence[i] === 1) {
            document.getElementById("box_letter_" + i).style.backgroundColor = '#339966';
        } else {
            document.getElementById("box_letter_" + i).style.backgroundColor = '#cc0066';
        }

        switch (InputSequence[i]) {
        case 0:
            document.getElementById("result_letter_" + i).innerHTML = 'C';
            break;
        case 1:
            document.getElementById("result_letter_" + i).innerHTML = 'A';
            break;
        case 2:
            document.getElementById("result_letter_" + i).innerHTML = 'T';
            break;
        case 3:
            document.getElementById("result_letter_" + i).innerHTML = 'G';
            break;
        case 4:
            document.getElementById("result_letter_" + i).innerHTML = '-';
            break;
        default:
            document.getElementById("result_letter_" + i).innerHTML = '?';
        }
    }
    
    for (j = InputLength; j < 60; j++) {
        document.getElementById("box_letter_" + j).style.display = "none";
    }
    
    
    if (ResultPercent >= CarryThreshold) {
        BaseSequence = InputSequence;
    }
    InputSequence = [];
    
}