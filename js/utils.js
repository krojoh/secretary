// Global Variables
let currentUser = null;
let currentTrialId = null;
let dogData = [];
let trialConfig = [];
let entryResults = [];
let runningOrders = {};
let digitalScores = {};
let digitalScoreData = {};
let totalDays = 0;
let savedDays = 0;
let trialScents = ['', '', '', ''];
let autoSaveEnabled = true;

// Initialize the application
window.onload = function() {
    console.log('Initializing Dog Scent Work Trial Secretary System...');
    
    // Auto-load Excel file from repository in background
    autoLoadExcelFile();
    
    // Check if we're in entry mode from URL
    if (!handleURLParameters()) {
        // Show authentication overlay
        document.getElementById('authOverlay').classList.remove('hidden');
    }
    
    // Setup event listeners
    setupEventListeners();
};

async function autoLoadExcelFile() {
    try {
        // Show loading status
        showDataLoadStatus('Loading registration database...', 'loading');
        
        // Try to fetch the Excel file from the repository
        const response = await fetch('data/data-for-site.xlsx');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        
        // Process the Excel file
        const workbook = XLSX.read(arrayBuffer, { 
            type: 'array',
            cellStyles: true,
            cellFormulas: true,
            cellDates: true 
        });
        
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        // Process the data with proper headers (skip header row)
        dogData = rawData.slice(1).map(row => ({
            registrationNumber: (row[0] || '').toString().trim(),
            callName: (row[1] || '').toString().trim(),
            registeredName: (row[2] || '').toString().trim(),
            handlerFull: (row[3] || '').toString().trim(),
            handlerFirst: (row[5] || '').toString().trim(),
            handlerLast: (row[6] || '').toString().trim(),
            class: (row[8] || '').toString().trim(), // Column I
            judge: (row[10] || '').toString().trim() // Column K
        })).filter(entry => entry.registrationNumber && entry.registrationNumber !== '');
        
        console.log(`Auto-loaded ${dogData.length} dog records from repository`);
        showDataLoadStatus(`✅ Loaded ${dogData.length} dog records from database`, 'success');
        
        // Trigger event for dropdown data loading
        if (typeof loadDropdownData === 'function') {
            loadDropdownData();
        }
        
        // Hide status after a few seconds
        setTimeout(() => {
            hideDataLoadStatus();
        }, 3000);
        
    } catch (error) {
        console.warn('Could not auto-load Excel file from repository:', error);
        
        // Fall back to sample data
        loadSampleDataWithClassesAndJudges();
        
        showDataLoadStatus(`⚠️ Using sample data - repository file not available`, 'warning');
        
        // Trigger event for dropdown data loading
        if (typeof loadDropdownData === 'function') {
            loadDropdownData();
        }
        
        // Hide status after a few seconds
        setTimeout(() => {
            hideDataLoadStatus();
        }, 4000);
    }
}

// Enhanced sample data with classes and judges
function loadSampleDataWithClassesAndJudges() {
    if (dogData.length === 0) {
        dogData = [
            { registrationNumber: "DN12345", callName: "Buddy", registeredName: "Champion Buddy Bear", handlerFull: "John Smith", handlerFirst: "John", handlerLast: "Smith", class: "Novice", judge: "Judge Williams" },
            { registrationNumber: "DN67890", callName: "Luna", registeredName: "Moonlight Luna Star", handlerFull: "Jane Doe", handlerFirst: "Jane", handlerLast: "Doe", class: "Advanced", judge: "Judge Johnson" },
            { registrationNumber: "DN11111", callName: "Max", registeredName: "Maximilian Rex", handlerFull: "Bob Johnson", handlerFirst: "Bob", handlerLast: "Johnson", class: "Excellent", judge: "Judge Brown" },
            { registrationNumber: "DN22222", callName: "Bella", registeredName: "Beautiful Bella Rose", handlerFull: "Alice Brown", handlerFirst: "Alice", handlerLast: "Brown", class: "Master", judge: "Judge Davis" },
            { registrationNumber: "DN33333", callName: "Charlie", registeredName: "Charlie's Angel", handlerFull: "Mike Wilson", handlerFirst: "Mike", handlerLast: "Wilson", class: "Novice", judge: "Judge Miller" },
            { registrationNumber: "DN44444", callName: "Daisy", registeredName: "Daisy Chain Dreams", handlerFull: "Sarah Davis", handlerFirst: "Sarah", handlerLast: "Davis", class: "Advanced", judge: "Judge Garcia" },
            { registrationNumber: "DN55555", callName: "Rocky", registeredName: "Rocky Mountain High", handlerFull: "Tom Miller", handlerFirst: "Tom", handlerLast: "Miller", class: "Excellent", judge: "Judge Rodriguez" },
            { registrationNumber: "DN66666", callName: "Molly", registeredName: "Sweet Molly Malone", handlerFull: "Lisa Garcia", handlerFirst: "Lisa", handlerLast: "Garcia", class: "Master", judge: "Judge Martinez" },
            { registrationNumber: "DN77777", callName: "Scout", registeredName: "Scout's Honor", handlerFull: "Chris Johnson", handlerFirst: "Chris", handlerLast: "Johnson", class: "Novice", judge: "Judge Thompson" },
            { registrationNumber: "DN88888", callName: "Pepper", registeredName: "Pepper's Dream", handlerFull: "Amy Wilson", handlerFirst: "Amy", handlerLast: "Wilson", class: "Advanced", judge: "Judge Anderson" }
        ];
        console.log('Loaded sample dog data with classes and judges');
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Auto-save on form changes
    document.addEventListener('input', function(e) {
        if (autoSaveEnabled && currentTrialId) {
            debounce(autoSave, 2000)();
        }
    });
    
    // Prevent accidental page refresh
    window.addEventListener('beforeunload', function(e) {
        if (hasUnsavedChanges()) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

// URL Parameter Handling
function handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const trialId = urlParams.get('trial');
    const mode = urlParams.get('mode');
    
    if (trialId && mode === 'entry') {
        loadTrialForEntry(trialId);
        return true;
    }
    return false;
}

// Load trial for public entry form
function loadTrialForEntry(trialId) {
    const publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    const trial = publicTrials[trialId];
    
    if (!trial) {
        alert('Trial not found or no longer available');
        return;
    }
    
    currentTrialId = trialId;
    trialConfig = trial.config || [];
    entryResults = trial.results || [];
    runningOrders = trial.runningOrders || {};
    digitalScores = trial.digitalScores || {};
    digitalScoreData = trial.digitalScoreData || {};
    trialScents = trial.scents || ['', '', '', ''];
    
    document.getElementById('authOverlay').classList.add('hidden');
    document.getElementById('mainApp').classList.add('active');
    document.getElementById('userInfo').textContent = 'Entry Form: ' + (trial.name || 'Trial');
    
    // Hide management features for public entry
    const userBar = document.querySelector('.user-bar');
    if (userBar) {
        const myTrialsBtn = userBar.querySelector('.my-trials-btn');
        const logoutBtn = userBar.querySelector('.logout-btn');
        if (myTrialsBtn) myTrialsBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
    
    const myTrialsSection = document.querySelector('.my-trials');
    if (myTrialsSection) myTrialsSection.style.display = 'none';
    
    // Show only entry-related tabs
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach((tab, index) => {
        if (index > 1) { // Hide tabs after "Entry Form"
            tab.style.display = 'none';
        }
    });
    
    // Load entry form
    setTimeout(() => {
        updateTrialOptions();
        showTab('entry', tabs[1]);
    }, 100);
}

// Authentication Functions
function showAuthTab(tabName, element) {
    // Remove active class from all tabs and forms
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding form
    element.classList.add('active');
    const form = document.getElementById(tabName + 'Form');
    if (form) {
        form.classList.add('active');
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    if (!username || !password) {
        showStatusMessage('Please enter both username and password', 'error');
        return;
    }
    
    // Simple authentication (in real app, this would be server-side)
    const users = JSON.parse(localStorage.getItem('trialUsers') || '{}');
    
    if (users[username] && users[username].password === password) {
        currentUser = {
            username: username,
            fullName: users[username].fullName,
            email: users[username].email
        };
        
        document.getElementById('authOverlay').classList.add('hidden');
        document.getElementById('mainApp').classList.add('active');
        document.getElementById('userInfo').textContent = `Welcome, ${users[username].fullName}`;
        
        // Load user data after successful login
        loadUserTrials();
        showStatusMessage('Login successful', 'success');
        
        // Auto-create first trial if none exist
        const userTrials = JSON.parse(localStorage.getItem(`trials_${currentUser.username}`) || '{}');
        if (Object.keys(userTrials).length === 0) {
            setTimeout(() => {
                createNewTrial();
            }, 1000);
        }
    } else {
        showStatusMessage('Invalid username or password', 'error');
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const confirmPassword = document.getElementById('regConfirmPassword').value.trim();
    const fullName = document.getElementById('regFullName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    
    if (!username || !password || !fullName || !email) {
        showStatusMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showStatusMessage('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showStatusMessage('Password must be at least 6 characters long', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('trialUsers') || '{}');
    if (users[username]) {
        showStatusMessage('Username already exists', 'error');
        return;
    }
    
    users[username] = {
        password: password,
        fullName: fullName,
        email: email,
        created: new Date().toISOString()
    };
    
    localStorage.setItem('trialUsers', JSON.stringify(users));
    showStatusMessage('Registration successful! Please login.', 'success');
    
    // Switch to login tab
    const loginTab = document.querySelector('.auth-tab');
    showAuthTab('login', loginTab);
    
    // Clear registration form
    document.getElementById('registerForm').reset();
}

function logout() {
    currentUser = null;
    currentTrialId = null;
    document.getElementById('mainApp').classList.remove('active');
    document.getElementById('authOverlay').classList.remove('hidden');
    
    // Reset forms
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm) loginForm.reset();
    if (registerForm) registerForm.reset();
    
    // Clear any cached data
    trialConfig = [];
    entryResults = [];
    runningOrders = {};
    digitalScores = {};
    digitalScoreData = {};
    
    // Reset to login tab
    const loginTab = document.querySelector('.auth-tab');
    showAuthTab('login', loginTab);
    
    showStatusMessage('Logged out successfully', 'success');
}

// Tab Management
function showTab(tabName, element) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding content
    if (element) element.classList.add('active');
    const tabContent = document.getElementById(tabName);
    if (tabContent) {
        tabContent.classList.add('active');
    }
    
    // Load tab-specific content
    loadTabContent(tabName);
}

function loadTabContent(tabName) {
    switch (tabName) {
        case 'setup':
            // Already loaded by default
            break;
        case 'entry':
            if (typeof updateTrialOptions === 'function') {
                updateTrialOptions();
            }
            break;
        case 'results':
            if (typeof loadResults === 'function') {
                loadResults();
            }
            break;
        case 'cross-reference':
            if (typeof loadCrossReferenceTab === 'function') {
                loadCrossReferenceTab();
            }
            break;
        case 'running-order':
            if (typeof loadRunningOrderManagement === 'function') {
                loadRunningOrderManagement();
            }
            break;
        case 'score-sheets':
            if (typeof loadScoreSheetsManagement === 'function') {
                loadScoreSheetsManagement();
            }
            break;
        case 'score-entry':
            if (typeof loadDigitalScoreEntry === 'function') {
                loadDigitalScoreEntry();
                loadExistingDigitalScores();
            }
            break;
        case 'reports':
            if (typeof loadReports === 'function') {
                loadReports();
            }
            break;
    }
}

// Show data loading status
function showDataLoadStatus(message, type) {
    const statusDiv = document.getElementById('dataLoadStatus');
    if (statusDiv) {
        const iconMap = {
            loading: '⏳',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        
        statusDiv.innerHTML = `
            <span class="status-icon">${iconMap[type] || '⏳'}</span>
            <span class="status-text">${message}</span>
        `;
        statusDiv.className = `data-load-status ${type}`;
        statusDiv.style.display = 'flex';
    }
}

// Hide data loading status
function hideDataLoadStatus() {
    const statusDiv = document.getElementById('dataLoadStatus');
    if (statusDiv) {
        statusDiv.style.display = 'none';
    }
}

// Status Messages
function showStatusMessage(message, type = 'info', duration = 3000) {
    const statusDiv = document.getElementById('autoSaveStatus');
    if (statusDiv) {
        statusDiv.textContent = message;
        statusDiv.className = `auto-save-status ${type}`;
        statusDiv.style.display = 'block';
        
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, duration);
    } else {
        // Fallback to console and alert for critical messages
        console.log(`${type.toUpperCase()}: ${message}`);
        if (type === 'error') {
            alert(message);
        }
    }
}

// Auto-save functionality
function autoSave() {
    if (!currentTrialId || !currentUser) return;
    
    showStatusMessage('Auto-saving...', 'saving', 1000);
    
    try {
        saveTrialUpdates();
        showStatusMessage('Auto-saved', 'saved', 1500);
    } catch (error) {
        console.error('Auto-save failed:', error);
        showStatusMessage('Auto-save failed', 'error', 2000);
    }
}

// Debounce function
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

// Check for unsaved changes
function hasUnsavedChanges() {
    return false; // Simplified for now
}

// Utility Functions
function getMaxDay(config) {
    if (!config || config.length === 0) return 0;
    return Math.max(...config.map(c => c.day));
}

function getUniqueDays(config) {
    if (!config || config.length === 0) return [];
    return [...new Set(config.map(c => c.day || c.date))].sort();
}

function getUniqueClasses(config) {
    if (!config || config.length === 0) return [];
    return [...new Set(config.map(c => c.className))].sort();
}

function getUniqueJudges(config) {
    if (!config || config.length === 0) return [];
    return [...new Set(config.map(c => c.judge))].sort();
}

// Copy URL to clipboard
function copyURL() {
    const urlInput = document.getElementById('shareableURL');
    if (urlInput) {
        urlInput.select();
        urlInput.setSelectionRange(0, 99999);
        
        try {
            document.execCommand('copy');
            showStatusMessage('URL copied to clipboard!', 'success');
        } catch (err) {
            navigator.clipboard.writeText(urlInput.value).then(() => {
                showStatusMessage('URL copied to clipboard!', 'success');
            }).catch(() => {
                showStatusMessage('Failed to copy URL', 'error');
            });
        }
    }
}

// Open entry form in new tab
function openEntryForm() {
    const url = document.getElementById('shareableURL');
    if (url && url.value) {
        window.open(url.value, '_blank');
    }
}

// Download file utility
function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Generate unique ID
function generateId() {
    return 'trial_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// My Trials management
function showMyTrials() {
    const myTrialsSection = document.querySelector('.my-trials');
    if (myTrialsSection) {
        myTrialsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Export utilities
function exportToCSV() {
    if (entryResults.length === 0) {
        showStatusMessage('No entries to export', 'warning');
        return;
    }
    
    const headers = ['Registration', 'Call Name', 'Registered Name', 'Handler', 'Class', 'Judge', 'Date', 'Round'];
    const csvContent = [
        headers.join(','),
        ...entryResults.map(entry => [
            entry.registration || '',
            entry.callName || '',
            entry.registeredName || '',
            entry.handler || '',
            entry.className || '',
            entry.judge || '',
            entry.date || '',
            entry.roundNum || ''
        ].map(field => `"${field}"`).join(','))
    ].join('\n');
    
    downloadFile(csvContent, `trial_entries_${currentTrialId}.csv`, 'text/csv');
    showStatusMessage('Entries exported to CSV', 'success');
}

// Print utilities
function printElement(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const printContent = element.innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Print</title>
                <link rel="stylesheet" href="css/print.css">
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    @media print { .no-print { display: none !important; } }
                </style>
            </head>
            <body>
                ${printContent}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}
// ADD THESE FUNCTIONS TO THE END OF YOUR utils.js FILE

// Ensure functions are globally accessible
window.editTrial = function(trialId) {
    console.log('Global editTrial called:', trialId);
    
    if (!currentUser) {
        showStatusMessage('User not logged in', 'error');
        return;
    }
    
    const userTrials = JSON.parse(localStorage.getItem(`trials_${currentUser.username}`) || '{}');
    const trial = userTrials[trialId];
    
    if (!trial) {
        showStatusMessage('Trial not found', 'error');
        console.log('Available trials:', Object.keys(userTrials));
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
    const titleEl = document.getElementById('trialTitle');
    const nameEl = document.getElementById('trialName');
    
    if (titleEl) titleEl.textContent = 'Edit Trial: ' + (trial.name || 'Untitled');
    if (nameEl) nameEl.value = trial.name || '';
    
    // Generate entry form link if trial is configured
    if (trialConfig.length > 0) {
        const baseURL = window.location.origin + window.location.pathname;
        const entryURL = `${baseURL}?trial=${currentTrialId}&mode=entry`;
        
        const urlEl = document.getElementById('shareableURL');
        const linkEl = document.getElementById('entryFormLink');
        const saveEl = document.getElementById('saveTrialSection');
        
        if (urlEl) urlEl.value = entryURL;
        if (linkEl) linkEl.style.display = 'block';
        if (saveEl) saveEl.style.display = 'block';
        
        console.log('Entry URL generated:', entryURL);
    }
    
    // Switch to setup tab
    const setupTab = document.querySelector('.nav-tab');
    if (setupTab) {
        showTab('setup', setupTab);
    }
    
    showStatusMessage('Trial loaded for editing', 'success');
};

window.copyTrialLink = function(trialId) {
    console.log('Global copyTrialLink called:', trialId);
    
    const baseURL = window.location.origin + window.location.pathname;
    const entryURL = `${baseURL}?trial=${trialId}&mode=entry`;
    
    console.log('Generated entry URL:', entryURL);
    
    // Try to copy to clipboard
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(entryURL).then(() => {
            showStatusMessage('Entry form link copied to clipboard!', 'success');
            console.log('Link copied successfully');
        }).catch((error) => {
            console.log('Clipboard API failed:', error);
            fallbackCopyToClipboard(entryURL);
        });
    } else {
        fallbackCopyToClipboard(entryURL);
    }
};

window.duplicateTrial = function(trialId) {
    console.log('Global duplicateTrial called:', trialId);
    
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
        name: (trial.name || 'Trial') + ' (Copy)',
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
};

window.deleteTrial = function(trialId) {
    console.log('Global deleteTrial called:', trialId);
    
    if (!currentUser) {
        showStatusMessage('User not logged in', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this trial?\n\nThis action cannot be undone.')) {
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
        const nameEl = document.getElementById('trialName');
        const containerEl = document.getElementById('daysContainer');
        const saveEl = document.getElementById('saveTrialSection');
        const linkEl = document.getElementById('entryFormLink');
        
        if (nameEl) nameEl.value = '';
        if (containerEl) containerEl.innerHTML = '';
        if (saveEl) saveEl.style.display = 'none';
        if (linkEl) linkEl.style.display = 'none';
    }
    
    loadUserTrials();
    showStatusMessage('Trial deleted successfully', 'success');
};

// Fallback clipboard function
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    textArea.style.top = '0';
    textArea.style.left = '0';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showStatusMessage('Entry form link copied to clipboard!', 'success');
        } else {
            showStatusMessage('Failed to copy link', 'error');
            console.log('Link to copy manually:', text);
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        showStatusMessage('Copy failed - check console for link', 'error');
        console.log('Link to copy manually:', text);
    }
    
    document.body.removeChild(textArea);
}

// Enhanced login handler with better debugging
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    console.log('Login attempt:', username);
    
    if (!username || !password) {
        showStatusMessage('Please enter both username and password', 'error');
        return;
    }
    
    // Simple authentication (in real app, this would be server-side)
    const users = JSON.parse(localStorage.getItem('trialUsers') || '{}');
    console.log('Available users:', Object.keys(users));
    
    if (users[username] && users[username].password === password) {
        currentUser = {
            username: username,
            fullName: users[username].fullName,
            email: users[username].email
        };
        
        console.log('Login successful for:', currentUser);
        
        document.getElementById('authOverlay').classList.add('hidden');
        document.getElementById('mainApp').classList.add('active');
        document.getElementById('userInfo').textContent = `Welcome, ${users[username].fullName}`;
        
        // Load user data after successful login
        setTimeout(() => {
            loadUserTrials();
            
            // Auto-create first trial if none exist
            const userTrials = JSON.parse(localStorage.getItem(`trials_${currentUser.username}`) || '{}');
            if (Object.keys(userTrials).length === 0) {
                console.log('No trials found, creating first trial');
                setTimeout(() => {
                    createNewTrial();
                }, 500);
            }
        }, 100);
        
        showStatusMessage('Login successful', 'success');
    } else {
        showStatusMessage('Invalid username or password', 'error');
        console.log('Login failed for:', username);
    }
}
