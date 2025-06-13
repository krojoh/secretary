// Enhanced trial manager with working cascading form logic and data-driven dropdowns

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
            
        console.log('Loaded classes:', availableClasses);
        console.log('Loaded judges:', availableJudges);
    } else {
        // Fallback classes and judges if no data
        availableClasses = ['Novice', 'Advanced', 'Excellent', 'Master'];
        availableJudges = ['Judge Smith', 'Judge Johnson', 'Judge Williams', 'Judge Brown', 'Judge Davis'];
        console.warn('No dog data available for dropdown loading, using fallback data');
    }
}

// Load user trials
function loadUserTrials() {
    const container = document.getElementById('myTrialsList');
    if (!container || !currentUser) return;
    
    const userTrials = JSON.parse(localStorage.getItem(`trials_${currentUser.username}`) || '{}');
    
    if (Object.keys(userTrials).length === 0) {
        container.innerHTML = '<p class="no-data">No trials yet. Create your first trial!</p>';
        return;
    }
    
    let html = '';
    for (const [trialId, trial] of Object.entries(userTrials)) {
        const created = new Date(trial.created).toLocaleDateString();
        const days = trial.config ? getUniqueDays(trial.config).length : 0;
        const entries = trial.results ? trial.results.length : 0;
        
        const trialName = trial.name || 'Untitled Trial';
        const trialStatus = (trial.config && trial.config.length > 0) ? 'Configured' : 'Setup Incomplete';
        const statusColor = (trial.config && trial.config.length > 0) ? 'var(--success-color)' : 'var(--warning-color)';
        
        html += `
            <div class="trial-item">
                <div class="trial-info">
                    <div class="trial-name">${trialName}</div>
                    <div class="trial-meta">Created: ${created} | Days: ${days} | Entries: ${entries}</div>
                    <div class="trial-status" style="color: ${statusColor};">${trialStatus}</div>
                </div>
                <div class="trial-actions">
                    <button class="btn btn-primary" onclick="editTrial('${trialId}')">✏️ Edit</button>
                    ${trial.config && trial.config.length > 0 ? 
                        `<button class="btn btn-success" onclick="copyTrialLink('${trialId}')">🔗 Copy Link</button>` : ''}
                    <button class="btn btn-warning" onclick="duplicateTrial('${trialId}')">📋 Duplicate</button>
                    <button class="btn btn-danger" onclick="deleteTrial('${trialId}')">🗑️ Delete</button>
                </div>
            </div>
        `;
    }
    container.innerHTML = html;
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
    showStatusMessage('New trial created - ready for setup', 'success');
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
    showStatusMessage(`Generated ${days} day configuration forms`, 'success');
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
                    <label class="config-label">Location:</label>
                    <input type="text" class="config-input" id="location${dayNum}" placeholder="Trial location" onchange="updateDayProgress(${dayNum})">
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
    
    for (let i =
