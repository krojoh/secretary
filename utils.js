// Utility Functions for Trial Management System

// Global variables - Initialize here
var currentUser = null;
var currentTrialId = null;
var dogData = [];
var availableClasses = [];
var availableJudges = [];
var trialConfig = [];
var entryResults = [];
var runningOrders = {};
var digitalScores = {};
var totalDays = 0;
var savedDays = 0;
var draggedElement = null;
var currentDigitalSheet = null;
var autoSaveTimer = null;
var digitalScoreData = {};
var selectedSheetType = 'scent';

// Default data arrays
var defaultClasses = [
    'Novice A', 'Novice B', 'Open A', 'Open B', 'Utility A', 'Utility B',
    'Beginner Novice A', 'Beginner Novice B', 'Graduate Novice', 'Graduate Open',
    'Versatility', 'Scent Detective', 'Rally Novice A', 'Rally Novice B',
    'Rally Intermediate', 'Rally Advanced A', 'Rally Advanced B', 'Rally Excellent A', 'Rally Excellent B'
];

var defaultJudges = [
    'Judge Smith', 'Judge Johnson', 'Judge Williams', 'Judge Brown', 'Judge Jones',
    'Judge Garcia', 'Judge Miller', 'Judge Davis', 'Judge Rodriguez', 'Judge Martinez',
    'Judge Anderson', 'Judge Taylor', 'Judge Thomas', 'Judge Hernandez', 'Judge Moore'
];

// Status message utility
function showStatusMessage(message, type) {
    var statusDiv = document.createElement('div');
    statusDiv.className = 'alert alert-' + type;
    statusDiv.textContent = message;
    statusDiv.style.position = 'fixed';
    statusDiv.style.top = '20px';
    statusDiv.style.right = '20px';
    statusDiv.style.zIndex = '10000';
    statusDiv.style.maxWidth = '300px';
    
    document.body.appendChild(statusDiv);
    
    setTimeout(function() {
        if (statusDiv.parentNode) {
            document.body.removeChild(statusDiv);
        }
    }, 3000);
}

// File download utility
function downloadFile(content, filename, contentType) {
    var blob = new Blob([content], { type: contentType });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Date formatting utility
function formatDate(dateString) {
    var date = new Date(dateString);
    return date.toLocaleDateString();
}

// Get unique values from array of objects
function getUniqueValues(data, field1, field2) {
    var values = [];
    for (var i = 0; i < data.length; i++) {
        var value = data[i][field1] || data[i][field2];
        if (value && values.indexOf(value) === -1) {
            values.push(value);
        }
    }
    return values;
}

// Load dog data from JSON or use fallback
function loadDogData() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', './data.json', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    
                    if (Array.isArray(data) && data.length > 0) {
                        dogData = data;
                        availableClasses = getUniqueValues(data, 'className', 'class');
                        availableJudges = getUniqueValues(data, 'judge');
                        console.log('Dog data loaded successfully:', dogData.length, 'records');
                        showStatusMessage('Dog data loaded successfully!', 'success');
                    } else {
                        console.warn('JSON file appears to be empty or invalid format');
                        loadFallbackData();
                    }
                } catch (error) {
                    console.error('Error parsing JSON data:', error);
                    loadFallbackData();
                }
            } else {
                console.error('Could not load data.json');
                loadFallbackData();
            }
        }
    };
    xhr.send();
}

// Load fallback data if JSON fails
function loadFallbackData() {
    dogData = [
        { regNumber: "12345", callName: "Buddy" },
        { regNumber: "67890", callName: "Luna" },
        { regNumber: "11111", callName: "Max" },
        { regNumber: "22222", callName: "Bella" },
        { regNumber: "33333", callName: "Charlie" },
        { regNumber: "44444", callName: "Daisy" },
        { regNumber: "55555", callName: "Rocky" },
        { regNumber: "66666", callName: "Molly" }
    ];
    availableClasses = defaultClasses;
    availableJudges = defaultJudges;
    showStatusMessage('Using default data - could not load data.json', 'warning');
}

// Tab management utility
function showTab(tabName, element) {
    var tabs = document.querySelectorAll('.nav-tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    if (element) {
        element.classList.add('active');
    }
    
    var contents = document.querySelectorAll('.tab-content');
    for (var i = 0; i < contents.length; i++) {
        contents[i].classList.remove('active');
    }
    document.getElementById(tabName).classList.add('active');
    
    // Tab-specific initialization
    if (tabName === 'results' && currentTrialId && currentUser) {
        syncEntriesFromPublic();
    }
    
    if (tabName === 'cross-reference' && currentTrialId) {
        loadCrossReferenceTab();
    }
    
    if (tabName === 'running-order' && currentTrialId) {
        loadRunningOrderManagement();
    }
    
    if (tabName === 'score-sheets' && currentTrialId) {
        loadScoreSheetsManagement();
    }
    
    if (tabName === 'score-entry' && currentTrialId) {
        loadDigitalScoreEntry();
        loadExistingDigitalScores();
    }
}

// Handle URL parameters for direct access
function handleURLParameters() {
    var urlParams = new URLSearchParams(window.location.search);
    var trialId = urlParams.get('trial');
    var mode = urlParams.get('mode');
    
    if (trialId && mode === 'entry') {
        loadTrialForEntry(trialId);
        return true;
    }
    return false;
}

// Load trial for public entry form
function loadTrialForEntry(trialId) {
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    var trial = publicTrials[trialId];
    
    if (!trial) {
        alert('Trial not found or no longer available');
        return;
    }
    
    currentTrialId = trialId;
    trialConfig = trial.config || [];
    entryResults = trial.results || [];
    runningOrders = trial.runningOrders || {};
    digitalScores = trial.digitalScores || {};
    
    document.getElementById('authOverlay').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('userInfo').textContent = 'Entry Form: ' + (trial.name || 'Trial');
    
    document.querySelector('.my-trials').style.display = 'none';
    document.querySelector('.logout-btn').style.display = 'none';
    
    updateTrialOptions();
    showTab('entry', document.querySelectorAll('.nav-tab')[1]);
    
    // Hide other tabs for public entry form
    var tabs = document.querySelectorAll('.nav-tab');
    for (var i = 0; i < tabs.length; i++) {
        if (i !== 1) { // Keep only entry tab visible
            tabs[i].style.display = 'none';
        }
    }
}

// Initialize digital scoring system
function initializeDigitalScoring() {
    digitalScoreData = {};
    
    // Auto-save every 30 seconds if there's data
    setInterval(function() {
        if (Object.keys(digitalScoreData).length > 0) {
            saveScoreData();
        }
    }, 30000);
    
    console.log('Digital scoring system initialized');
}

// Get entries for specific class/round
function getEntriesForClassRound(date, className, round) {
    var entries = [];
    for (var i = 0; i < entryResults.length; i++) {
        var entry = entryResults[i];
        if (entry.date === date && entry.className === className && entry.round == round) {
            entries.push(entry);
        }
    }
    return entries;
}

// Get unique days from trial config
function getUniqueDays(config) {
    var days = [];
    for (var i = 0; i < config.length; i++) {
        if (days.indexOf(config[i].day) === -1) {
            days.push(config[i].day);
        }
    }
    return days;
}

// Get maximum day number from config
function getMaxDay(config) {
    var max = 0;
    for (var i = 0; i < config.length; i++) {
        if (config[i].day > max) {
            max = config[i].day;
        }
    }
    return max;
}

// Merge entries from multiple sources
function mergeEntries(userEntries, publicEntries) {
    var merged = [];
    var timestamps = {};
    
    // Add user entries first
    for (var i = 0; i < userEntries.length; i++) {
        merged.push(userEntries[i]);
        timestamps[userEntries[i].timestamp] = true;
    }
    
    // Add public entries that don't already exist
    for (var i = 0; i < publicEntries.length; i++) {
        if (!timestamps[publicEntries[i].timestamp]) {
            merged.push(publicEntries[i]);
            timestamps[publicEntries[i].timestamp] = true;
        }
    }
    
    return merged;
}

// Sync entries from public storage
function syncEntriesFromPublic() {
    if (!currentTrialId || !currentUser) return;
    
    var userTrials = JSON.parse(localStorage.getItem('trials_' + currentUser.username) || '{}');
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    
    if (userTrials[currentTrialId] && publicTrials[currentTrialId]) {
        var userEntries = userTrials[currentTrialId].results || [];
        var publicEntries = publicTrials[currentTrialId].results || [];
        
        // Merge entries
        entryResults = mergeEntries(userEntries, publicEntries);
        
        // Save back to user storage
        userTrials[currentTrialId].results = entryResults;
        userTrials[currentTrialId].updated = new Date().toISOString();
        localStorage.setItem('trials_' + currentUser.username, JSON.stringify(userTrials));
        
        // Update display
        updateResultsDisplay();
        updateCrossReferenceDisplay();
        
        // Update trial count in dashboard
        loadUserTrials();
    }
}

// Generate shareable URL
function generateShareableURL() {
    if (!currentTrialId) return;
    
    var baseURL = window.location.origin + window.location.pathname;
    var shareableURL = baseURL + '?trial=' + currentTrialId + '&mode=entry';
    
    var urlInput = document.getElementById('shareableURL');
    if (urlInput) {
        urlInput.value = shareableURL;
    }
}

// Copy URL to clipboard
function copyURL() {
    var urlInput = document.getElementById('shareableURL');
    urlInput.select();
    urlInput.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        showStatusMessage('URL copied to clipboard!', 'success');
    } catch (err) {
        showStatusMessage('Could not copy URL. Please copy manually.', 'warning');
    }
}

// Open entry form in new window
function openEntryForm() {
    var urlInput = document.getElementById('shareableURL');
    if (urlInput.value) {
        window.open(urlInput.value, '_blank');
    }
}

// Validation utilities
function validateEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateRequired(value) {
    return value && value.trim().length > 0;
}

// Array utilities
function findIndexBy(array, property, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][property] === value) {
            return i;
        }
    }
    return -1;
}

function groupBy(array, property) {
    var grouped = {};
    for (var i = 0; i < array.length; i++) {
        var key = array[i][property];
        if (!grouped[key]) {
            grouped[key] = [];
        }
        grouped[key].push(array[i]);
    }
    return grouped;
}

// Debug utilities
function debugInfo() {
    console.log('=== TRIAL SYSTEM DEBUG INFO ===');
    console.log('Current User:', currentUser);
    console.log('Current Trial ID:', currentTrialId);
    console.log('Trial Config:', trialConfig);
    console.log('Entry Results:', entryResults.length, 'entries');
    console.log('Dog Data:', dogData.length, 'records');
    console.log('Available Classes:', availableClasses);
    console.log('Available Judges:', availableJudges);
    console.log('Digital Score Data:', Object.keys(digitalScoreData).length, 'entries');
}

// Error handling utility
function handleError(error, context) {
    console.error('Error in ' + context + ':', error);
    showStatusMessage('An error occurred in ' + context + '. Check console for details.', 'error');
}

// Local storage utilities
function getFromStorage(key, defaultValue) {
    try {
        var item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
}

function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}