// Save trial updates to localStorage
function saveTrialUpdates() {
    if (!currentTrialId || !currentUser) return;
    
    const trialData = {
        name: document.getElementById('trialName')?.value || '',
        config: trialConfig,
        results: entryResults,
        runningOrders: runningOrders,
        digitalScores: digitalScores,
        digitalScoreData: digitalScoreData,
        scents: trialScents,
        updated: new Date().toISOString()
    };
    
    // Update user trials
    const userTrials = JSON.parse(localStorage.getItem(`trials_${currentUser.username}`) || '{}');
    if (userTrials[currentTrialId]) {
        Object.assign(userTrials[currentTrialId], trialData);
        localStorage.setItem(`trials_${currentUser.username}`, JSON.stringify(userTrials));
    }
    
    // Update public trials
    const publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    if (publicTrials[currentTrialId]) {
        Object.assign(publicTrials[currentTrialId], trialData);
        localStorage.setItem('publicTrials', JSON.stringify(publicTrials));
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
