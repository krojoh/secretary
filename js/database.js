// Database Operations - localStorage Management

// Authentication Functions
function showAuthTab(tab, element) {
    // Remove active class from all tabs
    var tabs = document.querySelectorAll('.auth-tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    element.classList.add('active');
    
    // Remove active class from all forms
    var forms = document.querySelectorAll('.auth-form');
    for (var i = 0; i < forms.length; i++) {
        forms[i].classList.remove('active');
    }
    document.getElementById(tab + 'Form').classList.add('active');
}

function handleLogin(event) {
    event.preventDefault();
    
    var username = document.getElementById('loginUsername').value;
    var password = document.getElementById('loginPassword').value;
    
    var users = JSON.parse(localStorage.getItem('trialUsers') || '{}');
    
    if (users[username] && users[username].password === password) {
        currentUser = users[username];
        showMainApp();
        loadUserTrials();
        showStatusMessage('Login successful!', 'success');
    } else {
        showStatusMessage('Invalid username or password', 'warning');
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    var username = document.getElementById('regUsername').value;
    var password = document.getElementById('regPassword').value;
    var confirmPassword = document.getElementById('regConfirmPassword').value;
    var fullName = document.getElementById('regFullName').value;
    var email = document.getElementById('regEmail').value;
    
    if (password !== confirmPassword) {
        showStatusMessage('Passwords do not match', 'warning');
        return;
    }
    
    if (!validateEmail(email)) {
        showStatusMessage('Please enter a valid email address', 'warning');
        return;
    }
    
    var users = JSON.parse(localStorage.getItem('trialUsers') || '{}');
    
    if (users[username]) {
        showStatusMessage('Username already exists', 'warning');
        return;
    }
    
    users[username] = {
        username: username,
        password: password,
        fullName: fullName,
        email: email,
        created: new Date().toISOString()
    };
    
    localStorage.setItem('trialUsers', JSON.stringify(users));
    showStatusMessage('Registration successful! Please login.', 'success');
    
    // Clear form and switch to login
    document.getElementById('registerForm').reset();
    showAuthTab('login', document.querySelector('.auth-tab'));
}

function showMainApp() {
    document.getElementById('authOverlay').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('userInfo').textContent = 'Welcome, ' + currentUser.fullName;
}

function logout() {
    currentUser = null;
    currentTrialId = null;
    
    // Clear all data
    trialConfig = [];
    entryResults = [];
    runningOrders = {};
    digitalScores = {};
    digitalScoreData = {};
    
    document.getElementById('authOverlay').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    
    // Clear all input fields
    var inputs = document.querySelectorAll('input');
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].value = '';
    }
}

// Trial Management Functions
function loadUserTrials() {
    var userTrials = JSON.parse(localStorage.getItem('trials_' + currentUser.username) || '{}');
    var container = document.getElementById('myTrialsList');
    
    if (Object.keys(userTrials).length === 0) {
        container.innerHTML = '<p style="color: #666; font-style: italic;">No trials yet. Create your first trial!</p>';
        return;
    }
    
    var html = '';
    for (var trialId in userTrials) {
        if (userTrials.hasOwnProperty(trialId)) {
            var trial = userTrials[trialId];
            var created = new Date(trial.created).toLocaleDateString();
            var days = trial.config ? getUniqueDays(trial.config).length : 0;
            
            // Get current entry count by syncing with public storage
            var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
            var userEntries = trial.results || [];
            var publicEntries = (publicTrials[trialId] && publicTrials[trialId].results) ? publicTrials[trialId].results : [];
            var totalEntries = mergeEntries(userEntries, publicEntries).length;
            
            var trialName = trial.name || 'Untitled Trial';
            var trialStatus = (trial.config && trial.config.length > 0) ? 'Configured' : 'Setup Incomplete';
            var statusColor = (trial.config && trial.config.length > 0) ? '#28a745' : '#ffc107';
            
            html += '<div class="trial-item">' +
                '<div class="trial-info">' +
                '<div class="trial-name">' + trialName + '</div>' +
                '<div class="trial-meta">Created: ' + created + ' | Days: ' + days + ' | Entries: ' + totalEntries + '</div>' +
                '<div class="trial-status" style="color: ' + statusColor + '; font-size: 12px; font-weight: bold;">' + trialStatus + '</div>' +
                '</div>' +
                '<div class="trial-actions">' +
                '<button class="edit-btn" onclick="editTrial(\'' + trialId + '\')">Edit</button>';
            
            // Add Copy Link button if trial is configured
            if (trial.config && trial.config.length > 0) {
                html += '<button class="edit-btn" onclick="copyTrialLink(\'' + trialId + '\')" style="background: #17a2b8;">Copy Link</button>';
            }
            
            html += '<button class="delete-btn" onclick="deleteTrial(\'' + trialId + '\')">Delete</button>' +
                '</div>' +
                '</div>';
        }
    }
    container.innerHTML = html;
}

function copyTrialLink(trialId) {
    var baseURL = window.location.origin + window.location.pathname;
    var shareableURL = baseURL + '?trial=' + trialId + '&mode=entry';
    
    // Create temporary input to copy text
    var tempInput = document.createElement('input');
    tempInput.value = shareableURL;
    document.body.appendChild(tempInput);
    tempInput.select();
    tempInput.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        showStatusMessage('Entry form link copied to clipboard!', 'success');
    } catch (err) {
        showStatusMessage('Could not copy link. URL: ' + shareableURL, 'warning');
    }
    
    document.body.removeChild(tempInput);
}

function createNewTrial() {
    currentTrialId = 'trial_' + Date.now();
    document.getElementById('trialTitle').textContent = 'New Trial Setup';
    document.getElementById('trialName').value = '';
    document.getElementById('trialDays').value = '';
    document.getElementById('daysContainer').innerHTML = '';
    
    // Reset all data
    trialConfig = [];
    entryResults = [];
    runningOrders = {};
    digitalScores = {};
    digitalScoreData = {};
    
    updateTrialOptions();
    updateResultsDisplay();
    updateCrossReferenceDisplay();
    showTab('setup', document.querySelector('.nav-tab'));
}

function editTrial(trialId) {
    var userTrials = JSON.parse(localStorage.getItem('trials_' + currentUser.username) || '{}');
    var trial = userTrials[trialId];
    
    if (!trial) {
        alert('Trial not found');
        return;
    }
    
    currentTrialId = trialId;
    document.getElementById('trialTitle').textContent = 'Editing: ' + (trial.name || 'Untitled Trial');
    document.getElementById('trialName').value = trial.name || '';
    
    trialConfig = trial.config || [];
    runningOrders = trial.runningOrders || {};
    digitalScores = trial.digitalScores || {};
    digitalScoreData = trial.digitalScoreData || {};
    loadExistingDigitalScores();
    
    // Load entries from both user storage and public storage, then merge
    var userEntries = trial.results || [];
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    var publicEntries = (publicTrials[trialId] && publicTrials[trialId].results) ? publicTrials[trialId].results : [];
    
    // Merge entries and remove duplicates based on timestamp
    entryResults = mergeEntries(userEntries, publicEntries);
    
    // Save merged entries back to user storage
    userTrials[trialId].results = entryResults;
    localStorage.setItem('trials_' + currentUser.username, JSON.stringify(userTrials));
    
    if (trialConfig.length > 0) {
        var maxDay = getMaxDay(trialConfig);
        document.getElementById('trialDays').value = maxDay;
        generateDays();
        
        setTimeout(function() {
            populateExistingTrialData();
        }, 100);
    }
    
    updateTrialOptions();
    updateResultsDisplay();
    updateCrossReferenceDisplay();
    showTab('setup', document.querySelector('.nav-tab'));
}

function deleteTrial(trialId) {
    if (confirm('Are you sure you want to delete this trial? This action cannot be undone.')) {
        var userTrials = JSON.parse(localStorage.getItem('trials_' + currentUser.username) || '{}');
        delete userTrials[trialId];
        localStorage.setItem('trials_' + currentUser.username, JSON.stringify(userTrials));
        
        // Also remove from public trials
        var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
        delete publicTrials[trialId];
        localStorage.setItem('publicTrials', JSON.stringify(publicTrials));
        
        loadUserTrials();
        showStatusMessage('Trial deleted successfully', 'success');
    }
}

function saveTrialData() {
    if (!currentUser) {
        alert("Please log in first.");
        return;
    }
    
    if (!currentTrialId) {
        alert("Please create a new trial first.");
        return;
    }
    
    var trialName = document.getElementById('trialName').value.trim();
    if (!trialName) {
        alert("Please enter a trial name.");
        return;
    }

    if (trialConfig.length === 0) {
        alert("Please configure at least one day before saving the trial.");
        return;
    }
    
    var userTrials = JSON.parse(localStorage.getItem('trials_' + currentUser.username) || '{}');
    
    var trialData = {
        name: trialName,
        config: trialConfig,
        results: entryResults,
        runningOrders: runningOrders,
        digitalScores: digitalScores,
        digitalScoreData: digitalScoreData,
        owner: currentUser.username,
        created: userTrials[currentTrialId] && userTrials[currentTrialId].created ? userTrials[currentTrialId].created : new Date().toISOString(),
        updated: new Date().toISOString()
    };
    
    userTrials[currentTrialId] = trialData;
    localStorage.setItem('trials_' + currentUser.username, JSON.stringify(userTrials));
    
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    publicTrials[currentTrialId] = trialData;
    localStorage.setItem('publicTrials', JSON.stringify(publicTrials));
    
    generateShareableURL();
    document.getElementById('entryFormLink').style.display = 'block';
    showStatusMessage("Trial saved successfully!", "success");
    loadUserTrials();
}

// Entry Management Functions
function saveEntriesToTrial() {
    if (!currentTrialId) return;
    
    // Save to user's trials if logged in
    if (currentUser) {
        var userTrials = JSON.parse(localStorage.getItem('trials_' + currentUser.username) || '{}');
        if (userTrials[currentTrialId]) {
            userTrials[currentTrialId].results = entryResults;
            userTrials[currentTrialId].updated = new Date().toISOString();
            localStorage.setItem('trials_' + currentUser.username, JSON.stringify(userTrials));
        }
    }
    
    // Always save to public trials for entry form access
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    if (publicTrials[currentTrialId]) {
        publicTrials[currentTrialId].results = entryResults;
        publicTrials[currentTrialId].updated = new Date().toISOString();
        localStorage.setItem('publicTrials', JSON.stringify(publicTrials));
    }
}

// Digital Score Data Management
function saveScoreData() {
    // Save location data if on digital scoring
    if (currentDigitalSheet) {
        var locationInputs = ['scent1Location', 'scent2Location', 'scent3Location', 'scent4Location'];
        
        for (var i = 0; i < locationInputs.length; i++) {
            var inputId = locationInputs[i];
            var input = document.getElementById(inputId);
            var dataKey = currentDigitalSheet + '|' + inputId;
            
            if (input) {
                digitalScoreData[dataKey] = input.value;
            }
        }
    }
    
    // Save all digital score data to storage
    if (currentUser && currentTrialId) {
        var userTrials = JSON.parse(localStorage.getItem('trials_' + currentUser.username) || '{}');
        if (userTrials[currentTrialId]) {
            userTrials[currentTrialId].digitalScoreData = digitalScoreData;
            userTrials[currentTrialId].updated = new Date().toISOString();
            localStorage.setItem('trials_' + currentUser.username, JSON.stringify(userTrials));
        }
        
        var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
        if (publicTrials[currentTrialId]) {
            publicTrials[currentTrialId].digitalScoreData = digitalScoreData;
            publicTrials[currentTrialId].updated = new Date().toISOString();
            localStorage.setItem('publicTrials', JSON.stringify(publicTrials));
        }
    }
}

function loadExistingDigitalScores() {
    if (currentUser && currentTrialId) {
        var userTrials = JSON.parse(localStorage.getItem('trials_' + currentUser.username) || '{}');
        if (userTrials[currentTrialId] && userTrials[currentTrialId].digitalScoreData) {
            digitalScoreData = userTrials[currentTrialId].digitalScoreData;
        }
    }
}

// Data Export Functions
function exportToCSV() {
    if (entryResults.length === 0) {
        alert('No data to export');
        return;
    }

    var csv = 'Registration,Call Name,Handler,Date,Class,Round,Judge,Entry Type,Timestamp\n';
    
    for (var i = 0; i < entryResults.length; i++) {
        var entry = entryResults[i];
        csv += entry.regNumber + ',' + 
               entry.callName + ',' + 
               entry.handler + ',' + 
               entry.date + ',' + 
               entry.className + ',' + 
               entry.round + ',' + 
               entry.judge + ',' + 
               entry.entryType + ',' + 
               entry.timestamp + '\n';
    }

    downloadFile(csv, 'trial_entries.csv', 'text/csv');
    showStatusMessage('CSV exported successfully!', 'success');
}

// Database Cleanup Functions
function clearAllUserData() {
    if (confirm('Are you sure you want to clear ALL user data? This cannot be undone.')) {
        localStorage.removeItem('trialUsers');
        localStorage.removeItem('publicTrials');
        
        // Clear user-specific trial data
        for (var key in localStorage) {
            if (key.startsWith('trials_')) {
                localStorage.removeItem(key);
            }
        }
        
        showStatusMessage('All user data cleared', 'success');
        logout();
    }
}

function backupUserData() {
    var backup = {
        users: localStorage.getItem('trialUsers'),
        publicTrials: localStorage.getItem('publicTrials'),
        userTrials: {}
    };
    
    // Get all user trial data
    for (var key in localStorage) {
        if (key.startsWith('trials_')) {
            backup.userTrials[key] = localStorage.getItem(key);
        }
    }
    
    var backupJson = JSON.stringify(backup, null, 2);
    downloadFile(backupJson, 'trial_system_backup_' + new Date().toISOString().split('T')[0] + '.json', 'application/json');
    showStatusMessage('Backup created successfully', 'success');
}

function restoreUserData(fileInput) {
    var file = fileInput.files[0];
    if (!file) return;
    
    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var backup = JSON.parse(e.target.result);
            
            // Restore data
            if (backup.users) {
                localStorage.setItem('trialUsers', backup.users);
            }
            if (backup.publicTrials) {
                localStorage.setItem('publicTrials', backup.publicTrials);
            }
            if (backup.userTrials) {
                for (var key in backup.userTrials) {
                    localStorage.setItem(key, backup.userTrials[key]);
                }
            }
            
            showStatusMessage('Data restored successfully! Please refresh the page.', 'success');
        } catch (error) {
            showStatusMessage('Error restoring backup: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

// Database Statistics
function getDatabaseStats() {
    var users = JSON.parse(localStorage.getItem('trialUsers') || '{}');
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    
    var stats = {
        totalUsers: Object.keys(users).length,
        totalTrials: Object.keys(publicTrials).length,
        totalEntries: 0,
        storageUsed: 0
    };
    
    // Calculate total entries
    for (var trialId in publicTrials) {
        var trial = publicTrials[trialId];
        if (trial.results) {
            stats.totalEntries += trial.results.length;
        }
    }
    
    // Calculate storage usage
    for (var key in localStorage) {
        stats.storageUsed += localStorage.getItem(key).length;
    }
    
    // Convert to KB
    stats.storageUsed = Math.round(stats.storageUsed / 1024);
    
    return stats;
}
