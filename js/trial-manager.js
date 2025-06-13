// Enhanced trial manager with cascading form logic and data-driven dropdowns

// Global arrays for dropdown data
let availableClasses = [];
let availableJudges = [];

// Load dropdown data from Excel file
function loadDropdownData() {
    if (dogData && dogData.length > 0) {
        // Extract unique classes from column I (class field)
        availableClasses = [...new Set(dogData.map(dog => dog.class).filter(cls => cls && cls.trim()))]
            .sort();
        
        // Extract unique judges from column K (judge field)  
        availableJudges = [...new Set(dogData.map(dog => dog.judge).filter(judge => judge && judge.trim()))]
            .sort();
    }
}

// Create new trial
function createNewTrial() {
    currentTrialId = generateId();
    document.getElementById('trialTitle').textContent = 'New Trial Setup';
    document.getElementById('trialName').value = '';
    document.getElementById('trialDays').value = '';
    document.getElementById('daysContainer').innerHTML = '';
    document.getElementById('saveTrialSection').style.display = 'none';
    document.getElementById('entryFormLink').style.display = 'none';
    
    // Reset global variables
    trialConfig = [];
    entryResults = [];
    runningOrders = {};
    digitalScores = {};
    digitalScoreData = {};
    totalDays = 0;
    savedDays = 0;
    trialScents = ['', '', '', ''];
    
    // Load dropdown data
    loadDropdownData();
    
    showTab('setup', document.querySelector('.nav-tab'));
}

// Generate days configuration
function generateDays() {
    const days = parseInt(document.getElementById('trialDays').value);
    if (!days || days < 1 || days > 30) {
        showStatusMessage('Please enter a valid number of days (1-30)', 'error');
        return;
    }
    
    totalDays = days;
    savedDays = 0;
    
    const container = document.getElementById('daysContainer');
    container.innerHTML = '';
    
    // Create progress indicator
    const progressDiv = createProgressIndicator(days);
    container.appendChild(progressDiv);
    
    for (let i = 1; i <= days; i++) {
        const dayDiv = createEnhancedDayConfig(i);
        container.appendChild(dayDiv);
    }
    
    updateSaveButton();
}

// Create progress indicator
function createProgressIndicator(totalDays) {
    const progressDiv = document.createElement('div');
    progressDiv.className = 'setup-progress';
    progressDiv.id = 'setupProgress';
    
    let html = '';
    for (let i = 1; i <= totalDays; i++) {
        if (i > 1) {
            html += '<div class="progress-connector"></div>';
        }
        html += `<div class="progress-step" id="progressStep${i}">${i}</div>`;
    }
    
    progressDiv.innerHTML = html;
    return progressDiv;
}

// Create enhanced day configuration
function createEnhancedDayConfig(dayNum) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day-container';
    dayDiv.id = `day${dayNum}`;
    
    dayDiv.innerHTML = `
        <div class="day-header-enhanced">Day ${dayNum} Configuration</div>
        <div class="form-level level-1">
            <div class="level-header">Day ${dayNum} Setup</div>
            <div class="level-content">
                <div class="config-field">
                    <label class="config-label">Date:</label>
                    <input type="date" class="config-input" id="date${dayNum}" onchange="updateDayProgress(${dayNum})">
                </div>
                <div class="config-field">
                    <label class="config-label">How many classes for Day ${dayNum}?</label>
                    <input type="number" class="config-input rounds-number-input" id="classCount${dayNum}" 
                           min="1" max="20" placeholder="Number of classes" 
                           onchange="generateClassesForDay(${dayNum}, this.value)">
                </div>
            </div>
        </div>
        <div id="classesContainer${dayNum}" class="classes-container"></div>
    `;
    
    return dayDiv;
}

// Generate classes for a specific day
function generateClassesForDay(dayNum, classCount) {
    const count = parseInt(classCount);
    if (!count || count < 1) {
        document.getElementById(`classesContainer${dayNum}`).innerHTML = '';
        updateDayProgress(dayNum);
        return;
    }
    
    const container = document.getElementById(`classesContainer${dayNum}`);
    container.innerHTML = '';
    
    for (let i = 1; i <= count; i++) {
        const classDiv = createClassConfig(dayNum, i);
        container.appendChild(classDiv);
    }
    
    updateDayProgress(dayNum);
}

// Create class configuration
function createClassConfig(dayNum, classNum) {
    const classDiv = document.createElement('div');
    classDiv.className = 'form-level level-2';
    classDiv.id = `day${dayNum}class${classNum}`;
    
    classDiv.innerHTML = `
        <div class="class-header-enhanced">
            <div class="class-title">Class ${classNum}</div>
            <button type="button" class="remove-class" onclick="removeClass('day${dayNum}class${classNum}', ${dayNum})">Remove</button>
        </div>
        <div class="level-content">
            <div class="config-field">
                <label class="config-label">Select Class:</label>
                <div class="dropdown-input">
                    <input type="text" class="config-input" id="className${dayNum}_${classNum}" 
                           placeholder="Type to search classes..." 
                           onkeyup="filterClassDropdown(this, ${dayNum}, ${classNum})"
                           onblur="hideDropdown(this)"
                           onchange="onClassSelected(${dayNum}, ${classNum})">
                    <div class="dropdown-suggestions" id="classSuggestions${dayNum}_${classNum}"></div>
                </div>
            </div>
            <div class="config-field">
                <label class="config-label">How many rounds for this class?</label>
                <input type="number" class="config-input rounds-number-input" 
                       id="roundCount${dayNum}_${classNum}" min="1" max="10" 
                       placeholder="#" onchange="generateRoundsForClass(${dayNum}, ${classNum}, this.value)">
            </div>
        </div>
        <div id="roundsContainer${dayNum}_${classNum}" class="rounds-container"></div>
    `;
    
    return classDiv;
}

// Filter class dropdown
function filterClassDropdown(input, dayNum, classNum) {
    const query = input.value.toLowerCase();
    const suggestions = document.getElementById(`classSuggestions${dayNum}_${classNum}`);
    
    if (query.length === 0) {
        suggestions.classList.remove('active');
        return;
    }
    
    const filteredClasses = availableClasses.filter(cls => 
        cls.toLowerCase().includes(query)
    );
    
    if (filteredClasses.length === 0) {
        suggestions.classList.remove('active');
        return;
    }
    
    let html = '';
    filteredClasses.forEach(cls => {
        html += `<div class="suggestion-item" onclick="selectClass('${cls}', ${dayNum}, ${classNum})">${cls}</div>`;
    });
    
    suggestions.innerHTML = html;
    suggestions.classList.add('active');
}

// Select class from dropdown
function selectClass(className, dayNum, classNum) {
    document.getElementById(`className${dayNum}_${classNum}`).value = className;
    document.getElementById(`classSuggestions${dayNum}_${classNum}`).classList.remove('active');
    onClassSelected(dayNum, classNum);
}

// On class selected
function onClassSelected(dayNum, classNum) {
    updateDayProgress(dayNum);
    updateSaveButton();
}

// Generate rounds for class
function generateRoundsForClass(dayNum, classNum, roundCount) {
    const count = parseInt(roundCount);
    if (!count || count < 1) {
        document.getElementById(`roundsContainer${dayNum}_${classNum}`).innerHTML = '';
        updateDayProgress(dayNum);
        return;
    }
    
    const container = document.getElementById(`roundsContainer${dayNum}_${classNum}`);
    container.innerHTML = '';
    
    for (let i = 1; i <= count; i++) {
        const roundDiv = createRoundConfig(dayNum, classNum, i);
        container.appendChild(roundDiv);
    }
    
    updateDayProgress(dayNum);
}

// Create round configuration
function createRoundConfig(dayNum, classNum, roundNum) {
    const roundDiv = document.createElement('div');
    roundDiv.className = 'form-level level-3';
    
    roundDiv.innerHTML = `
        <div class="level-header">Round ${roundNum}</div>
        <div class="level-content">
            <div class="round-item">
                <div class="round-label">Judge:</div>
                <div class="round-judge-input">
                    <div class="dropdown-input">
                        <input type="text" class="config-input" 
                               id="judge${dayNum}_${classNum}_${roundNum}" 
                               placeholder="Type to search judges..." 
                               onkeyup="filterJudgeDropdown(this, ${dayNum}, ${classNum}, ${roundNum})"
                               onblur="hideDropdown(this)"
                               onchange="onJudgeSelected(${dayNum}, ${classNum}, ${roundNum})">
                        <div class="dropdown-suggestions" id="judgeSuggestions${dayNum}_${classNum}_${roundNum}"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return roundDiv;
}

// Filter judge dropdown
function filterJudgeDropdown(input, dayNum, classNum, roundNum) {
    const query = input.value.toLowerCase();
    const suggestions = document.getElementById(`judgeSuggestions${dayNum}_${classNum}_${roundNum}`);
    
    if (query.length === 0) {
        suggestions.classList.remove('active');
        return;
    }
    
    const filteredJudges = availableJudges.filter(judge => 
        judge.toLowerCase().includes(query)
    );
    
    if (filteredJudges.length === 0) {
        suggestions.classList.remove('active');
        return;
    }
    
    let html = '';
    filteredJudges.forEach(judge => {
        html += `<div class="suggestion-item" onclick="selectJudge('${judge}', ${dayNum}, ${classNum}, ${roundNum})">${judge}</div>`;
    });
    
    suggestions.innerHTML = html;
    suggestions.classList.add('active');
}

// Select judge from dropdown
function selectJudge(judgeName, dayNum, classNum, roundNum) {
    document.getElementById(`judge${dayNum}_${classNum}_${roundNum}`).value = judgeName;
    document.getElementById(`judgeSuggestions${dayNum}_${classNum}_${roundNum}`).classList.remove('active');
    onJudgeSelected(dayNum, classNum, roundNum);
}

// On judge selected
function onJudgeSelected(dayNum, classNum, roundNum) {
    updateDayProgress(dayNum);
    updateSaveButton();
}

// Hide dropdown
function hideDropdown(input) {
    setTimeout(() => {
        const suggestions = input.nextElementSibling;
        if (suggestions) {
            suggestions.classList.remove('active');
        }
    }, 200);
}

// Remove class
function removeClass(classId, dayNum) {
    const element = document.getElementById(classId);
    if (element && confirm('Remove this class and all its rounds?')) {
        element.remove();
        updateDayProgress(dayNum);
        updateSaveButton();
    }
}

// Update day progress
function updateDayProgress(dayNum) {
    const progressStep = document.getElementById(`progressStep${dayNum}`);
    if (!progressStep) return;
    
    const date = document.getElementById(`date${dayNum}`)?.value;
    const classCount = document.getElementById(`classCount${dayNum}`)?.value;
    
    let isComplete = date && classCount;
    
    if (isComplete && classCount > 0) {
        // Check if all classes and rounds are configured
        const classesContainer = document.getElementById(`classesContainer${dayNum}`);
        const classes = classesContainer?.children || [];
        
        for (let i = 0; i < classes.length; i++) {
            const classDiv = classes[i];
            const classInput = classDiv.querySelector(`input[id^="className${dayNum}_"]`);
            const roundCountInput = classDiv.querySelector(`input[id^="roundCount${dayNum}_"]`);
            
            if (!classInput?.value || !roundCountInput?.value) {
                isComplete = false;
                break;
            }
            
            // Check if all rounds have judges
            const roundsContainer = classDiv.querySelector(`div[id^="roundsContainer${dayNum}_"]`);
            const judgeInputs = roundsContainer?.querySelectorAll(`input[id^="judge${dayNum}_"]`) || [];
            
            for (let judge of judgeInputs) {
                if (!judge.value) {
                    isComplete = false;
                    break;
                }
            }
            
            if (!isComplete) break;
        }
    }
    
    if (isComplete) {
        progressStep.classList.add('completed');
        progressStep.classList.remove('active');
    } else {
        progressStep.classList.remove('completed');
        progressStep.classList.add('active');
    }
}

// Update save button visibility
function updateSaveButton() {
    let allConfigured = true;
    
    for (let i = 1; i <= totalDays; i++) {
        const progressStep = document.getElementById(`progressStep${i}`);
        if (!progressStep?.classList.contains('completed')) {
            allConfigured = false;
            break;
        }
    }
    
    const saveSection = document.getElementById('saveTrialSection');
    if (saveSection) {
        saveSection.style.display = allConfigured && totalDays > 0 ? 'block' : 'none';
    }
}

// Save trial data
function saveTrialData() {
    // Build trial configuration from cascading form
    trialConfig = [];
    
    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
        const date = document.getElementById(`date${dayNum}`)?.value;
        const classCount = parseInt(document.getElementById(`classCount${dayNum}`)?.value || 0);
        
        for (let classNum = 1; classNum <= classCount; classNum++) {
            const className = document.getElementById(`className${dayNum}_${classNum}`)?.value;
            const roundCount = parseInt(document.getElementById(`roundCount${dayNum}_${classNum}`)?.value || 0);
            
            for (let roundNum = 1; roundNum <= roundCount; roundNum++) {
                const judge = document.getElementById(`judge${dayNum}_${classNum}_${roundNum}`)?.value;
                
                if (date && className && judge) {
                    trialConfig.push({
                        date: date,
                        location: '', // Will be filled in application form
                        className: className,
                        judge: judge,
                        roundNum: roundNum,
                        maxEntries: 50, // Default value
                        day: dayNum
                    });
                }
            }
        }
    }
    
    // Save trial data
    const trialData = {
        name: document.getElementById('trialName').value,
        config: trialConfig,
        results: entryResults,
        runningOrders: runningOrders,
        digitalScores: digitalScores,
        digitalScoreData: digitalScoreData,
        scents: trialScents,
        owner: currentUser.username,
        created: new Date().toISOString()
    };
    
    // Save to user's trials
    const userTrials = JSON.parse(localStorage.getItem(`trials_${currentUser.username}`) || '{}');
    userTrials[currentTrialId] = trialData;
    localStorage.setItem(`trials_${currentUser.username}`, JSON.stringify(userTrials));
    
    // Save to public trials for entry form access
    const publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    publicTrials[currentTrialId] = trialData;
    localStorage.setItem('publicTrials', JSON.stringify(publicTrials));
    
    // Show entry form link
    const entryFormLink = document.getElementById('entryFormLink');
    if (entryFormLink) {
        entryFormLink.style.display = 'block';
        const baseUrl = window.location.origin + window.location.pathname;
        const shareableURL = document.getElementById('shareableURL');
        if (shareableURL) {
            shareableURL.value = `${baseUrl}?trial=${currentTrialId}&mode=entry`;
        }
    }
    
    showStatusMessage('Trial saved successfully!', 'success');
    loadUserTrials();
    updateTrialOptions();
}

// Initialize dropdown data when utils loads data
function onDataLoaded() {
    loadDropdownData();
}

// Call this when dogData is loaded in utils.js
if (typeof window !== 'undefined') {
    window.addEventListener('dogDataLoaded', onDataLoaded);
}
