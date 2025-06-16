// Electronic Scent Detective Scoresheet JavaScript
// Integrates with existing dog trial management system

// Global state
let scoresheetData = {
    date: '',
    judge: '',
    ring: '',
    trial: '',
    trialClass: '',
    rounds: [false, false, false, false],
    scents: [
        { location1: '', location2: '' },
        { location1: '', location2: '' },
        { location1: '', location2: '' },
        { location1: '', location2: '' }
    ],
    teams: []
};

let selectedTrialData = null;

// Initialize the scoresheet
document.addEventListener('DOMContentLoaded', function() {
    initializeScoresheet();
    loadAvailableTrials();
    addInitialTeamRows();
    setupEventListeners();
});

// Initialize scoresheet with default data
function initializeScoresheet() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('trial-date').value = today;
    scoresheetData.date = today;
    
    // Try to load from existing trial system
    loadFromExistingTrials();
}

// Load available trials from existing system
function loadAvailableTrials() {
    const trialSelect = document.getElementById('trial-select');
    
    try {
        // Try to integrate with existing trial data
        if (typeof trialConfig !== 'undefined' && trialConfig.length > 0) {
            trialConfig.forEach((trial, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${trial.trialName || 'Trial'} - ${trial.className} - ${formatDate(trial.date)}`;
                trialSelect.appendChild(option);
            });
        } else {
            // Fallback - check localStorage
            const savedTrials = localStorage.getItem('trialConfig');
            if (savedTrials) {
                const trials = JSON.parse(savedTrials);
                trials.forEach((trial, index) => {
                    const option = document.createElement('option');
                    option.value = index;
                    option.textContent = `${trial.trialName || 'Trial'} - ${trial.className} - ${formatDate(trial.date)}`;
                    trialSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.log('No existing trials found, using manual entry mode');
    }
}

// Load trial data from existing system
function loadTrialData() {
    const trialSelect = document.getElementById('trial-select');
    const selectedIndex = trialSelect.value;
    
    if (!selectedIndex) return;
    
    try {
        let trials = [];
        if (typeof trialConfig !== 'undefined') {
            trials = trialConfig;
        } else {
            trials = JSON.parse(localStorage.getItem('trialConfig') || '[]');
        }
        
        const trial = trials[selectedIndex];
        if (trial) {
            selectedTrialData = trial;
            populateFromTrialData(trial);
            loadTrialEntries(trial);
        }
    } catch (error) {
        console.error('Error loading trial data:', error);
    }
}

// Populate scoresheet from trial data
function populateFromTrialData(trial) {
    document.getElementById('trial-date').value = trial.date || '';
    document.getElementById('judge-name').value = trial.judge || '';
    document.getElementById('ring-number').value = trial.ring || '1';
    document.getElementById('trial-name').value = trial.trialName || '';
    document.getElementById('trial-class').value = trial.className || '';
    
    // Update rounds based on trial data
    if (trial.roundNum) {
        toggleRound(trial.roundNum);
    }
    
    updateScoresheet();
}

// Load entries for selected trial
function loadTrialEntries(trial) {
    try {
        let entries = [];
        if (typeof entryResults !== 'undefined') {
            entries = entryResults.filter(entry => 
                entry.date === trial.date && 
                entry.className === trial.className
            );
        } else {
            // Fallback to localStorage
            const savedEntries = localStorage.getItem('trialEntries');
            if (savedEntries) {
                const allEntries = JSON.parse(savedEntries);
                entries = allEntries.filter(entry => 
                    entry.trialDate === trial.date && 
                    entry.trialClass === trial.className
                );
            }
        }
        
        // Clear existing teams and add from entries
        scoresheetData.teams = [];
        const tbody = document.getElementById('scoring-tbody');
        tbody.innerHTML = '';
        
        entries.forEach(entry => {
            const team = {
                dogHandler: `${entry.callName || entry.dogName} -- ${entry.handler || entry.handlerName}`,
                scent1: '', scent2: '', scent3: '', scent4: '',
                fault1: '', fault2: '', time: '', result: ''
            };
            addTeamToTable(team);
        });
        
        // Add extra rows if needed
        if (entries.length < 5) {
            for (let i = entries.length; i < 5; i++) {
                addTeamRow();
            }
        }
        
    } catch (error) {
        console.log('No entries found for this trial');
        addInitialTeamRows();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Form inputs
    document.getElementById('trial-date').addEventListener('change', updateScoresheet);
    document.getElementById('judge-name').addEventListener('input', updateScoresheet);
    document.getElementById('ring-number').addEventListener('input', updateScoresheet);
    document.getElementById('trial-name').addEventListener('input', updateScoresheet);
    document.getElementById('trial-class').addEventListener('change', updateScoresheetAndLimits);
    
    // Scent locations
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`scent${i}-loc1`).addEventListener('input', updateScentLocations);
        document.getElementById(`scent${i}-loc2`).addEventListener('input', updateScentLocations);
    }
    
    // Auto-save on changes
    document.addEventListener('input', debounce(autoSave, 2000));
}

// Add initial team rows
function addInitialTeamRows() {
    for (let i = 0; i < 10; i++) {
        addTeamRow();
    }
}

// Toggle round selection
function toggleRound(round) {
    const roundBox = document.querySelector(`[data-round="${round}"]`);
    const isSelected = roundBox.classList.contains('selected');
    
    // Clear all rounds first (single selection)
    document.querySelectorAll('.round-box').forEach(box => {
        box.classList.remove('selected');
    });
    scoresheetData.rounds = [false, false, false, false];
    
    if (!isSelected) {
        roundBox.classList.add('selected');
        scoresheetData.rounds[round - 1] = true;
    }
    
    updateScoresheet();
}

// Update scoresheet data
function updateScoresheet() {
    scoresheetData.date = document.getElementById('trial-date').value;
    scoresheetData.judge = document.getElementById('judge-name').value;
    scoresheetData.ring = document.getElementById('ring-number').value;
    scoresheetData.trial = document.getElementById('trial-name').value;
    scoresheetData.trialClass = document.getElementById('trial-class').value;
}

// Update scoresheet and time limits
function updateScoresheetAndLimits() {
    updateScoresheet();
    updateTimeLimits();
}

// Update time limits based on class
function updateTimeLimits() {
    const trialClass = document.getElementById('trial-class').value;
    const timeLimitsContent = document.getElementById('time-limits-content');
    
    let limits = {
        'Novice': '4 minutes',
        'Advanced': '3 minutes', 
        'Excellent': '2 minutes',
        'Master': '90 seconds'
    };
    
    if (trialClass && limits[trialClass]) {
        timeLimitsContent.innerHTML = `<strong>${trialClass}: ${limits[trialClass]}</strong><br>` +
            Object.entries(limits).filter(([cls]) => cls !== trialClass)
                .map(([cls, time]) => `${cls}: ${time}`).join('<br>');
    } else {
        timeLimitsContent.innerHTML = Object.entries(limits)
            .map(([cls, time]) => `${cls}: ${time}`).join('<br>');
    }
}

// Update scent locations
function updateScentLocations() {
    for (let i = 1; i <= 4; i++) {
        scoresheetData.scents[i-1] = {
            location1: document.getElementById(`scent${i}-loc1`).value,
            location2: document.getElementById(`scent${i}-loc2`).value
        };
    }
}

// Add team row to table
function addTeamRow() {
    const team = {
        dogHandler: '',
        scent1: '', scent2: '', scent3: '', scent4: '',
        fault1: '', fault2: '', time: '', result: ''
    };
    
    addTeamToTable(team);
}

// Add team to table with data
function addTeamToTable(teamData) {
    const tbody = document.getElementById('scoring-tbody');
    const row = document.createElement('tr');
    const teamIndex = scoresheetData.teams.length;
    
    scoresheetData.teams.push(teamData);
    
    row.innerHTML = `
        <td class="team-cell">
            <input type="text" value="${teamData.dogHandler}" 
                   onchange="updateTeamData(${teamIndex}, 'dogHandler', this.value)"
                   placeholder="Dog -- Handler">
        </td>
        <td class="scent-cell">
            <input type="text" value="${teamData.scent1}" 
                   onchange="updateTeamData(${teamIndex}, 'scent1', this.value)"
                   placeholder="✓/✗">
        </td>
        <td class="scent-cell">
            <input type="text" value="${teamData.scent2}" 
                   onchange="updateTeamData(${teamIndex}, 'scent2', this.value)"
                   placeholder="✓/✗">
        </td>
        <td class="scent-cell">
            <input type="text" value="${teamData.scent3}" 
                   onchange="updateTeamData(${teamIndex}, 'scent3', this.value)"
                   placeholder="✓/✗">
        </td>
        <td class="scent-cell">
            <input type="text" value="${teamData.scent4}" 
                   onchange="updateTeamData(${teamIndex}, 'scent4', this.value)"
                   placeholder="✓/✗">
        </td>
        <td class="fault-cell">
            <input type="text" value="${teamData.fault1}" 
                   onchange="updateTeamData(${teamIndex}, 'fault1', this.value)">
        </td>
        <td class="fault-cell">
            <input type="text" value="${teamData.fault2}" 
                   onchange="updateTeamData(${teamIndex}, 'fault2', this.value)">
        </td>
        <td class="time-cell">
            <input type="text" value="${teamData.time}" 
                   onchange="updateTeamData(${teamIndex}, 'time', this.value)"
                   placeholder="mm:ss">
        </td>
        <td class="result-cell">
            <select onchange="updateTeamData(${teamIndex}, 'result', this.value)">
                <option value="" ${teamData.result === '' ? 'selected' : ''}></option>
                <option value="Pass" ${teamData.result === 'Pass' ? 'selected' : ''}>Pass</option>
                <option value="Fail" ${teamData.result === 'Fail' ? 'selected' : ''}>Fail</option>
            </select>
        </td>
    `;
    
    tbody.appendChild(row);
}

// Update team data
function updateTeamData(teamIndex, field, value) {
    if (scoresheetData.teams[teamIndex]) {
        scoresheetData.teams[teamIndex][field] = value;
        
        // Auto-calculate result if all scents are marked
        if (field.startsWith('scent')) {
            autoCalculateResult(teamIndex);
        }
    }
}

// Auto-calculate pass/fail result
function autoCalculateResult(teamIndex) {
    const team = scoresheetData.teams[teamIndex];
    const scents = [team.scent1, team.scent2, team.scent3, team.scent4];
    
    // Check if all scents are marked
    const allMarked = scents.every(scent => scent.trim() !== '');
    if (!allMarked) return;
    
    // Check if all are successful (✓ or similar positive marks)
    const allSuccess = scents.every(scent => 
        scent.includes('✓') || scent.toLowerCase().includes('pass') || 
        scent === '1' || scent.toLowerCase() === 'y' || scent.toLowerCase() === 'yes'
    );
    
    // Update the select element
    const rows = document.querySelectorAll('#scoring-tbody tr');
    if (rows[teamIndex]) {
        const resultSelect = rows[teamIndex].querySelector('.result-cell select');
        if (resultSelect && !resultSelect.value) { // Only auto-set if not manually set
            const newResult = allSuccess ? 'Pass' : 'Fail';
            resultSelect.value = newResult;
            team.result = newResult;
        }
    }
}

// Remove last team
function removeLastTeam() {
    const tbody = document.getElementById('scoring-tbody');
    const rows = tbody.querySelectorAll('tr');
    
    if (rows.length > 1) { // Keep at least one row
        rows[rows.length - 1].remove();
        scoresheetData.teams.pop();
    }
}

// Save scoresheet
function saveScoresheet() {
    const data = {
        scoresheetData,
        savedAt: new Date().toISOString(),
        trialInfo: selectedTrialData
    };
    
    try {
        // Try to integrate with existing save system
        if (typeof saveToTrialSystem === 'function') {
            saveToTrialSystem('scentScoresheet', data);
        } else {
            // Fallback to localStorage
            const savedSheets = JSON.parse(localStorage.getItem('scentScoresheets') || '[]');
            savedSheets.push(data);
            localStorage.setItem('scentScoresheets', JSON.stringify(savedSheets));
        }
        
        showStatusMessage('Scoresheet saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving scoresheet:', error);
        showStatusMessage('Error saving scoresheet', 'error');
    }
}

// Export scoresheet
function exportScoresheet() {
    const data = {
        scoresheetData,
        exportedAt: new Date().toISOString(),
        trialInfo: selectedTrialData
    };
    
    // Create filename
    const date = scoresheetData.date || 'draft';
    const className = scoresheetData.trialClass || 'class';
    const filename = `scent-scoresheet-${date}-${className}.json`;
    
    // Create and download file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    showStatusMessage('Scoresheet exported successfully!', 'success');
}

// Load scoresheet
function loadScoresheet() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (data.scoresheetData) {
                    loadScoresheetData(data.scoresheetData);
                    selectedTrialData = data.trialInfo || null;
                    showStatusMessage('Scoresheet loaded successfully!', 'success');
                } else {
                    throw new Error('Invalid scoresheet format');
                }
            } catch (error) {
                console.error('Error loading scoresheet:', error);
                showStatusMessage('Error loading scoresheet: Invalid file format', 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// Load scoresheet data into form
function loadScoresheetData(data) {
    scoresheetData = data;
    
    // Update form fields
    document.getElementById('trial-date').value = data.date || '';
    document.getElementById('judge-name').value = data.judge || '';
    document.getElementById('ring-number').value = data.ring || '';
    document.getElementById('trial-name').value = data.trial || '';
    document.getElementById('trial-class').value = data.trialClass || '';
    
    // Update rounds
    document.querySelectorAll('.round-box').forEach((box, index) => {
        if (data.rounds[index]) {
            box.classList.add('selected');
        } else {
            box.classList.remove('selected');
        }
    });
    
    // Update scent locations
    data.scents.forEach((scent, index) => {
        document.getElementById(`scent${index + 1}-loc1`).value = scent.location1 || '';
        document.getElementById(`scent${index + 1}-loc2`).value = scent.location2 || '';
    });
    
    // Update teams table
    const tbody = document.getElementById('scoring-tbody');
    tbody.innerHTML = '';
    scoresheetData.teams = [];
    
    data.teams.forEach(team => {
        addTeamToTable(team);
    });
    
    // Add extra rows if needed
    if (data.teams.length < 5) {
        for (let i = data.teams.length; i < 5; i++) {
            addTeamRow();
        }
    }
    
    updateTimeLimits();
}

// Print scoresheet
function printScoresheet() {
    window.print();
}

// Auto-save functionality
function autoSave() {
    if (scoresheetData.date || scoresheetData.judge || scoresheetData.trial) {
        const autoSaveData = {
            ...scoresheetData,
            autoSavedAt: new Date().toISOString()
        };
        localStorage.setItem('scentScoresheetAutoSave', JSON.stringify(autoSaveData));
    }
}

// Load from existing trial system
function loadFromExistingTrials() {
    // Check URL parameters for trial selection
    const urlParams = new URLSearchParams(window.location.search);
    const trialId = urlParams.get('trial');
    const className = urlParams.get('class');
    
    if (trialId && className) {
        try {
            // Try to load specific trial data
            let trials = [];
            if (typeof trialConfig !== 'undefined') {
                trials = trialConfig;
            } else {
                trials = JSON.parse(localStorage.getItem('trialConfig') || '[]');
            }
            
            const trial = trials.find(t => 
                t.id === trialId || 
                (t.className === className && t.date)
            );
            
            if (trial) {
                populateFromTrialData(trial);
                loadTrialEntries(trial);
            }
        } catch (error) {
            console.log('Could not load trial data from URL parameters');
        }
    }
    
    // Try to load auto-saved data
    try {
        const autoSaved = localStorage.getItem('scentScoresheetAutoSave');
        if (autoSaved && !trialId) {
            const data = JSON.parse(autoSaved);
            if (confirm('Auto-saved scoresheet found. Would you like to restore it?')) {
                loadScoresheetData(data);
            }
        }
    } catch (error) {
        console.log('No auto-saved data found');
    }
}

// Show status message
function showStatusMessage(message, type = 'info') {
    // Try to use existing status message system
    if (typeof showStatusMessage !== 'undefined' && typeof showStatusMessage === 'function') {
        showStatusMessage(message, type);
        return;
    }
    
    // Fallback status message
    const statusDiv = document.createElement('div');
    statusDiv.className = `status-message status-${type}`;
    statusDiv.textContent = message;
    statusDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        background: ${type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : '#2563eb'};
    `;
    
    document.body.appendChild(statusDiv);
    
    setTimeout(() => {
        statusDiv.remove();
    }, 3000);
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Modal functions (for future enhancements)
function closeSaveLoadModal() {
    document.getElementById('save-load-modal').style.display = 'none';
}

// Integration helper functions
function saveToTrialSystem(type, data) {
    // This function can be implemented to save to existing trial system
    console.log(`Saving ${type} data:`, data);
}

// Export for integration with existing system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadTrialData,
        saveScoresheet,
        exportScoresheet,
        loadScoresheet,
        addTeamRow,
        removeLastTeam
    };
}
