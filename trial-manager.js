// Trial Setup and Management Functions

// Generate days based on user input
function generateDays() {
    var numDays = parseInt(document.getElementById('trialDays').value);
    if (!numDays || numDays < 1) {
        alert('Please enter a valid number of days');
        return;
    }

    totalDays = numDays;
    savedDays = 0;
    var container = document.getElementById('daysContainer');
    container.innerHTML = '';

    for (var i = 1; i <= numDays; i++) {
        createDaySection(i, container);
    }
    
    // Show the save trial section
    document.getElementById('saveTrialSection').style.display = 'block';
}

function createDaySection(dayNum, container) {
    var dayDiv = document.createElement('div');
    dayDiv.className = 'day-container';
    dayDiv.innerHTML = '<div class="day-header">Day ' + dayNum + '</div>' +
        '<div class="form-group">' +
        '<span class="label">Date for Day ' + dayNum + ':</span>' +
        '<input type="date" id="date_' + dayNum + '">' +
        '</div>' +
        '<div class="classes-section">' +
        '<div class="form-group">' +
        '<span class="label">How many classes this day?</span>' +
        '<input type="number" id="classes_' + dayNum + '" min="1" max="20" class="yellow-highlight" placeholder="Number" onchange="generateClasses(' + dayNum + ')">' +
        '</div>' +
        '<div id="classesContainer_' + dayNum + '"></div>' +
        '</div>' +
        '<div class="form-group">' +
        '<button onclick="saveTrialDay(' + dayNum + ')">Save Day ' + dayNum + '</button>' +
        '</div>';
    container.appendChild(dayDiv);
}

function generateClasses(dayNum) {
    var numClasses = parseInt(document.getElementById('classes_' + dayNum).value);
    if (!numClasses || numClasses < 1) return;

    var container = document.getElementById('classesContainer_' + dayNum);
    container.innerHTML = '';

    for (var i = 1; i <= numClasses; i++) {
        createClassSection(dayNum, i, container);
    }
}

function createClassSection(dayNum, classNum, container) {
    var classDiv = document.createElement('div');
    classDiv.className = 'class-container';
    
    classDiv.innerHTML = '<div class="class-header">Class ' + classNum + '</div>' +
        '<div class="form-group">' +
        '<span class="label">Class Name:</span>' +
        '<div class="typeahead-container">' +
        '<input type="text" id="class_' + dayNum + '_' + classNum + '" class="typeahead-input" placeholder="Type or select class name" onkeyup="handleClassTypeahead(this, ' + dayNum + ', ' + classNum + ')" onblur="hideClassDropdown(' + dayNum + ', ' + classNum + ')" onfocus="showClassDropdown(' + dayNum + ', ' + classNum + ')">' +
        '<div id="classDropdown_' + dayNum + '_' + classNum + '" class="typeahead-dropdown"></div>' +
        '</div>' +
        '</div>' +
        '<div class="rounds-section">' +
        '<div class="form-group">' +
        '<span class="label">How many rounds?</span>' +
        '<input type="number" id="rounds_' + dayNum + '_' + classNum + '" min="1" max="10" placeholder="Number" onchange="generateRounds(' + dayNum + ', ' + classNum + ')">' +
        '</div>' +
        '<div id="roundsContainer_' + dayNum + '_' + classNum + '"></div>' +
        '</div>';
    container.appendChild(classDiv);
}

function generateRounds(dayNum, classNum) {
    var numRounds = parseInt(document.getElementById('rounds_' + dayNum + '_' + classNum).value);
    if (!numRounds || numRounds < 1) return;

    var container = document.getElementById('roundsContainer_' + dayNum + '_' + classNum);
    container.innerHTML = '';

    for (var i = 1; i <= numRounds; i++) {
        var roundDiv = document.createElement('div');
        roundDiv.style.margin = '10px 0';
        roundDiv.style.padding = '10px';
        roundDiv.style.background = '#f8f9fa';
        roundDiv.style.borderRadius = '5px';
        
        roundDiv.innerHTML = '<div class="form-group">' +
            '<span class="label">Round ' + i + ' Judge:</span>' +
            '<div class="typeahead-container">' +
            '<input type="text" id="judge_' + dayNum + '_' + classNum + '_' + i + '" class="typeahead-input" placeholder="Type or select judge name" onkeyup="handleJudgeTypeahead(this, ' + dayNum + ', ' + classNum + ', ' + i + ')" onblur="hideJudgeDropdown(' + dayNum + ', ' + classNum + ', ' + i + ')" onfocus="showJudgeDropdown(' + dayNum + ', ' + classNum + ', ' + i + ')">' +
            '<div id="judgeDropdown_' + dayNum + '_' + classNum + '_' + i + '" class="typeahead-dropdown"></div>' +
            '</div>' +
            '</div>' +
            '<div class="form-group">' +
            '<label style="display: flex; align-items: center; gap: 8px;">' +
            '<input type="checkbox" id="feo_' + dayNum + '_' + classNum + '_' + i + '">' +
            '<span>FEO (For Exhibition Only) available for this round</span>' +
            '</label>' +
            '</div>';
        container.appendChild(roundDiv);
    }
}

// Class Typeahead Functions
function handleClassTypeahead(input, dayNum, classNum) {
    var query = input.value.toLowerCase();
    var dropdown = document.getElementById('classDropdown_' + dayNum + '_' + classNum);
    
    if (query.length === 0) {
        dropdown.style.display = 'none';
        return;
    }

    var matches = [];
    for (var i = 0; i < availableClasses.length; i++) {
        if (availableClasses[i].toLowerCase().indexOf(query) !== -1) {
            matches.push(availableClasses[i]);
        }
    }

    if (matches.length > 0) {
        var html = '';
        for (var i = 0; i < matches.length; i++) {
            html += '<div class="typeahead-item" onclick="selectClass(\'' + matches[i] + '\', ' + dayNum + ', ' + classNum + ')">' + matches[i] + '</div>';
        }
        dropdown.innerHTML = html;
        dropdown.style.display = 'block';
    } else {
        dropdown.style.display = 'none';
    }
}

function selectClass(className, dayNum, classNum) {
    document.getElementById('class_' + dayNum + '_' + classNum).value = className;
    document.getElementById('classDropdown_' + dayNum + '_' + classNum).style.display = 'none';
}

function hideClassDropdown(dayNum, classNum) {
    setTimeout(function() {
        document.getElementById('classDropdown_' + dayNum + '_' + classNum).style.display = 'none';
    }, 200);
}

function showClassDropdown(dayNum, classNum) {
    var input = document.getElementById('class_' + dayNum + '_' + classNum);
    if (input.value.length > 0) {
        handleClassTypeahead(input, dayNum, classNum);
    } else {
        var dropdown = document.getElementById('classDropdown_' + dayNum + '_' + classNum);
        var html = '';
        for (var i = 0; i < availableClasses.length; i++) {
            html += '<div class="typeahead-item" onclick="selectClass(\'' + availableClasses[i] + '\', ' + dayNum + ', ' + classNum + ')">' + availableClasses[i] + '</div>';
        }
        dropdown.innerHTML = html;
        dropdown.style.display = 'block';
    }
}

// Judge Typeahead Functions
function handleJudgeTypeahead(input, dayNum, classNum, roundNum) {
    var query = input.value.toLowerCase();
    var dropdown = document.getElementById('judgeDropdown_' + dayNum + '_' + classNum + '_' + roundNum);
    
    if (query.length === 0) {
        dropdown.style.display = 'none';
        return;
    }

    var matches = [];
    for (var i = 0; i < availableJudges.length; i++) {
        if (availableJudges[i].toLowerCase().indexOf(query) !== -1) {
            matches.push(availableJudges[i]);
        }
    }

    if (matches.length > 0) {
        var html = '';
        for (var i = 0; i < matches.length; i++) {
            html += '<div class="typeahead-item" onclick="selectJudge(\'' + matches[i] + '\', ' + dayNum + ', ' + classNum + ', ' + roundNum + ')">' + matches[i] + '</div>';
        }
        dropdown.innerHTML = html;
        dropdown.style.display = 'block';
    } else {
        dropdown.style.display = 'none';
    }
}

function selectJudge(judgeName, dayNum, classNum, roundNum) {
    document.getElementById('judge_' + dayNum + '_' + classNum + '_' + roundNum).value = judgeName;
    document.getElementById('judgeDropdown_' + dayNum + '_' + classNum + '_' + roundNum).style.display = 'none';
}

function hideJudgeDropdown(dayNum, classNum, roundNum) {
    setTimeout(function() {
        document.getElementById('judgeDropdown_' + dayNum + '_' + classNum + '_' + roundNum).style.display = 'none';
    }, 200);
}

function showJudgeDropdown(dayNum, classNum, roundNum) {
    var input = document.getElementById('judge_' + dayNum + '_' + classNum + '_' + roundNum);
    if (input.value.length > 0) {
        handleJudgeTypeahead(input, dayNum, classNum, roundNum);
    } else {
        var dropdown = document.getElementById('judgeDropdown_' + dayNum + '_' + classNum + '_' + roundNum);
        var html = '';
        for (var i = 0; i < availableJudges.length; i++) {
            html += '<div class="typeahead-item" onclick="selectJudge(\'' + availableJudges[i] + '\', ' + dayNum + ', ' + classNum + ', ' + roundNum + ')">' + availableJudges[i] + '</div>';
        }
        dropdown.innerHTML = html;
        dropdown.style.display = 'block';
    }
}

// Save Trial Day Configuration
function saveTrialDay(dayNum) {
    var date = document.getElementById('date_' + dayNum).value;
    if (!date) {
        alert('Please set the date for Day ' + dayNum);
        return;
    }

    var numClasses = parseInt(document.getElementById('classes_' + dayNum).value);
    if (!numClasses) {
        alert('Please set the number of classes for Day ' + dayNum);
        return;
    }

    // Remove existing config for this day
    trialConfig = trialConfig.filter(function(config) {
        return config.day !== dayNum;
    });

    for (var classNum = 1; classNum <= numClasses; classNum++) {
        var className = document.getElementById('class_' + dayNum + '_' + classNum).value.trim();
        if (!className) {
            alert('Please enter a class name for Day ' + dayNum + ', Class ' + classNum);
            return;
        }

        var numRounds = parseInt(document.getElementById('rounds_' + dayNum + '_' + classNum).value);
        if (!numRounds) {
            alert('Please set the number of rounds for Day ' + dayNum + ', Class ' + classNum);
            return;
        }

        for (var roundNum = 1; roundNum <= numRounds; roundNum++) {
            var judge = document.getElementById('judge_' + dayNum + '_' + classNum + '_' + roundNum).value.trim();
            if (!judge) {
                alert('Please enter a judge name for Day ' + dayNum + ', Class ' + classNum + ', Round ' + roundNum);
                return;
            }

            var feoOffered = document.getElementById('feo_' + dayNum + '_' + classNum + '_' + roundNum).checked;

            trialConfig.push({
                day: dayNum,
                date: date,
                classNum: classNum,
                className: className,
                roundNum: roundNum,
                judge: judge,
                feoOffered: feoOffered
            });
        }
    }

    savedDays++;
    updateTrialOptions();
    showStatusMessage('Day ' + dayNum + ' configuration saved!', 'success');

    // Check if all days are saved and show save trial button
    if (savedDays === totalDays) {
        document.getElementById('saveTrialSection').style.display = 'block';
        showStatusMessage('All days configured! Please review and save your trial.', 'info');
    }
}

// Populate existing trial data when editing
function populateExistingTrialData() {
    for (var i = 0; i < trialConfig.length; i++) {
        var config = trialConfig[i];
        var dayNum = config.day;
        var dateInput = document.getElementById('date_' + dayNum);
        if (dateInput) {
            dateInput.value = config.date;
        }
        
        var classInput = document.getElementById('class_' + dayNum + '_' + config.classNum);
        if (classInput) {
            classInput.value = config.className;
        }
        
        var judgeInput = document.getElementById('judge_' + dayNum + '_' + config.classNum + '_' + config.roundNum);
        if (judgeInput) {
            judgeInput.value = config.judge;
        }
        
        var feoInput = document.getElementById('feo_' + dayNum + '_' + config.classNum + '_' + config.roundNum);
        if (feoInput) {
            feoInput.checked = config.feoOffered || false;
        }
    }
}

// Update trial options for entry form
function updateTrialOptions() {
    var container = document.getElementById('trialOptions');
    
    if (trialConfig.length === 0) {
        container.innerHTML = '<p style="color: #666; font-style: italic;">Please complete trial setup first.</p>';
        return;
    }
    
    var groupedByDay = {};
    for (var i = 0; i < trialConfig.length; i++) {
        var config = trialConfig[i];
        if (!groupedByDay[config.day]) {
            groupedByDay[config.day] = {};
        }
        if (!groupedByDay[config.day][config.className]) {
            groupedByDay[config.day][config.className] = [];
        }
        groupedByDay[config.day][config.className].push(config);
    }

    // Sort rounds within each class
    for (var day in groupedByDay) {
        for (var className in groupedByDay[day]) {
            groupedByDay[day][className].sort(function(a, b) {
                return a.roundNum - b.roundNum;
            });
        }
    }

    var html = '';
    var sortedDays = Object.keys(groupedByDay).sort(function(a, b) {
        return parseInt(a) - parseInt(b);
    });
    
    for (var d = 0; d < sortedDays.length; d++) {
        var day = sortedDays[d];
        var firstClass = Object.keys(groupedByDay[day])[0];
        var firstConfig = groupedByDay[day][firstClass][0];
        
        html += '<div class="day-group">';
        html += '<div class="day-group-header">Day ' + day + ' - ' + firstConfig.date + '</div>';
        
        var sortedClasses = Object.keys(groupedByDay[day]).sort();
        
        for (var c = 0; c < sortedClasses.length; c++) {
            var className = sortedClasses[c];
            html += '<div class="class-group">';
            html += '<div class="class-group-header">' + className + '</div>';
            
            var configs = groupedByDay[day][className];
            for (var i = 0; i < configs.length; i++) {
                var config = configs[i];
                var configIndex = -1;
                for (var j = 0; j < trialConfig.length; j++) {
                    if (trialConfig[j].day === config.day && 
                        trialConfig[j].classNum === config.classNum && 
                        trialConfig[j].roundNum === config.roundNum) {
                        configIndex = j;
                        break;
                    }
                }
                
                html += '<div class="trial-option">' +
                    '<div style="font-weight: bold; margin-bottom: 8px;">' +
                    'Round ' + config.roundNum + ' - ' + config.judge +
                    '</div>' +
                    '<div style="margin-bottom: 10px;">' +
                    '<label style="margin-right: 15px;">' +
                    '<input type="checkbox" name="trialSelection" value="' + configIndex + '-regular"> Regular Entry' +
                    '</label>';
                
                if (config.feoOffered) {
                    html += '<label>' +
                        '<input type="checkbox" name="trialSelection" value="' + configIndex + '-feo"> FEO Entry' +
                        '</label>';
                }
                
                html += '</div></div>';
            }
            html += '</div>';
        }
        html += '</div>';
    }
    container.innerHTML = html;
}

// Trial Configuration Validation
function validateTrialConfiguration() {
    if (trialConfig.length === 0) {
        return { valid: false, message: 'No trial configuration found' };
    }
    
    var errors = [];
    var dayCheck = {};
    
    for (var i = 0; i < trialConfig.length; i++) {
        var config = trialConfig[i];
        
        // Check for required fields
        if (!config.date) errors.push('Missing date for Day ' + config.day);
        if (!config.className) errors.push('Missing class name for Day ' + config.day);
        if (!config.judge) errors.push('Missing judge for Day ' + config.day + ', Class ' + config.classNum);
        
        // Track days for completeness check
        dayCheck[config.day] = true;
    }
    
    // Check if all days from 1 to totalDays are present
    for (var day = 1; day <= totalDays; day++) {
        if (!dayCheck[day]) {
            errors.push('Day ' + day + ' is not configured');
        }
    }
    
    if (errors.length > 0) {
        return { valid: false, message: errors.join('; ') };
    }
    
    return { valid: true, message: 'Trial configuration is valid' };
}

// Get trial summary statistics
function getTrialSummary() {
    if (trialConfig.length === 0) {
        return {
            totalDays: 0,
            totalClasses: 0,
            totalRounds: 0,
            totalJudges: 0,
            feoOffered: 0
        };
    }
    
    var uniqueDays = new Set();
    var uniqueClasses = new Set();
    var uniqueJudges = new Set();
    var feoCount = 0;
    
    for (var i = 0; i < trialConfig.length; i++) {
        var config = trialConfig[i];
        uniqueDays.add(config.day);
        uniqueClasses.add(config.className);
        uniqueJudges.add(config.judge);
        if (config.feoOffered) feoCount++;
    }
    
    return {
        totalDays: uniqueDays.size,
        totalClasses: uniqueClasses.size,
        totalRounds: trialConfig.length,
        totalJudges: uniqueJudges.size,
        feoOffered: feoCount
    };
}

// Duplicate trial configuration
function duplicateTrialConfig() {
    if (trialConfig.length === 0) {
        alert('No trial configuration to duplicate');
        return;
    }
    
    var newTrialName = prompt('Enter name for the duplicated trial:');
    if (!newTrialName) return;
    
    var newTrialId = 'trial_' + Date.now();
    var duplicatedConfig = JSON.parse(JSON.stringify(trialConfig));
    
    // Update dates to be relative to today
    var today = new Date();
    var baseDate = new Date(duplicatedConfig[0].date);
    var dayOffset = Math.ceil((today - baseDate) / (1000 * 60 * 60 * 24));
    
    for (var i = 0; i < duplicatedConfig.length; i++) {
        var originalDate = new Date(duplicatedConfig[i].date);
        originalDate.setDate(originalDate.getDate() + dayOffset);
        duplicatedConfig[i].date = originalDate.toISOString().split('T')[0];
    }
    
    var trialData = {
        name: newTrialName,
        config: duplicatedConfig,
        results: [],
        runningOrders: {},
        digitalScores: {},
        digitalScoreData: {},
        owner: currentUser.username,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
    };
    
    // Save duplicated trial
    var userTrials = JSON.parse(localStorage.getItem('trials_' + currentUser.username) || '{}');
    userTrials[newTrialId] = trialData;
    localStorage.setItem('trials_' + currentUser.username, JSON.stringify(userTrials));
    
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    publicTrials[newTrialId] = trialData;
    localStorage.setItem('publicTrials', JSON.stringify(publicTrials));
    
    loadUserTrials();
    showStatusMessage('Trial duplicated successfully as "' + newTrialName + '"', 'success');
}

// Import trial configuration from file
function importTrialConfig(fileInput) {
    var file = fileInput.files[0];
    if (!file) return;
    
    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var importedData = JSON.parse(e.target.result);
            
            if (importedData.config && Array.isArray(importedData.config)) {
                if (confirm('This will replace the current trial configuration. Continue?')) {
                    trialConfig = importedData.config;
                    
                    // Update form based on imported config
                    if (trialConfig.length > 0) {
                        var maxDay = getMaxDay(trialConfig);
                        document.getElementById('trialDays').value = maxDay;
                        totalDays = maxDay;
                        savedDays = maxDay;
                        
                        generateDays();
                        setTimeout(function() {
                            populateExistingTrialData();
                        }, 100);
                    }
                    
                    updateTrialOptions();
                    showStatusMessage('Trial configuration imported successfully', 'success');
                }
            } else {
                throw new Error('Invalid trial configuration format');
            }
        } catch (error) {
            showStatusMessage('Error importing trial configuration: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

// Export trial configuration to file
function exportTrialConfig() {
    if (trialConfig.length === 0) {
        alert('No trial configuration to export');
        return;
    }
    
    var exportData = {
        name: document.getElementById('trialName').value || 'Exported Trial',
        config: trialConfig,
        exportDate: new Date().toISOString(),
        summary: getTrialSummary()
    };
    
    var exportJson = JSON.stringify(exportData, null, 2);
    var filename = (exportData.name || 'trial_config').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.json';
    
    downloadFile(exportJson, filename, 'application/json');
    showStatusMessage('Trial configuration exported successfully', 'success');
}

// Trial Template Management
function saveAsTemplate() {
    if (trialConfig.length === 0) {
        alert('No trial configuration to save as template');
        return;
    }
    
    var templateName = prompt('Enter template name:');
    if (!templateName) return;
    
    var templates = JSON.parse(localStorage.getItem('trialTemplates') || '{}');
    templates[templateName] = {
        name: templateName,
        config: trialConfig,
        summary: getTrialSummary(),
        created: new Date().toISOString()
    };
    
    localStorage.setItem('trialTemplates', JSON.stringify(templates));
    showStatusMessage('Template "' + templateName + '" saved successfully', 'success');
}

function loadFromTemplate() {
    var templates = JSON.parse(localStorage.getItem('trialTemplates') || '{}');
    var templateNames = Object.keys(templates);
    
    if (templateNames.length === 0) {
        alert('No templates available');
        return;
    }
    
    var selectedTemplate = prompt('Available templates:\n' + templateNames.join('\n') + '\n\nEnter template name to load:');
    if (!selectedTemplate || !templates[selectedTemplate]) {
        alert('Template not found');
        return;
    }
    
    if (confirm('This will replace the current trial configuration. Continue?')) {
        trialConfig = JSON.parse(JSON.stringify(templates[selectedTemplate].config));
        
        // Update dates to be relative to today
        var today = new Date().toISOString().split('T')[0];
        for (var i = 0; i < trialConfig.length; i++) {
            trialConfig[i].date = today;
        }
        
        // Update form
        var maxDay = getMaxDay(trialConfig);
        document.getElementById('trialDays').value = maxDay;
        totalDays = maxDay;
        savedDays = maxDay;
        
        generateDays();
        setTimeout(function() {
            populateExistingTrialData();
        }, 100);
        
        updateTrialOptions();
        showStatusMessage('Template "' + selectedTemplate + '" loaded successfully', 'success');
    }
}

// Judge conflict detection
function detectJudgeConflicts() {
    var conflicts = [];
    var judgeSchedule = {};
    
    for (var i = 0; i < trialConfig.length; i++) {
        var config = trialConfig[i];
        var key = config.date + '|' + config.judge;
        
        if (!judgeSchedule[key]) {
            judgeSchedule[key] = [];
        }
        judgeSchedule[key].push(config);
    }
    
    // Check for overlapping times (simplified - assumes conflicts if same judge, same date, different classes)
    for (var key in judgeSchedule) {
        var entries = judgeSchedule[key];
        if (entries.length > 1) {
            var uniqueClasses = new Set();
            for (var i = 0; i < entries.length; i++) {
                uniqueClasses.add(entries[i].className);
            }
            
            if (uniqueClasses.size > 1) {
                conflicts.push({
                    judge: entries[0].judge,
                    date: entries[0].date,
                    classes: Array.from(uniqueClasses)
                });
            }
        }
    }
    
    return conflicts;
}

// Display judge conflicts
function showJudgeConflicts() {
    var conflicts = detectJudgeConflicts();
    
    if (conflicts.length === 0) {
        showStatusMessage('No judge conflicts detected', 'success');
        return;
    }
    
    var message = 'Judge Conflicts Detected:\n\n';
    for (var i = 0; i < conflicts.length; i++) {
        var conflict = conflicts[i];
        message += conflict.judge + ' on ' + conflict.date + ':\n';
        message += '  Classes: ' + conflict.classes.join(', ') + '\n\n';
    }
    
    alert(message);
}