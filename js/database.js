// Save trial updates to localStorage
function saveTrialUpdates() {
    if (!currentTrialId || !currentUser) return;
    
    const trialData = {
        id: currentTrialId,
        name: document.getElementById('trialName')?.value || '',
        config: trialConfig,
        results: entryResults,
        runningOrders: runningOrders,
        digitalScores: digitalScores,
        digitalScoreData: digitalScoreData,
        scents: trialScents,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
    };
    
    // Update user trials
    const userTrials = JSON.parse(localStorage.getItem(`trials_${currentUser.username}`) || '{}');
    if (currentTrialId) {
        userTrials[currentTrialId] = trialData;
        localStorage.setItem(`trials_${currentUser.username}`, JSON.stringify(userTrials));
    }
    
    // Update public trials
    const publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    if (currentTrialId) {
        publicTrials[currentTrialId] = trialData;
        localStorage.setItem('publicTrials', JSON.stringify(publicTrials));
    }
    
    console.log('Trial data saved:', trialData);
}

// Load user trials
function loadUserTrials() {
    console.log('Loading user trials for:', currentUser?.username);
    const container = document.getElementById('myTrialsList');
    if (!container || !currentUser) {
        console.log('No container or user found');
        return;
    }
    
    const userTrials = JSON.parse(localStorage.getItem(`trials_${currentUser.username}`) || '{}');
    console.log('User trials loaded:', userTrials);
    
    if (Object.keys(userTrials).length === 0) {
        container.innerHTML = '<p class="no-data">No trials yet. Create your first trial!</p>';
        return;
    }
    
    let html = '';
    for (const [trialId, trial] of Object.entries(userTrials)) {
        const created = new Date(trial.created || Date.now()).toLocaleDateString();
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
                    <button class="btn btn-primary" onclick="editTrial('${trialId}')">✏️ EDIT</button>
                    ${trial.config && trial.config.length > 0 ? 
                        `<button class="btn btn-success" onclick="copyTrialLink('${trialId}')">🔗 COPY LINK</button>` : ''}
                    <button class="btn btn-warning" onclick="duplicateTrial('${trialId}')">📋 DUPLICATE</button>
                    <button class="btn btn-danger" onclick="deleteTrial('${trialId}')">🗑️ DELETE</button>
                </div>
            </div>
        `;
    }
    container.innerHTML = html;
    console.log('User trials HTML updated');
}

// Edit existing trial - FIXED VERSION
function editTrial(trialId) {
    console.log('Editing trial:', trialId);
    
    if (!currentUser) {
        showStatusMessage('User not logged in', 'error');
        return;
    }
    
    const userTrials = JSON.parse(localStorage.getItem(`trials_${currentUser.username}`) || '{}');
    const trial = userTrials[trialId];
    
    if (!trial) {
        showStatusMessage('Trial not found', 'error');
        console.log('Trial not found in user trials:', Object.keys(userTrials));
        return;
    }
    
    console.log('Loading trial for editing:', trial);
    
    // Set current trial
    currentTrialId = trialId;
    trialConfig = trial.config || [];
    entryResults = trial.results || [];
    runningOrders = trial.runningOrders || {};
    digitalScores = trial.digitalScores || {};
    digitalScoreData = trial.digitalScoreData || {};
    trialScents = trial.scents || ['', '', '', ''];
    
    // Update UI
    document.getElementById('trialTitle').textContent = 'Edit Trial: ' + trial.name;
    document.getElementById('trialName').value = trial.name || '';
    
    // Generate entry form link if trial is configured
    if (trialConfig.length > 0) {
        const baseURL = window.location.origin + window.location.pathname;
        const entryURL = `${baseURL}?trial=${currentTrialId}&mode=entry`;
        document.getElementById('shareableURL').value = entryURL;
        document.getElementById('entryFormLink').style.display = 'block';
        document.getElementById('saveTrialSection').style.display = 'block';
    }
    
    // Switch to setup tab
    showTab('setup', document.querySelector('.nav-tab'));
    showStatusMessage('Trial loaded for editing', 'success');
    
    console.log('Trial editing setup complete');
}

// Copy trial link - FIXED VERSION
function copyTrialLink(trialId) {
    console.log('Copying trial link for:', trialId);
    
    const baseURL = window.location.origin + window.location.pathname;
    const entryURL = `${baseURL}?trial=${trialId}&mode=entry`;
    
    console.log('Generated entry URL:', entryURL);
    
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(entryURL).then(() => {
            showStatusMessage('Entry form link copied to clipboard!', 'success');
        }).catch((error) => {
            console.log('Clipboard API failed, trying fallback:', error);
            fallbackCopyTextToClipboard(entryURL);
        });
    } else {
        // Fallback for older browsers or non-secure contexts
        fallbackCopyTextToClipboard(entryURL);
    }
}

// Fallback clipboard function
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showStatusMessage('Entry form link copied to clipboard!', 'success');
        } else {
            showStatusMessage('Failed to copy link. Please copy manually: ' + text, 'error');
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        showStatusMessage('Copy failed. Link: ' + text, 'error');
    }
    
    document.body.removeChild(textArea);
}

// Duplicate trial - FIXED VERSION
function duplicateTrial(trialId) {
    console.log('Duplicating trial:', trialId);
    
    if (!currentUser) {
        showStatusMessage('User not logged in', 'error');
        return;
    }
    
    const userTrials = JSON.parse(localStorage.getItem(`trials_${currentUser.username}`) || '{}');
    const trial = userTrials[trialId];
    
    if (!trial) {
        showStatusMessage('Trial not found', 'error');
        return;
    }
    
    const newTrialId = generateId();
    const duplicatedTrial = {
        ...trial,
        id: newTrialId,
        name: trial.name + ' (Copy)',
        results: [], // Clear entries for new trial
        runningOrders: {},
        digitalScores: {},
        digitalScoreData: {},
        created: new Date().toISOString(),
        updated: new Date().toISOString()
    };
    
    // Save to user trials
    userTrials[newTrialId] = duplicatedTrial;
    localStorage.setItem(`trials_${currentUser.username}`, JSON.stringify(userTrials));
    
    // Also save to public trials if configured
    if (duplicatedTrial.config && duplicatedTrial.config.length > 0) {
        const publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
        publicTrials[newTrialId] = duplicatedTrial;
        localStorage.setItem('publicTrials', JSON.stringify(publicTrials));
    }
    
    loadUserTrials();
    showStatusMessage('Trial duplicated successfully', 'success');
}

// Delete trial - FIXED VERSION
function deleteTrial(trialId) {
    console.log('Deleting trial:', trialId);
    
    if (!currentUser) {
        showStatusMessage('User not logged in', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this trial? This action cannot be undone.')) {
        return;
    }
    
    // Remove from user trials
    const userTrials = JSON.parse(localStorage.getItem(`trials_${currentUser.username}`) || '{}');
    delete userTrials[trialId];
    localStorage.setItem(`trials_${currentUser.username}`, JSON.stringify(userTrials));
    
    // Also remove from public trials
    const publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    delete publicTrials[trialId];
    localStorage.setItem('publicTrials', JSON.stringify(publicTrials));
    
    // If this was the current trial, reset
    if (currentTrialId === trialId) {
        currentTrialId = null;
        trialConfig = [];
        entryResults = [];
        runningOrders = {};
        digitalScores = {};
        digitalScoreData = {};
        trialScents = ['', '', '', ''];
        
        // Clear forms
        document.getElementById('trialName').value = '';
        document.getElementById('daysContainer').innerHTML = '';
        document.getElementById('saveTrialSection').style.display = 'none';
        document.getElementById('entryFormLink').style.display = 'none';
    }
    
    loadUserTrials();
    showStatusMessage('Trial deleted successfully', 'success');
}

// Backup and restore functions
function backupAllData() {
    const backup = {
        users: localStorage.getItem('trialUsers'),
        publicTrials: localStorage.getItem('publicTrials'),
        userTrials: {},
        exportDate: new Date().toISOString()
    };
    
    // Get all user trial data
    for (let key in localStorage) {
        if (key.startsWith('trials_')) {
            backup.userTrials[key] = localStorage.getItem(key);
        }
    }
    
    const backupJson = JSON.stringify(backup, null, 2);
    downloadFile(backupJson, `trial_system_backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    showStatusMessage('System backup created successfully', 'success');
}

// Initialize trial system on page load
function initializeTrialSystem() {
    console.log('Initializing trial system...');
    
    // Ensure dropdown data is loaded
    if (typeof loadDropdownData === 'function') {
        loadDropdownData();
    }
    
    // Load user trials if logged in
    if (currentUser) {
        loadUserTrials();
    }
    
    console.log('Trial system initialized');
}
