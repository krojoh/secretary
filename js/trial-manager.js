// Create new trial
function createNewTrial() {
    currentTrialId = generateId();
    document.getElementById('trialTitle').textContent = 'New Trial Setup';
    document.getElementById('trialName').value = '';
    document.getElementById('trialDays').value = '';
    document.getElementById('daysContainer').innerHTML = '';
    document.getElementById('saveTrialSection').style.display = 'none';
    document.getElementById('entryFormLink').style.display = 'none';
    
    // Reset scent inputs
    for (let i = 1; i <= 4; i++) {
        const scentInput = document.getElementById(`scent${i}`);
        if (scentInput) scentInput.value = '';
    }
    
    // Reset global variables
    trialConfig = [];
    entryResults = [];
    runningOrders = {};
    digitalScores = {};
    digitalScoreData = {};
    totalDays = 0;
    savedDays = 0;
    trialScents = ['', '', '', ''];
    
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
    
    for (let i = 1; i <= days; i++) {
        const dayDiv = createDayConfig(i);
        container.appendChild(dayDiv);
    }
    
    updateSaveButton();
}

// Create day configuration element
function createDayConfig(dayNum) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day-config';
    dayDiv.id = `day${dayNum}`;
    
    dayDiv.innerHTML = `
        <div class="day-header">Day ${dayNum} Configuration</div>
        <div class="form-group">
            <label class="label">Date:</label>
            <input type="date" id="date${dayNum}" onchange="updateSaveButton()">
        </div>
        <div class="form-group">
            <label class="label">Location:</label>
            <input type="text" id="location${dayNum}" placeholder="Enter location" onchange="updateSaveButton()">
        </div>
        <div id="classes${dayNum}">
            <!-- Classes will be added here -->
        </div>
        <button type="button" class="btn btn-primary" onclick="addClass(${dayNum})">➕ Add Class</button>
    `;
    
    return dayDiv;
}

// Add class to day
function addClass(dayNum) {
    const classesContainer = document.getElementById(`classes${dayNum}`);
    const classNum = classesContainer.children.length + 1;
    
    const classDiv = document.createElement('div');
    classDiv.className = 'class-config';
    classDiv.id = `day${dayNum}class${classNum}`;
    
    classDiv.innerHTML = `
        <div class="class-header">
            <div class="class-name">Class ${classNum}</div>
            <button type="button" class="remove-class-btn" onclick="removeClass('day${dayNum}class${classNum}')">Remove</button>
        </div>
        <div class="class-fields">
            <div class="field-group">
                <label>Class Name:</label>
                <input type="text" id="className${dayNum}_${classNum}" placeholder="e.g., Patrol 1" onchange="updateSaveButton()">
            </div>
            <div class="field-group">
                <label>Judge:</label>
                <input type="text" id="judge${dayNum}_${classNum}" placeholder="Judge name" onchange="updateSaveButton()">
            </div>
            <div class="field-group">
                <label>Rounds:</label>
                <input type="number" id="rounds${dayNum}_${classNum}" min="1" max="10" placeholder="Number of rounds" onchange="updateSaveButton()">
            </div>
            <div class="field-group">
                <label>Max Entries:</label>
                <input type="number" id="maxEntries${dayNum}_${classNum}" min="1" placeholder="Max entries per round" onchange="updateSaveButton()">
            </div>
        </div>
    `;
    
    classesContainer.appendChild(classDiv);
    updateSaveButton();
}

// Remove class
function removeClass(classId) {
    const element = document.getElementById(classId);
    if (element && confirm('Remove this class?')) {
        element.remove();
        updateSaveButton();
    }
}

// Update save button visibility
function updateSaveButton() {
    let allConfigured = true;
    
    for (let i = 1; i <= totalDays; i++) {
        const date = document.getElementById(`date${i}`);
        const location = document.getElementById(`location${i}`);
        
        if (!date?.value || !location?.value) {
            allConfigured = false;
            break;
        }
        
        const classesContainer = document.getElementById(`classes${i}`);
        if (!classesContainer || classesContainer.children.length === 0) {
            allConfigured = false;
            break;
        }
        
        // Check if all classes are configured
        for (let j = 0; j < classesContainer.children.length; j++) {
            const classNum = j + 1;
            const className = document.getElementById(`className${i}_${classNum}`);
            const judge = document.getElementById(`judge${i}_${classNum}`);
            const rounds = document.getElementById(`rounds${i}_${classNum}`);
            const maxEntries = document.getElementById(`maxEntries${i}_${classNum}`);
            
            if (!className?.value || !judge?.value || !rounds?.value || !maxEntries?.value) {
                allConfigured = false;
                break;
            }
        }
        
        if (!allConfigured) break;
    }
    
    const saveSection = document.getElementById('saveTrialSection');
    if (saveSection) {
        saveSection.style.display = allConfigured ? 'block' : 'none';
    }
}

// Save trial data
function saveTrialData() {
    // Get scents
    trialScents = [];
    for (let i = 1; i <= 4; i++) {
        const scentInput = document.getElementById(`scent${i}`);
        trialScents.push(scentInput ? scentInput.value.trim() : '');
    }
    
    // Build trial configuration
    trialConfig = [];
    for (let i = 1; i <= totalDays; i++) {
        const date = document.getElementById(`date${i}`).value;
        const location = document.getElementById(`location${i}`).value;
        const classesContainer = document.getElementById(`classes${i}`);
        
        for (let j = 0; j < classesContainer.children.length; j++) {
            const classNum = j + 1;
            const className = document.getElementById(`className${i}_${classNum}`).value;
            const judge = document.getElementById(`judge${i}_${classNum}`).value;
            const rounds = parseInt(document.getElementById(`rounds${i}_${classNum}`).value);
            const maxEntries = parseInt(document.getElementById(`maxEntries${i}_${classNum}`).value);
            
            for (let round = 1; round <= rounds; round++) {
                trialConfig.push({
                    date: date,
                    location: location,
                    className: className,
                    judge: judge,
                    roundNum: round,
                    maxEntries: maxEntries,
                    day: i
                });
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

// Edit existing trial
function editTrial(trialId) {
    const userTrials = JSON.parse(localStorage.getItem(`trials_${currentUser.username}`) || '{}');
    const trial = userTrials[trialId];
    
    if (!trial) {
        showStatusMessage('Trial not found', 'error');
        return;
    }
    
    currentTrialId = trialId;
    trialConfig = trial.config || [];
    entryResults = trial.results || [];
    runningOrders = trial.runningOrders || {};
    digitalScores = trial.digitalScores || {};
    digitalScoreData = trial.digitalScoreData || {};
    trialScents = trial.scents || ['', '', '', ''];
    
    // Populate form with existing data
    document.getElementById('trialTitle').textContent = `Edit: ${trial.name || 'Untitled Trial'}`;
    document.getElementById('trialName').value = trial.name || '';
    
    // Load scents if available
    if (trial.scents) {
        for (let i = 0; i < 4; i++) {
            const scentInput = document.getElementById(`scent${i + 1}`);
            if (scentInput) scentInput.value = trial.scents[i] || '';
        }
    }
    
    if (trialConfig.length > 0) {
        const maxDay = getMaxDay(trialConfig);
        document.getElementById('trialDays').value = maxDay;
        totalDays = maxDay;
        savedDays = maxDay;
        
        generateDays();
        setTimeout(() => populateExistingTrialData(), 100);
        
        // Show entry form link if trial is complete
        if (trial.config && trial.config.length > 0) {
            const entryFormLink = document.getElementById('entryFormLink');
            if (entryFormLink) {
                entryFormLink.style.display = 'block';
                const baseUrl = window.location.origin + window.location.pathname;
                const shareableURL = document.getElementById('shareableURL');
                if (shareableURL) {
                    shareableURL.value = `${baseUrl}?trial=${trialId}&mode=entry`;
                }
            }
        }
    }
    
    updateTrialOptions();
    showTab('setup', document.querySelector('.nav-tab'));
}

// Duplicate trial
function duplicateTrial(trialId) {
    const userTrials = JSON.parse(localStorage.getItem(`trials_${currentUser.username}`) || '{}');
    const trial = userTrials[trialId];
    
    if (!trial) {
        showStatusMessage('Trial not found', 'error');
        return;
    }
    
    const newTrialName = prompt('Enter name for the duplicated trial:', trial.name + ' (Copy)');
    if (!newTrialName) return;
    
    const newTrialId = generateId();
    const duplicatedTrial = JSON.parse(JSON.stringify(trial));
    duplicatedTrial.name = newTrialName;
    duplicatedTrial.created = new Date().toISOString();
    duplicatedTrial.results = [];
    duplicatedTrial.digitalScores = {};
    duplicatedTrial.digitalScoreData = {};
    
    userTrials[newTrialId] = duplicatedTrial;
    localStorage.setItem(`trials_${currentUser.username}`, JSON.stringify(userTrials));
    
    const publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    publicTrials[newTrialId] = duplicatedTrial;
    localStorage.setItem('publicTrials', JSON.stringify(publicTrials));
    
    loadUserTrials();
    showStatusMessage(`Trial duplicated as "${newTrialName}"`, 'success');
}

// Delete trial
function deleteTrial(trialId) {
    if (!confirm('Are you sure you want to delete this trial? This action cannot be undone.')) {
        return;
    }
    
    const userTrials = JSON.parse(localStorage.getItem(`trials_${currentUser.username}`) || '{}');
    delete userTrials[trialId];
    localStorage.setItem(`trials_${currentUser.username}`, JSON.stringify(userTrials));
    
    // Also remove from public trials
    const publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    delete publicTrials[trialId];
    localStorage.setItem('publicTrials', JSON.stringify(publicTrials));
    
    loadUserTrials();
    showStatusMessage('Trial deleted successfully', 'success');
}

// Copy trial link
function copyTrialLink(trialId) {
    const baseUrl = window.location.origin + window.location.pathname;
    const link = `${baseUrl}?trial=${trialId}&mode=entry`;
    
    navigator.clipboard.writeText(link).then(() => {
        showStatusMessage('Entry form link copied to clipboard!', 'success');
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = link;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showStatusMessage('Entry form link copied to clipboard!', 'success');
    });
}

// Export trial configuration
function exportTrialConfig() {
    if (trialConfig.length === 0) {
        showStatusMessage('No trial configuration to export', 'warning');
        return;
    }
    
    const exportData = {
        name: document.getElementById('trialName').value || 'Exported Trial',
        config: trialConfig,
        scents: trialScents,
        exportDate: new Date().toISOString()
    };
    
    const exportJson = JSON.stringify(exportData, null, 2);
    const filename = (exportData.name || 'trial_config').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.json';
    
    downloadFile(exportJson, filename, 'application/json');
    showStatusMessage('Trial configuration exported successfully', 'success');
}

// Import trial configuration
function importTrialConfig(fileInput) {
    const file = fileInput.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (importedData.config && Array.isArray(importedData.config)) {
                if (confirm('This will replace the current trial configuration. Continue?')) {
                    trialConfig = importedData.config;
                    trialScents = importedData.scents || ['', '', '', ''];
                    
                    // Update form based on imported config
                    if (trialConfig.length > 0) {
                        const maxDay = getMaxDay(trialConfig);
                        document.getElementById('trialDays').value = maxDay;
                        totalDays = maxDay;
                        savedDays = maxDay;
                        
                        generateDays();
                        setTimeout(() => populateExistingTrialData(), 100);
                    }
                    
                    // Load scents
                    for (let i = 0; i < 4; i++) {
                        const scentInput = document.getElementById(`scent${i + 1}`);
                        if (scentInput) scentInput.value = trialScents[i] || '';
                    }
                    
                    updateTrialOptions();
                    showStatusMessage('Trial configuration imported successfully', 'success');
                }
            } else {
                throw new Error('Invalid trial configuration format');
            }
        } catch (error) {
            showStatusMessage(`Error importing trial configuration: ${error.message}`, 'error');
        }
    };
    reader.readAsText(file);
}

// Populate existing trial data
function populateExistingTrialData() {
    // Group config by day and class
    const configByDay = {};
    trialConfig.forEach(config => {
        if (!configByDay[config.day]) configByDay[config.day] = {};
        if (!configByDay[config.day][config.className]) {
            configByDay[config.day][config.className] = config;
        }
    });
    
    // Populate the form
    Object.keys(configByDay).forEach(day => {
        const dayNum = parseInt(day);
        const dayConfigs = configByDay[day];
        
        // Set date and location for the day
        const firstConfig = Object.values(dayConfigs)[0];
        document.getElementById(`date${dayNum}`).value = firstConfig.date;
        document.getElementById(`location${dayNum}`).value = firstConfig.location;
        
        // Add classes
        Object.keys(dayConfigs).forEach((className, index) => {
            const config = dayConfigs[className];
            const classNum = index + 1;
            
            if (index === 0) {
                addClass(dayNum);
            } else {
                addClass(dayNum);
            }
            
            document.getElementById(`className${dayNum}_${classNum}`).value = config.className;
            document.getElementById(`judge${dayNum}_${classNum}`).value = config.judge;
            document.getElementById(`rounds${dayNum}_${classNum}`).value = config.roundNum;
            document.getElementById(`maxEntries${dayNum}_${classNum}`).value = config.maxEntries;
        });
    });
}
