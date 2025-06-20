// Results and Reporting Functions - Updated Cross-Reference Grid

// Update results display
function updateResultsDisplay() {
    var container = document.getElementById('resultsContainer');
    
    if (entryResults.length === 0) {
        container.innerHTML = '<p style="color: #666; font-style: italic;">No entries yet.</p>';
        return;
    }

    var groupedResults = {};
    for (var i = 0; i < entryResults.length; i++) {
        var entry = entryResults[i];
        var key = entry.date + '-' + entry.className + '-' + entry.round;
        if (!groupedResults[key]) {
            groupedResults[key] = {
                date: entry.date,
                className: entry.className,
                round: entry.round,
                judge: entry.judge,
                entries: []
            };
        }
        groupedResults[key].entries.push(entry);
    }

    var html = '<div class="results-grid">';
    
    var sortedGroups = [];
    for (var key in groupedResults) {
        sortedGroups.push(groupedResults[key]);
    }
    
    sortedGroups.sort(function(a, b) {
        if (a.date !== b.date) return new Date(a.date) - new Date(b.date);
        if (a.className !== b.className) return a.className.localeCompare(b.className);
        return a.round - b.round;
    });

    for (var g = 0; g < sortedGroups.length; g++) {
        var group = sortedGroups[g];
        html += '<div class="result-column">' +
            '<div class="column-header">' +
            '<div class="column-date">' + formatDate(group.date) + '</div>' +
            '<div class="column-judge">' + group.judge + '</div>' +
            '<div class="column-class-round">' + group.className + ' - Round ' + group.round + '</div>' +
            '</div>' +
            '<div class="column-entries">';

        group.entries.sort(function(a, b) {
            return a.handler.localeCompare(b.handler);
        });

        for (var e = 0; e < group.entries.length; e++) {
            var entry = group.entries[e];
            html += '<div class="entry-item">' +
                entry.handler + ' - ' + entry.callName +
                '<span class="entry-type-badge badge-' + entry.entryType + '">' + entry.entryType.toUpperCase() + '</span>' +
                '<div style="margin-top: 5px; font-size: 12px; color: #888;">Reg: ' + entry.regNumber + '</div>' +
                '</div>';
        }

        html += '</div></div>';
    }

    html += '</div>';
    container.innerHTML = html;
}

// Cross-Reference functions - UPDATED TO SHOW SEPARATE SHEETS PER CLASS
function loadCrossReferenceTab() {
    if (trialConfig.length === 0) {
        document.getElementById('crossReferenceGrid').innerHTML = 
            '<p style="text-align: center; color: #666; padding: 40px;">No trial data available. Please complete trial setup first.</p>';
        return;
    }
    generateCrossReferenceGrid();
}

function generateCrossReferenceGrid() {
    var container = document.getElementById('crossReferenceGrid');
    
    if (entryResults.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No entries to display. Please add some entries first.</p>';
        return;
    }
    
    // Get unique dogs/handlers
    var dogs = {};
    for (var i = 0; i < entryResults.length; i++) {
        var entry = entryResults[i];
        var key = entry.regNumber + '|' + entry.handler;
        if (!dogs[key]) {
            dogs[key] = {
                regNumber: entry.regNumber,
                callName: entry.callName,
                handler: entry.handler,
                entries: []
            };
        }
        dogs[key].entries.push(entry);
    }
    
    // Group trials by class
    var classByName = {};
    for (var i = 0; i < trialConfig.length; i++) {
        var config = trialConfig[i];
        if (!classByName[config.className]) {
            classByName[config.className] = [];
        }
        classByName[config.className].push(config);
    }
    
    var html = '';
    var sortedClasses = Object.keys(classByName).sort();
    
    // Generate a separate table for each class
    for (var c = 0; c < sortedClasses.length; c++) {
        var className = sortedClasses[c];
        var classTrials = classByName[className];
        
        // Sort trials within class by date and round
        classTrials.sort(function(a, b) {
            if (a.date !== b.date) return new Date(a.date) - new Date(b.date);
            return a.roundNum - b.roundNum;
        });
        
        // Create table for this class
        html += '<div class="class-grid-section">' +
                '<h3 class="class-grid-title">' + className + '</h3>' +
                '<table class="grid-table">' +
                '<thead>';
        
        // Judge row
        html += '<tr class="judge-row">' +
                '<th class="dog-info">Judge:</th>' +
                '<th class="handler-info"></th>';
        
        for (var t = 0; t < classTrials.length; t++) {
            var trial = classTrials[t];
            html += '<th class="entry-cell judge-header">' + trial.judge + '</th>';
        }
        html += '</tr>';
        
        // Date row
        html += '<tr class="date-row">' +
                '<th class="dog-info">Dog</th>' +
                '<th class="handler-info">Handler</th>';
        
        for (var t = 0; t < classTrials.length; t++) {
            var trial = classTrials[t];
            html += '<th class="entry-cell date-header">' +
                    '<div style="font-size: 9px;">' + formatDate(trial.date) + '</div>' +
                    '<div style="font-size: 8px;">Round ' + trial.roundNum + '</div>' +
                    '</th>';
        }
        html += '</tr></thead><tbody>';
        
        // Get dogs that have entries in this class
        var dogsInClass = [];
        var sortedDogKeys = Object.keys(dogs).sort();
        
        for (var d = 0; d < sortedDogKeys.length; d++) {
            var dogKey = sortedDogKeys[d];
            var dog = dogs[dogKey];
            
            // Check if this dog has entries in this class
            var hasEntriesInClass = false;
            for (var e = 0; e < dog.entries.length; e++) {
                if (dog.entries[e].className === className) {
                    hasEntriesInClass = true;
                    break;
                }
            }
            
            if (hasEntriesInClass) {
                dogsInClass.push(dog);
            }
        }
        
        // Generate rows for dogs in this class
        for (var d = 0; d < dogsInClass.length; d++) {
            var dog = dogsInClass[d];
            
            html += '<tr>' +
                '<td class="dog-info">' + dog.regNumber + ' - ' + dog.callName + '</td>' +
                '<td class="handler-info">' + dog.handler + '</td>';
            
            for (var t = 0; t < classTrials.length; t++) {
                var trial = classTrials[t];
                
                // Find entries for this dog in this specific trial
                var dogEntries = dog.entries.filter(function(entry) {
                    return entry.date === trial.date && 
                           entry.className === trial.className && 
                           entry.round === trial.roundNum;
                });
                
                html += '<td class="entry-cell">';
                
                if (dogEntries.length > 0) {
                    for (var e = 0; e < dogEntries.length; e++) {
                        var entry = dogEntries[e];
                        var markerClass = entry.entryType === 'regular' ? 'marker-regular' : 'marker-feo';
                        var markerText = entry.entryType === 'regular' ? 'R' : 'F';
                        
                        html += '<span class="entry-marker ' + markerClass + '">' + markerText + '</span>';
                    }
                }
                
                html += '</td>';
            }
            
            html += '</tr>';
        }
        
        html += '</tbody></table></div>';
    }
    
    // Add legend
    html += '<div class="grid-legend">' +
        '<div class="legend-item">' +
        '<span class="entry-marker marker-regular">R</span>' +
        '<span>Regular Entry</span>' +
        '</div>' +
        '<div class="legend-item">' +
        '<span class="entry-marker marker-feo">F</span>' +
        '<span>FEO Entry</span>' +
        '</div>' +
        '<div style="margin-left: auto; font-size: 12px; color: #666;">' +
        '<span id="gridEntryCount">' + entryResults.length + ' total entries</span>' +
        '</div>' +
        '</div>';
    
    container.innerHTML = html;
}

function updateCrossReferenceDisplay() {
    if (trialConfig.length > 0) {
        generateCrossReferenceGrid();
    }
}

function applyFilters() {
    // Placeholder for filter functionality
    generateCrossReferenceGrid();
}

function clearFilters() {
    // Clear all filter inputs
    var filterInputs = document.querySelectorAll('.filter-input');
    for (var i = 0; i < filterInputs.length; i++) {
        filterInputs[i].value = '';
    }
    generateCrossReferenceGrid();
}

function refreshCrossReference() {
    generateCrossReferenceGrid();
    showStatusMessage('Cross-reference refreshed!', 'success');
}

function exportCrossReference() {
    if (entryResults.length === 0) {
        alert('No data to export');
        return;
    }
    
    // Group trials by class for export
    var classByName = {};
    for (var i = 0; i < trialConfig.length; i++) {
        var config = trialConfig[i];
        if (!classByName[config.className]) {
            classByName[config.className] = [];
        }
        classByName[config.className].push(config);
    }
    
    var csv = '';
    var sortedClasses = Object.keys(classByName).sort();
    
    // Export each class as a separate section
    for (var c = 0; c < sortedClasses.length; c++) {
        var className = sortedClasses[c];
        var classTrials = classByName[className];
        
        classTrials.sort(function(a, b) {
            if (a.date !== b.date) return new Date(a.date) - new Date(b.date);
            return a.roundNum - b.roundNum;
        });
        
        // Class header
        csv += '\n' + className + '\n';
        
        // Judge row
        csv += 'Judge:,';
        for (var t = 0; t < classTrials.length; t++) {
            csv += ',' + classTrials[t].judge;
        }
        csv += '\n';
        
        // Column headers
        csv += 'Registration,Call Name,Handler';
        for (var t = 0; t < classTrials.length; t++) {
            var trial = classTrials[t];
            csv += ',' + formatDate(trial.date) + ' R' + trial.roundNum;
        }
        csv += '\n';
        
        // Get dogs with entries in this class
        var dogs = {};
        for (var i = 0; i < entryResults.length; i++) {
            var entry = entryResults[i];
            if (entry.className === className) {
                var key = entry.regNumber + '|' + entry.handler;
                if (!dogs[key]) {
                    dogs[key] = {
                        regNumber: entry.regNumber,
                        callName: entry.callName,
                        handler: entry.handler,
                        entries: []
                    };
                }
                dogs[key].entries.push(entry);
            }
        }
        
        var sortedDogKeys = Object.keys(dogs).sort();
        
        // Data rows
        for (var d = 0; d < sortedDogKeys.length; d++) {
            var dogKey = sortedDogKeys[d];
            var dog = dogs[dogKey];
            
            csv += dog.regNumber + ',' + dog.callName + ',' + dog.handler;
            
            for (var t = 0; t < classTrials.length; t++) {
                var trial = classTrials[t];
                
                var dogEntries = dog.entries.filter(function(entry) {
                    return entry.date === trial.date && 
                           entry.className === trial.className && 
                           entry.round === trial.roundNum;
                });
                
                var entryText = '';
                if (dogEntries.length > 0) {
                    var types = dogEntries.map(function(e) { return e.entryType; });
                    entryText = types.join('/');
                }
                
                csv += ',' + entryText;
            }
            csv += '\n';
        }
        csv += '\n'; // Extra line between classes
    }
    
    downloadFile(csv, 'cross_reference_by_class.csv', 'text/csv');
    showStatusMessage('Cross-reference exported by class!', 'success');
}

// Report Generation Functions
function generateTrialSummaryReport() {
    if (trialConfig.length === 0) {
        alert('No trial configuration available');
        return;
    }
    
    var summary = getTrialSummary();
    var entryStats = getEntryStatistics();
    
    var report = 'TRIAL SUMMARY REPORT\n';
    report += '===================\n\n';
    
    // Trial Information
    report += 'TRIAL INFORMATION:\n';
    report += 'Trial Name: ' + (document.getElementById('trialName').value || 'Untitled Trial') + '\n';
    report += 'Total Days: ' + summary.totalDays + '\n';
    report += 'Total Classes: ' + summary.totalClasses + '\n';
    report += 'Total Rounds: ' + summary.totalRounds + '\n';
    report += 'Total Judges: ' + summary.totalJudges + '\n';
    report += 'FEO Rounds Offered: ' + summary.feoOffered + '\n\n';
    
    // Entry Statistics
    report += 'ENTRY STATISTICS:\n';
    report += 'Total Entries: ' + entryStats.totalEntries + '\n';
    report += 'Unique Dogs: ' + entryStats.uniqueDogs + '\n';
    report += 'Unique Handlers: ' + entryStats.uniqueHandlers + '\n';
    report += 'Regular Entries: ' + entryStats.regularEntries + '\n';
    report += 'FEO Entries: ' + entryStats.feoEntries + '\n\n';
    
    // Entries by Class
    report += 'ENTRIES BY CLASS:\n';
    for (var className in entryStats.entriesByClass) {
        report += className + ': ' + entryStats.entriesByClass[className] + '\n';
    }
    report += '\n';
    
    // Entries by Date
    report += 'ENTRIES BY DATE:\n';
    for (var date in entryStats.entriesByDate) {
        report += formatDate(date) + ': ' + entryStats.entriesByDate[date] + '\n';
    }
    report += '\n';
    
    // Trial Schedule
    report += 'TRIAL SCHEDULE:\n';
    var scheduleByDate = groupBy(trialConfig, 'date');
    var sortedDates = Object.keys(scheduleByDate).sort();
    
    for (var i = 0; i < sortedDates.length; i++) {
        var date = sortedDates[i];
        var configs = scheduleByDate[date];
        
        report += formatDate(date) + ':\n';
        
        var classByName = groupBy(configs, 'className');
        for (var className in classByName) {
            var classConfigs = classByName[className];
            classConfigs.sort(function(a, b) { return a.roundNum - b.roundNum; });
            
            report += '  ' + className + ':\n';
            for (var j = 0; j < classConfigs.length; j++) {
                var config = classConfigs[j];
                report += '    Round ' + config.roundNum + ': ' + config.judge;
                if (config.feoOffered) {
                    report += ' (FEO Available)';
                }
                report += '\n';
            }
        }
        report += '\n';
    }
    
    // Generate timestamp
    report += 'Report generated: ' + new Date().toLocaleString() + '\n';
    
    downloadFile(report, 'trial_summary_report.txt', 'text/plain');
    showStatusMessage('Trial summary report generated!', 'success');
}

function generateHandlerReport() {
    if (entryResults.length === 0) {
        alert('No entries available for handler report');
        return;
    }
    
    var handlerData = {};
    
    // Group entries by handler
    for (var i = 0; i < entryResults.length; i++) {
        var entry = entryResults[i];
        if (!handlerData[entry.handler]) {
            handlerData[entry.handler] = {
                handler: entry.handler,
                dogs: new Set(),
                entries: []
            };
        }
        handlerData[entry.handler].dogs.add(entry.regNumber + ' - ' + entry.callName);
        handlerData[entry.handler].entries.push(entry);
    }
    
    var csv = 'Handler,Dogs,Total Entries,Regular Entries,FEO Entries,Classes Entered\n';
    
    var sortedHandlers = Object.keys(handlerData).sort();
    
    for (var i = 0; i < sortedHandlers.length; i++) {
        var handler = sortedHandlers[i];
        var data = handlerData[handler];
        
        var regularCount = data.entries.filter(function(e) { return e.entryType === 'regular'; }).length;
        var feoCount = data.entries.filter(function(e) { return e.entryType === 'feo'; }).length;
        
        var classes = new Set();
        for (var j = 0; j < data.entries.length; j++) {
            classes.add(data.entries[j].className);
        }
        
        csv += '"' + handler + '",' +
               data.dogs.size + ',' +
               data.entries.length + ',' +
               regularCount + ',' +
               feoCount + ',' +
               '"' + Array.from(classes).join('; ') + '"\n';
    }
    
    downloadFile(csv, 'handler_report.csv', 'text/csv');
    showStatusMessage('Handler report generated!', 'success');
}

function generateJudgeReport() {
    if (trialConfig.length === 0) {
        alert('No trial configuration available for judge report');
        return;
    }
    
    var judgeData = {};
    
    // Group by judge
    for (var i = 0; i < trialConfig.length; i++) {
        var config = trialConfig[i];
        if (!judgeData[config.judge]) {
            judgeData[config.judge] = {
                judge: config.judge,
                assignments: [],
                dates: new Set(),
                classes: new Set()
            };
        }
        
        judgeData[config.judge].assignments.push(config);
        judgeData[config.judge].dates.add(config.date);
        judgeData[config.judge].classes.add(config.className);
    }
    
    var csv = 'Judge,Total Assignments,Dates,Classes,FEO Rounds,Assignment Details\n';
    
    var sortedJudges = Object.keys(judgeData).sort();
    
    for (var i = 0; i < sortedJudges.length; i++) {
        var judge = sortedJudges[i];
        var data = judgeData[judge];
        
        var feoCount = data.assignments.filter(function(a) { return a.feoOffered; }).length;
        
        var assignmentDetails = data.assignments.map(function(a) {
            return formatDate(a.date) + ' ' + a.className + ' R' + a.roundNum + (a.feoOffered ? ' (FEO)' : '');
        }).join('; ');
        
        csv += '"' + judge + '",' +
               data.assignments.length + ',' +
               data.dates.size + ',' +
               data.classes.size + ',' +
               feoCount + ',' +
               '"' + assignmentDetails + '"\n';
    }
    
    downloadFile(csv, 'judge_report.csv', 'text/csv');
    showStatusMessage('Judge report generated!', 'success');
}

function generateConflictReport() {
    var conflicts = [];
    
    // Check for handler conflicts
    var handlerSchedule = {};
    for (var i = 0; i < entryResults.length; i++) {
        var entry = entryResults[i];
        var key = entry.handler + '|' + entry.date;
        if (!handlerSchedule[key]) {
            handlerSchedule[key] = [];
        }
        handlerSchedule[key].push(entry);
    }
    
    for (var key in handlerSchedule) {
        var entries = handlerSchedule[key];
        if (entries.length > 1) {
            var handler = entries[0].handler;
            var date = entries[0].date;
            
            // Check for same class/round conflicts
            for (var i = 0; i < entries.length - 1; i++) {
                for (var j = i + 1; j < entries.length; j++) {
                    if (entries[i].className === entries[j].className && 
                        entries[i].round === entries[j].round) {
                        conflicts.push({
                            type: 'Handler Conflict',
                            description: handler + ' has multiple entries in ' + entries[i].className + ' Round ' + entries[i].round + ' on ' + formatDate(date)
                        });
                    }
                }
            }
        }
    }
    
    // Check for judge conflicts
    var judgeConflicts = detectJudgeConflicts();
    for (var i = 0; i < judgeConflicts.length; i++) {
        var conflict = judgeConflicts[i];
        conflicts.push({
            type: 'Judge Conflict',
            description: conflict.judge + ' assigned to multiple classes on ' + formatDate(conflict.date) + ': ' + conflict.classes.join(', ')
        });
    }
    
    if (conflicts.length === 0) {
        showStatusMessage('No conflicts detected!', 'success');
        return;
    }
    
    var report = 'CONFLICT REPORT\n';
    report += '===============\n\n';
    
    for (var i = 0; i < conflicts.length; i++) {
        var conflict = conflicts[i];
        report += conflict.type + ':\n';
        report += conflict.description + '\n\n';
    }
    
    report += 'Report generated: ' + new Date().toLocaleString() + '\n';
    
    downloadFile(report, 'conflict_report.txt', 'text/plain');
    showStatusMessage('Conflict report generated! Found ' + conflicts.length + ' conflicts.', 'warning');
}

// Dashboard Statistics
function updateDashboardStats() {
    var stats = {
        totalTrials: Object.keys(JSON.parse(localStorage.getItem('publicTrials') || '{}')).length,
        totalEntries: entryResults.length,
        completedSheets: getCompletedSheetsCount(),
        activeUsers: Object.keys(JSON.parse(localStorage.getItem('trialUsers') || '{}')).length
    };
    
    // Update dashboard if elements exist
    var elements = {
        'totalTrials': stats.totalTrials,
        'totalEntries': stats.totalEntries,
        'completedSheets': stats.completedSheets,
        'activeUsers': stats.activeUsers
    };
    
    for (var id in elements) {
        var element = document.getElementById(id);
        if (element) {
            element.textContent = elements[id];
        }
    }
}

function getCompletedSheetsCount() {
    var completed = 0;
    var sheetKeys = new Set();
    
    for (var entryKey in digitalScoreData) {
        var keyParts = entryKey.split('|');
        if (keyParts.length >= 3) {
            var sheetKey = keyParts[0] + '|' + keyParts[1] + '|' + keyParts[2];
            sheetKeys.add(sheetKey);
        }
    }
    
    sheetKeys.forEach(function(sheetKey) {
        if (getCompletedScoresCount(sheetKey) > 0) {
            completed++;
        }
    });
    
    return completed;
}

// Advanced Reporting
function generateAdvancedReport() {
    if (trialConfig.length === 0 || entryResults.length === 0) {
        alert('Insufficient data for advanced report');
        return;
    }
    
    var report = generateTrialSummaryData();
    var filename = 'advanced_trial_report_' + new Date().toISOString().split('T')[0] + '.json';
    
    downloadFile(JSON.stringify(report, null, 2), filename, 'application/json');
    showStatusMessage('Advanced report generated!', 'success');
}

function generateTrialSummaryData() {
    return {
        metadata: {
            trialName: document.getElementById('trialName').value || 'Untitled Trial',
            generatedDate: new Date().toISOString(),
            generatedBy: currentUser ? currentUser.fullName : 'Unknown'
        },
        configuration: {
            totalDays: getUniqueDays(trialConfig).length,
            totalRounds: trialConfig.length,
            schedule: trialConfig
        },
        entries: {
            total: entryResults.length,
            byType: getEntriesByType(),
            byClass: getEntriesByClass(),
            byDate: getEntriesByDate(),
            byHandler: getEntriesByHandler()
        },
        statistics: getDetailedStatistics(),
        conflicts: getAllConflicts(),
        digitalScores: getDigitalScoresSummary()
    };
}

function getEntriesByType() {
    var byType = {};
    for (var i = 0; i < entryResults.length; i++) {
        var type = entryResults[i].entryType;
        byType[type] = (byType[type] || 0) + 1;
    }
    return byType;
}

function getEntriesByClass() {
    var byClass = {};
    for (var i = 0; i < entryResults.length; i++) {
        var className = entryResults[i].className;
        byClass[className] = (byClass[className] || 0) + 1;
    }
    return byClass;
}

function getEntriesByDate() {
    var byDate = {};
    for (var i = 0; i < entryResults.length; i++) {
        var date = entryResults[i].date;
        byDate[date] = (byDate[date] || 0) + 1;
    }
    return byDate;
}

function getEntriesByHandler() {
    var byHandler = {};
    for (var i = 0; i < entryResults.length; i++) {
        var handler = entryResults[i].handler;
        byHandler[handler] = (byHandler[handler] || 0) + 1;
    }
    return byHandler;
}

function getDetailedStatistics() {
    return {
        entryStats: getEntryStatistics(),
        trialSummary: getTrialSummary(),
        judgeWorkload: getJudgeWorkload(),
        handlerParticipation: getHandlerParticipation()
    };
}

function getJudgeWorkload() {
    var workload = {};
    for (var i = 0; i < trialConfig.length; i++) {
        var config = trialConfig[i];
        if (!workload[config.judge]) {
            workload[config.judge] = {
                totalAssignments: 0,
                classes: new Set(),
                dates: new Set()
            };
        }
        workload[config.judge].totalAssignments++;
        workload[config.judge].classes.add(config.className);
        workload[config.judge].dates.add(config.date);
    }
    
    // Convert Sets to arrays for JSON serialization
    for (var judge in workload) {
        workload[judge].classes = Array.from(workload[judge].classes);
        workload[judge].dates = Array.from(workload[judge].dates);
    }
    
    return workload;
}

function getHandlerParticipation() {
    var participation = {};
    for (var i = 0; i < entryResults.length; i++) {
        var entry = entryResults[i];
        if (!participation[entry.handler]) {
            participation[entry.handler] = {
                totalEntries: 0,
                dogs: new Set(),
                classes: new Set(),
                dates: new Set()
            };
        }
        participation[entry.handler].totalEntries++;
        participation[entry.handler].dogs.add(entry.regNumber + ' - ' + entry.callName);
        participation[entry.handler].classes.add(entry.className);
        participation[entry.handler].dates.add(entry.date);
    }
    
    // Convert Sets to arrays for JSON serialization
    for (var handler in participation) {
        participation[handler].dogs = Array.from(participation[handler].dogs);
        participation[handler].classes = Array.from(participation[handler].classes);
        participation[handler].dates = Array.from(participation[handler].dates);
    }
    
    return participation;
}

function getAllConflicts() {
    return {
        judgeConflicts: detectJudgeConflicts(),
        handlerConflicts: detectRunningOrderConflicts()
    };
}

function getDigitalScoresSummary() {
    var summary = {
        totalSheets: 0,
        completedSheets: 0,
        totalScores: Object.keys(digitalScoreData).length,
        completionRate: 0
    };
    
    var sheetKeys = new Set();
    for (var entryKey in digitalScoreData) {
        var keyParts = entryKey.split('|');
        if (keyParts.length >= 3) {
            var sheetKey = keyParts[0] + '|' + keyParts[1] + '|' + keyParts[2];
            sheetKeys.add(sheetKey);
        }
    }
    
    summary.totalSheets = sheetKeys.size;
    
    sheetKeys.forEach(function(sheetKey) {
        if (getCompletedScoresCount(sheetKey) > 0) {
            summary.completedSheets++;
        }
    });
    
    summary.completionRate = summary.totalSheets > 0 ? 
        Math.round((summary.completedSheets / summary.totalSheets) * 100) : 0;
    
    return summary;
}
// Add these missing functions to js/reports.js

// Generate Trial Summary Report
function generateTrialSummaryReport() {
    if (trialConfig.length === 0) {
        showStatusMessage('Please complete trial setup first', 'warning');
        return;
    }
    
    const container = document.getElementById('reportsContainer');
    const summary = getTrialSummary();
    const entryStats = getEntryStatistics();
    
    const html = `
        <div class="report-content">
            <h3>📊 Trial Summary Report</h3>
            <div class="report-grid">
                <div class="report-section">
                    <h4>Trial Information</h4>
                    <table class="report-table">
                        <tr><td>Trial Name:</td><td>${document.getElementById('trialName').value || 'Untitled Trial'}</td></tr>
                        <tr><td>Total Days:</td><td>${summary.totalDays}</td></tr>
                        <tr><td>Total Classes:</td><td>${summary.totalClasses}</td></tr>
                        <tr><td>Total Rounds:</td><td>${summary.totalRounds}</td></tr>
                        <tr><td>Total Judges:</td><td>${summary.totalJudges}</td></tr>
                    </table>
                </div>
                <div class="report-section">
                    <h4>Entry Statistics</h4>
                    <table class="report-table">
                        <tr><td>Total Entries:</td><td>${entryStats.totalEntries}</td></tr>
                        <tr><td>Unique Dogs:</td><td>${entryStats.uniqueDogs}</td></tr>
                        <tr><td>Unique Handlers:</td><td>${entryStats.uniqueHandlers}</td></tr>
                        <tr><td>Regular Entries:</td><td>${entryStats.regularEntries}</td></tr>
                        <tr><td>FEO Entries:</td><td>${entryStats.feoEntries}</td></tr>
                    </table>
                </div>
            </div>
            <div class="report-actions">
                <button onclick="exportTrialSummaryReport()" class="btn btn-primary">📤 Export Report</button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Generate Entry Report
function generateEntryReport() {
    if (entryResults.length === 0) {
        showStatusMessage('No entries found', 'warning');
        return;
    }
    
    const container = document.getElementById('reportsContainer');
    let html = `
        <div class="report-content">
            <h3>📋 Entry Report</h3>
            <p>Total Entries: <strong>${entryResults.length}</strong></p>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Registration</th>
                        <th>Handler</th>
                        <th>Call Name</th>
                        <th>Class</th>
                        <th>Round</th>
                        <th>Date</th>
                        <th>Type</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    entryResults.forEach(entry => {
        html += `
            <tr>
                <td>${entry.regNumber || entry.registration}</td>
                <td>${entry.handler}</td>
                <td>${entry.callName}</td>
                <td>${entry.className}</td>
                <td>${entry.round}</td>
                <td>${formatDate(entry.date)}</td>
                <td>${entry.entryType}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
            <div class="report-actions">
                <button onclick="exportEntryReport()" class="btn btn-primary">📤 Export CSV</button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Generate Judge Report
function generateJudgeReport() {
    if (trialConfig.length === 0) {
        showStatusMessage('Please complete trial setup first', 'warning');
        return;
    }
    
    const container = document.getElementById('reportsContainer');
    const judgeStats = {};
    
    // Calculate judge assignments
    trialConfig.forEach(config => {
        if (!judgeStats[config.judge]) {
            judgeStats[config.judge] = {
                assignments: 0,
                classes: new Set(),
                dates: new Set()
            };
        }
        judgeStats[config.judge].assignments++;
        judgeStats[config.judge].classes.add(config.className);
        judgeStats[config.judge].dates.add(config.date);
    });
    
    let html = `
        <div class="report-content">
            <h3>👨‍⚖️ Judge Report</h3>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Judge Name</th>
                        <th>Assignments</th>
                        <th>Classes</th>
                        <th>Trial Days</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    Object.keys(judgeStats).forEach(judge => {
        const stats = judgeStats[judge];
        html += `
            <tr>
                <td><strong>${judge}</strong></td>
                <td>${stats.assignments}</td>
                <td>${stats.classes.size}</td>
                <td>${stats.dates.size}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
            <div class="report-actions">
                <button onclick="exportJudgeReport()" class="btn btn-primary">📤 Export Report</button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Generate Financial Report  
function generateFinancialReport() {
    if (entryResults.length === 0) {
        showStatusMessage('No entries found for financial calculation', 'warning');
        return;
    }
    
    const container = document.getElementById('reportsContainer');
    const entryFee = 25.00; // Default entry fee - make this configurable
    const feoFee = 15.00; // FEO entry fee
    
    let regularEntries = 0;
    let feoEntries = 0;
    
    entryResults.forEach(entry => {
        if (entry.entryType === 'feo') {
            feoEntries++;
        } else {
            regularEntries++;
        }
    });
    
    const regularRevenue = regularEntries * entryFee;
    const feoRevenue = feoEntries * feoFee;
    const totalRevenue = regularRevenue + feoRevenue;
    
    const html = `
        <div class="report-content">
            <h3>💰 Financial Report</h3>
            <div class="financial-summary">
                <table class="report-table">
                    <tr><td>Regular Entries:</td><td>${regularEntries} × $${entryFee.toFixed(2)}</td><td>$${regularRevenue.toFixed(2)}</td></tr>
                    <tr><td>FEO Entries:</td><td>${feoEntries} × $${feoFee.toFixed(2)}</td><td>$${feoRevenue.toFixed(2)}</td></tr>
                    <tr class="total-row"><td><strong>Total Revenue:</strong></td><td><strong>${entryResults.length} entries</strong></td><td><strong>$${totalRevenue.toFixed(2)}</strong></td></tr>
                </table>
            </div>
            <div class="report-actions">
                <button onclick="exportFinancialReport()" class="btn btn-primary">📤 Export Report</button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Export functions
function exportTrialSummaryReport() {
    const data = generateTrialSummaryData();
    downloadFile(JSON.stringify(data, null, 2), 'trial_summary_report.json', 'application/json');
    showStatusMessage('Trial summary exported', 'success');
}

function exportEntryReport() {
    if (entryResults.length === 0) {
        showStatusMessage('No entries to export', 'warning');
        return;
    }
    
    let csv = 'Registration,Handler,Call Name,Class,Round,Date,Type,Timestamp\n';
    entryResults.forEach(entry => {
        csv += `"${entry.regNumber || entry.registration}","${entry.handler}","${entry.callName}","${entry.className}","${entry.round}","${entry.date}","${entry.entryType}","${entry.timestamp}"\n`;
    });
    
    downloadFile(csv, 'entry_report.csv', 'text/csv');
    showStatusMessage('Entry report exported', 'success');
}

function exportJudgeReport() {
    // Implementation for judge report export
    showStatusMessage('Judge report export - feature coming soon', 'info');
}

function exportFinancialReport() {
    // Implementation for financial report export  
    showStatusMessage('Financial report export - feature coming soon', 'info');
}

// Helper function to get entry statistics
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
    
    const uniqueDogs = new Set();
    const uniqueHandlers = new Set();
    let regularEntries = 0;
    let feoEntries = 0;
    const entriesByClass = {};
    const entriesByDate = {};
    
    entryResults.forEach(entry => {
        uniqueDogs.add(entry.regNumber || entry.registration);
        uniqueHandlers.add(entry.handler);
        
        if (entry.entryType === 'feo') {
            feoEntries++;
        } else {
            regularEntries++;
        }
        
        entriesByClass[entry.className] = (entriesByClass[entry.className] || 0) + 1;
        entriesByDate[entry.date] = (entriesByDate[entry.date] || 0) + 1;
    });
    
    return {
        totalEntries: entryResults.length,
        uniqueDogs: uniqueDogs.size,
        uniqueHandlers: uniqueHandlers.size,
        regularEntries,
        feoEntries,
        entriesByClass,
        entriesByDate
    };
}
