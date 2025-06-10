// Score Summary Functions - ADD THESE TO THE END OF js/score-sheets.js

// Generate Score Summary Sheets (class-based with digital score results)
function generateScoreSummarySheets() {
    if (trialConfig.length === 0) {
        alert('No trial configuration available');
        return;
    }
    
    if (Object.keys(digitalScoreData).length === 0) {
        alert('No digital scores available. Please complete some digital score sheets first.');
        return;
    }
    
    var container = document.getElementById('scoreSummaryContainer');
    if (!container) {
        // Create container if it doesn't exist (you'll need to add this to the HTML)
        container = document.createElement('div');
        container.id = 'scoreSummaryContainer';
        document.getElementById('score-entry').appendChild(container);
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
    
    var html = '<div class="score-summary-section">' +
               '<div class="score-summary-header">' +
               '<h3>📊 Score Summary Sheets</h3>' +
               '<div>' +
               '<button onclick="exportScoreSummary()" class="export-btn">📥 Export Summary</button>' +
               '<button onclick="printScoreSummary()" class="print-btn">🖨️ Print Summary</button>' +
               '</div>' +
               '</div>';
    
    var sortedClasses = Object.keys(classByName).sort();
    
    // Generate summary sheet for each class
    for (var c = 0; c < sortedClasses.length; c++) {
        var className = sortedClasses[c];
        var classTrials = classByName[className];
        
        // Sort trials within class by date and round
        classTrials.sort(function(a, b) {
            if (a.date !== b.date) return new Date(a.date) - new Date(b.date);
            return a.roundNum - b.roundNum;
        });
        
        html += generateClassScoreSummary(className, classTrials);
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function generateClassScoreSummary(className, classTrials) {
    var html = '<div class="class-summary-section">' +
               '<h4 class="class-summary-title">' + className + '</h4>' +
               '<table class="summary-table">' +
               '<thead>';
    
    // Judge row
    html += '<tr class="judge-summary-row">' +
            '<th class="dog-summary-info">Judge:</th>' +
            '<th class="handler-summary-info"></th>';
    
    for (var t = 0; t < classTrials.length; t++) {
        var trial = classTrials[t];
        html += '<th class="trial-summary-cell">' + trial.judge + '</th>';
    }
    html += '</tr>';
    
    // Date/Round row
    html += '<tr class="date-summary-row">' +
            '<th class="dog-summary-info">Dog</th>' +
            '<th class="handler-summary-info">Handler</th>';
    
    for (var t = 0; t < classTrials.length; t++) {
        var trial = classTrials[t];
        html += '<th class="trial-summary-cell">' +
                '<div class="summary-date">' + formatDate(trial.date) + '</div>' +
                '<div class="summary-round">Round ' + trial.roundNum + '</div>' +
                '</th>';
    }
    html += '</tr></thead><tbody>';
    
    // Get dogs that have entries in this class
    var dogsInClass = getDogsInClass(className);
    
    // Generate rows for each dog
    for (var d = 0; d < dogsInClass.length; d++) {
        var dog = dogsInClass[d];
        
        html += '<tr class="summary-data-row">' +
                '<td class="dog-summary-info">' + dog.regNumber + ' - ' + dog.callName + '</td>' +
                '<td class="handler-summary-info">' + dog.handler + '</td>';
        
        for (var t = 0; t < classTrials.length; t++) {
            var trial = classTrials[t];
            var scoreResult = getDigitalScoreResult(dog, trial);
            
            html += '<td class="trial-summary-cell ' + getResultClass(scoreResult) + '">' +
                    '<div class="score-result">' + scoreResult + '</div>' +
                    '</td>';
        }
        
        html += '</tr>';
    }
    
    html += '</tbody></table></div>';
    return html;
}

function getDogsInClass(className) {
    var dogs = {};
    
    // Get all dogs that have entries in this class
    for (var i = 0; i < entryResults.length; i++) {
        var entry = entryResults[i];
        if (entry.className === className) {
            var key = entry.regNumber + '|' + entry.handler;
            if (!dogs[key]) {
                dogs[key] = {
                    regNumber: entry.regNumber,
                    callName: entry.callName,
                    handler: entry.handler
                };
            }
        }
    }
    
    // Convert to array and sort
    var dogArray = [];
    for (var key in dogs) {
        dogArray.push(dogs[key]);
    }
    
    dogArray.sort(function(a, b) {
        return a.regNumber.localeCompare(b.regNumber);
    });
    
    return dogArray;
}

function getDigitalScoreResult(dog, trial) {
    // Find the digital score for this dog in this trial
    var sheetKey = trial.date + '|' + trial.className + '|' + trial.roundNum;
    
    // Check both regular and FEO entries
    var entryTypes = ['regular', 'feo'];
    
    for (var e = 0; e < entryTypes.length; e++) {
        var entryType = entryTypes[e];
        var entryKey = sheetKey + '|' + dog.regNumber + '|' + entryType;
        
        if (digitalScoreData[entryKey]) {
            var scoreData = digitalScoreData[entryKey];
            
            // Return the result if it exists
            if (scoreData.result) {
                var suffix = entryType === 'feo' ? ' (FEO)' : '';
                return scoreData.result + suffix;
            }
        }
    }
    
    // Check if dog is entered but not scored
    var isEntered = false;
    for (var i = 0; i < entryResults.length; i++) {
        var entry = entryResults[i];
        if (entry.regNumber === dog.regNumber && 
            entry.date === trial.date && 
            entry.className === trial.className && 
            entry.round === trial.roundNum) {
            isEntered = true;
            break;
        }
    }
    
    return isEntered ? 'Not Scored' : '—';
}

function getResultClass(result) {
    if (result.includes('Pass')) {
        return 'result-pass';
    } else if (result.includes('Fail')) {
        return 'result-fail';
    } else if (result === 'Not Scored') {
        return 'result-pending';
    } else {
        return 'result-none';
    }
}

function exportScoreSummary() {
    if (Object.keys(digitalScoreData).length === 0) {
        alert('No score summary data to export');
        return;
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
    
    var csv = 'SCORE SUMMARY REPORT\n';
    csv += 'Generated: ' + new Date().toLocaleString() + '\n\n';
    
    var sortedClasses = Object.keys(classByName).sort();
    
    // Export each class
    for (var c = 0; c < sortedClasses.length; c++) {
        var className = sortedClasses[c];
        var classTrials = classByName[className];
        
        classTrials.sort(function(a, b) {
            if (a.date !== b.date) return new Date(a.date) - new Date(b.date);
            return a.roundNum - b.roundNum;
        });
        
        csv += className + '\n';
        
        // Judge row
        csv += 'Judge:,';
        for (var t = 0; t < classTrials.length; t++) {
            csv += ',' + classTrials[t].judge;
        }
        csv += '\n';
        
        // Headers
        csv += 'Registration,Call Name,Handler';
        for (var t = 0; t < classTrials.length; t++) {
            var trial = classTrials[t];
            csv += ',' + formatDate(trial.date) + ' R' + trial.roundNum;
        }
        csv += '\n';
        
        // Data rows
        var dogsInClass = getDogsInClass(className);
        for (var d = 0; d < dogsInClass.length; d++) {
            var dog = dogsInClass[d];
            
            csv += dog.regNumber + ',' + dog.callName + ',' + dog.handler;
            
            for (var t = 0; t < classTrials.length; t++) {
                var trial = classTrials[t];
                var result = getDigitalScoreResult(dog, trial);
                csv += ',' + result;
            }
            csv += '\n';
        }
        csv += '\n'; // Extra line between classes
    }
    
    downloadFile(csv, 'score_summary_' + new Date().toISOString().split('T')[0] + '.csv', 'text/csv');
    showStatusMessage('Score summary exported successfully!', 'success');
}

function printScoreSummary() {
    var summaryContent = document.getElementById('scoreSummaryContainer').innerHTML;
    var printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Score Summary</title>');
    printWindow.document.write('<style>' + getScoreSummaryStyles() + '</style>');
    printWindow.document.write('</head><body>' + summaryContent + '</body></html>');
    printWindow.document.close();
    printWindow.print();
}

function getScoreSummaryStyles() {
    return `
        .score-summary-section { font-family: Arial, sans-serif; }
        .class-summary-section { margin-bottom: 40px; page-break-after: always; }
        .class-summary-title { background: #667eea; color: white; padding: 15px; text-align: center; margin: 0 0 20px 0; }
        .summary-table { width: 100%; border-collapse: collapse; border: 2px solid #000; }
        .summary-table th, .summary-table td { border: 1px solid #000; padding: 8px; text-align: center; }
        .judge-summary-row th { background: #e9ecef; font-weight: bold; font-size: 12px; }
        .date-summary-row th { background: #f8f9fa; font-weight: bold; font-size: 11px; }
        .dog-summary-info, .handler-summary-info { text-align: left !important; background: #f8f9fa; font-weight: bold; }
        .result-pass { background: #d4edda; color: #155724; font-weight: bold; }
        .result-fail { background: #f8d7da; color: #721c24; font-weight: bold; }
        .result-pending { background: #fff3cd; color: #856404; font-style: italic; }
        .result-none { background: #f8f9fa; color: #6c757d; }
        .summary-date { font-size: 10px; margin-bottom: 2px; }
        .summary-round { font-size: 9px; color: #666; }
        .score-result { font-weight: bold; }
        @media print {
            .score-summary-header { display: none; }
            .class-summary-section { page-break-inside: avoid; }
        }
    `;
}

// Auto-update score summary when digital scores change
function updateScoreSummaryDisplay() {
    var container = document.getElementById('scoreSummaryContainer');
    if (container && container.innerHTML.length > 0) {
        generateScoreSummarySheets();
    }
}

// Call this function whenever digital scores are updated
function onDigitalScoreUpdate() {
    updateScoreSummaryDisplay();
}

// Add this to your existing updateScentScore function in score-sheets.js
// Modify the existing updateScentScore function to include:
// onDigitalScoreUpdate(); // Add this line at the end of updateScentScore function
