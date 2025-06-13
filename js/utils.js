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
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
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
        
        loadUserTrials();
        showStatusMessage('Login successful', 'success');
    } else {
        showStatusMessage('Invalid username or password', 'error');
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const fullName = document.getElementById('regFullName').value;
    const email = document.getElementById('regEmail').value;
    
    if (!username || !password || !fullName || !email) {
        showStatusMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showStatusMessage('Passwords do not match', 'error');
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
    showAuthTab('login', document.querySelector('.auth-tab'));
    
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
    
    // Reload dog data for next session
    autoLoadExcelFile();
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
    return [...new Set(config.map(c => c.day))];
}

function getUniqueClasses(config) {
    if (!config || config.length === 0) return [];
    return [...new Set(config.map(c => c.className))];
}

function getUniqueJudges(config) {
    if (!config || config.length === 0) return [];
    return [...new Set(config.map(c => c.judge))];
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
