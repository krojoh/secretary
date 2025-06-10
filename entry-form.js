// Entry Form Functions

// Registration Number Typeahead
function handleRegNumberTypeahead(input) {
    var query = input.value.toLowerCase();
    var dropdown = document.getElementById('regNumberDropdown');
    
    if (query.length === 0) {
        dropdown.style.display = 'none';
        document.getElementById('callName').textContent = 'Call Name will appear here';
        document.getElementById('callName').style.color = '#666';
        return;
    }

    var matches = [];
    for (var i = 0; i < dogData.length; i++) {
        var dog = dogData[i];
        if (dog.regNumber.toLowerCase().indexOf(query) !== -1 || 
            dog.callName.toLowerCase().indexOf(query) !== -1) {
            matches.push(dog);
        }
    }

    if (matches.length > 0) {
        var html = '';
        for (var i = 0; i < matches.length; i++) {
            var dog = matches[i];
            html += '<div class="typeahead-item" onclick="selectRegNumber(\'' + dog.regNumber + '\', \'' + dog.callName + '\')">' + dog.regNumber + ' - ' + dog.callName + '</div>';
        }
        dropdown.innerHTML = html;
        dropdown.style.display = 'block';

        // Auto-select if exact match
        for (var i = 0; i < matches.length; i++) {
            if (matches[i].regNumber.toLowerCase() === query) {
                document.getElementById('callName').textContent = matches[i].callName;
                document.getElementById('callName').style.color = '#28a745';
                break;
            }
        }
    } else {
        dropdown.style.display = 'none';
        document.getElementById('callName').textContent = 'Not found';
        document.getElementById('callName').style.color = '#dc3545';
    }
}

function selectRegNumber(regNumber, callName) {
    document.getElementById('regNumber').value = regNumber;
    document.getElementById('callName').textContent = callName;
    document.getElementById('callName').style.color = '#28a745';
    document.getElementById('regNumberDropdown').style.display = 'none';
}

function hideRegNumberDropdown() {
    setTimeout(function() {
        document.getElementById('regNumberDropdown').style.display = 'none';
    }, 200);
}

function showRegNumberDropdown() {
    var input = document.getElementById('regNumber');
    if (input.value.length > 0) {
        handleRegNumberTypeahead(input);
    }
}

// Entry Submission
function submitEntry() {
    var regNumber = document.getElementById('regNumber').value.trim();
    var handlerName = document.getElementById('handlerName').value.trim();
    var selectedTrials = document.querySelectorAll('input[name="trialSelection"]:checked');

    if (!regNumber) {
        alert('Please enter a registration number');
        return;
    }

    if (!handlerName) {
        alert('Please enter handler name');
        return;
    }

    if (selectedTrials.length === 0) {
        alert('Please select at least one trial');
        return;
    }

    // Find dog information
    var dog = null;
    for (var i = 0; i < dogData.length; i++) {
        if (dogData[i].regNumber === regNumber) {
            dog = dogData[i];
            break;
        }
    }
    var callName = dog ? dog.callName : document.getElementById('callName').textContent;
    
    if (callName === 'Call Name will appear here' || callName === 'Not found') {
        callName = 'Unknown';
    }

    // Create entries for each selected trial
    for (var i = 0; i < selectedTrials.length; i++) {
        var selectionValue = selectedTrials[i].value;
        var parts = selectionValue.split('-');
        var configIndex = parseInt(parts[0]);
        var entryType = parts[1];
        var config = trialConfig[configIndex];

        var entry = {
            regNumber: regNumber,
            callName: callName,
            handler: handlerName,
            day: config.day,
            date: config.date,
            className: config.className,
            round: config.roundNum,
            judge: config.judge,
            entryType: entryType,
            timestamp: new Date().toISOString()
        };

        entryResults.push(entry);
    }

    // Save entries back to trial data immediately
    saveEntriesToTrial();
    updateResultsDisplay();
    updateCrossReferenceDisplay();
    
    // Clear form
    clearEntryForm();

    showStatusMessage('Entry(s) submitted successfully! (' + selectedTrials.length + ' trial(s))', 'success');
}

function clearEntryForm() {
    document.getElementById('regNumber').value = '';
    document.getElementById('handlerName').value = '';
    document.getElementById('callName').textContent = 'Call Name will appear here';
    document.getElementById('callName').style.color = '#666';
    clearSelections();
}

function clearSelections() {
    var checkboxes = document.querySelectorAll('input[name="trialSelection"]');
    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
    }
}

// Entry Validation
function validateEntry(regNumber, handlerName, selectedTrials) {
    var errors = [];
    
    if (!regNumber || regNumber.trim().length === 0) {
        errors.push('Registration number is required');
    }
    
    if (!handlerName || handlerName.trim().length === 0) {
        errors.push('Handler name is required');
    }
    
    if (selectedTrials.length === 0) {
        errors.push('At least one trial selection is required');
    }
    
    // Check for duplicate entries
    var duplicates = findDuplicateEntries(regNumber, selectedTrials);
    if (duplicates.length > 0) {
        errors.push('Duplicate entries detected: ' + duplicates.join(', '));
    }
    
    return errors;
}

function findDuplicateEntries(regNumber, selectedTrials) {
    var duplicates = [];
    
    for (var i = 0; i < selectedTrials.length; i++) {
        var selectionValue = selectedTrials[i].value;
        var parts = selectionValue.split('-');
        var configIndex = parseInt(parts[0]);
        var entryType = parts[1];
        var config = trialConfig[configIndex];
        
        // Check if this combination already exists
        for (var j = 0; j < entryResults.length; j++) {
            var existing = entryResults[j];
            if (existing.regNumber === regNumber &&
                existing.date === config.date &&
                existing.className === config.className &&
                existing.round === config.roundNum &&
                existing.entryType === entryType) {
                duplicates.push(config.className + ' Round ' + config.roundNum + ' (' + entryType + ')');
            }
        }
    }
    
    return duplicates;
}

// Entry Management Functions
function deleteEntry(index) {
    if (confirm('Are you sure you want to delete this entry?')) {
        entryResults.splice(index, 1);
        saveEntriesToTrial();
        updateResultsDisplay();
        updateCrossReferenceDisplay();
        showStatusMessage('Entry deleted successfully', 'success');
    }
}

function editEntry(index) {
    var entry = entryResults[index];
    if (!entry) return;
    
    // Populate form with existing entry data
    document.getElementById('regNumber').value = entry.regNumber;
    document.getElementById('handlerName').value = entry.handler;
    document.getElementById('callName').textContent = entry.callName;
    document.getElementById('callName').style.color = '#28a745';
    
    // Find and check the corresponding trial selection
    var configIndex = findConfigIndex(entry);
    if (configIndex !== -1) {
        var checkboxValue = configIndex + '-' + entry.entryType;
        var checkbox = document.querySelector('input[name="trialSelection"][value="' + checkboxValue + '"]');
        if (checkbox) {
            checkbox.checked = true;
        }
    }
    
    // Remove the original entry
    entryResults.splice(index, 1);
    saveEntriesToTrial();
    updateResultsDisplay();
    
    // Switch to entry tab
    showTab('entry', document.querySelectorAll('.nav-tab')[1]);
    
    showStatusMessage('Entry loaded for editing. Make changes and submit again.', 'info');
}

function findConfigIndex(entry) {
    for (var i = 0; i < trialConfig.length; i++) {
        var config = trialConfig[i];
        if (config.date === entry.date &&
            config.className === entry.className &&
            config.roundNum === entry.round &&
            config.judge === entry.judge) {
            return i;
        }
    }
    return -1;
}

// Entry Statistics
function getEntryStatistics() {
    if (entryResults.length === 0) {
        return {
            totalEntries: 0,
            uniqueDogs: 0,
            uniqueHandlers: 0,
            regularEntries: 0,
            feoEntries: 0,
            entriesByClass: {},
            entriesByDate: {}
        };
    }
    
    var stats = {
        totalEntries: entryResults.length,
        uniqueDogs: new Set(),
        uniqueHandlers: new Set(),
        regularEntries: 0,
        feoEntries: 0,
        entriesByClass: {},
        entriesByDate: {}
    };
    
    for (var i = 0; i < entryResults.length; i++) {
        var entry = entryResults[i];
        
        stats.uniqueDogs.add(entry.regNumber);
        stats.uniqueHandlers.add(entry.handler);
        
        if (entry.entryType === 'regular') {
            stats.regularEntries++;
        } else if (entry.entryType === 'feo') {
            stats.feoEntries++;
        }
        
        // Count by class
        if (!stats.entriesByClass[entry.className]) {
            stats.entriesByClass[entry.className] = 0;
        }
        stats.entriesByClass[entry.className]++;
        
        // Count by date
        if (!stats.entriesByDate[entry.date]) {
            stats.entriesByDate[entry.date] = 0;
        }
        stats.entriesByDate[entry.date]++;
    }
    
    stats.uniqueDogs = stats.uniqueDogs.size;
    stats.uniqueHandlers = stats.uniqueHandlers.size;
    
    return stats;
}

function showEntryStatistics() {
    var stats = getEntryStatistics();
    
    var message = 'Entry Statistics:\n\n';
    message += 'Total Entries: ' + stats.totalEntries + '\n';
    message += 'Unique Dogs: ' + stats.uniqueDogs + '\n';
    message += 'Unique Handlers: ' + stats.uniqueHandlers + '\n';
    message += 'Regular Entries: ' + stats.regularEntries + '\n';
    message += 'FEO Entries: ' + stats.feoEntries + '\n\n';
    
    message += 'Entries by Class:\n';
    for (var className in stats.entriesByClass) {
        message += '  ' + className + ': ' + stats.entriesByClass[className] + '\n';
    }
    
    message += '\nEntries by Date:\n';
    for (var date in stats.entriesByDate) {
        message += '  ' + formatDate(date) + ': ' + stats.entriesByDate[date] + '\n';
    }
    
    alert(message);
}

// Bulk Entry Functions
function importEntriesFromCSV(fileInput) {
    var file = fileInput.files[0];
    if (!file) return;
    
    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var csv = e.target.result;
            var lines = csv.split('\n');
            var headers = lines[0].split(',').map(function(h) { return h.trim(); });
            
            var importedEntries = [];
            var errors = [];
            
            for (var i = 1; i < lines.length; i++) {
                if (lines[i].trim() === '') continue;
                
                var values = lines[i].split(',').map(function(v) { return v.trim(); });
                
                if (values.length < headers.length) {
                    errors.push('Line ' + (i + 1) + ': Insufficient columns');
                    continue;
                }
                
                var entry = {};
                for (var j = 0; j < headers.length; j++) {
                    entry[headers[j]] = values[j];
                }
                
                // Validate required fields
                if (!entry.regNumber || !entry.handler || !entry.className) {
                    errors.push('Line ' + (i + 1) + ': Missing required fields');
                    continue;
                }
                
                // Format entry to match system structure
                var formattedEntry = {
                    regNumber: entry.regNumber,
                    callName: entry.callName || 'Unknown',
                    handler: entry.handler,
                    date: entry.date || new Date().toISOString().split('T')[0],
                    className: entry.className,
                    round: parseInt(entry.round) || 1,
                    judge: entry.judge || 'TBD',
                    entryType: entry.entryType || 'regular',
                    timestamp: new Date().toISOString()
                };
                
                importedEntries.push(formattedEntry);
            }
            
            if (errors.length > 0) {
                alert('Import completed with errors:\n' + errors.join('\n'));
            }
            
            if (importedEntries.length > 0) {
                entryResults = entryResults.concat(importedEntries);
                saveEntriesToTrial();
                updateResultsDisplay();
                updateCrossReferenceDisplay();
                showStatusMessage(importedEntries.length + ' entries imported successfully', 'success');
            }
            
        } catch (error) {
            showStatusMessage('Error importing CSV: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

function exportEntriesToCSV() {
    if (entryResults.length === 0) {
        alert('No entries to export');
        return;
    }
    
    var csv = 'Registration,Call Name,Handler,Date,Class,Round,Judge,Entry Type,Timestamp\n';
    
    for (var i = 0; i < entryResults.length; i++) {
        var entry = entryResults[i];
        csv += '"' + entry.regNumber + '","' + 
               entry.callName + '","' + 
               entry.handler + '","' + 
               entry.date + '","' + 
               entry.className + '","' + 
               entry.round + '","' + 
               entry.judge + '","' + 
               entry.entryType + '","' + 
               entry.timestamp + '"\n';
    }
    
    var filename = 'trial_entries_' + new Date().toISOString().split('T')[0] + '.csv';
    downloadFile(csv, filename, 'text/csv');
    showStatusMessage('Entries exported successfully', 'success');
}

// Entry Search and Filter
function searchEntries(searchTerm) {
    if (!searchTerm) return entryResults;
    
    var term = searchTerm.toLowerCase();
    return entryResults.filter(function(entry) {
        return entry.regNumber.toLowerCase().includes(term) ||
               entry.callName.toLowerCase().includes(term) ||
               entry.handler.toLowerCase().includes(term) ||
               entry.className.toLowerCase().includes(term) ||
               entry.judge.toLowerCase().includes(term);
    });
}

function filterEntriesByDate(date) {
    if (!date) return entryResults;
    
    return entryResults.filter(function(entry) {
        return entry.date === date;
    });
}

function filterEntriesByClass(className) {
    if (!className) return entryResults;
    
    return entryResults.filter(function(entry) {
        return entry.className === className;
    });
}

function filterEntriesByType(entryType) {
    if (!entryType) return entryResults;
    
    return entryResults.filter(function(entry) {
        return entry.entryType === entryType;
    });
}