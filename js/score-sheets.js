// Score Sheets and Digital Scoring Functions

// Load score sheets management
function loadScoreSheetsManagement() {
    if (trialConfig.length === 0) {
        document.getElementById('dateSelectionContainer').innerHTML = 
            '<p style="color: #666; padding: 20px;">No trial configuration found. Please complete trial setup first.</p>';
        return;
    }
    
    // Get unique dates from trial config
    var dates = [];
    var dateMap = {};
    
    for (var i = 0; i < trialConfig.length; i++) {
        var config = trialConfig[i];
        if (!dateMap[config.date]) {
            dateMap[config.date] = {
                date: config.date,
                classes: [],
                judges: []
            };
            dates.push(config.date);
        }
        
        if (dateMap[config.date].classes.indexOf(config.className) === -1) {
            dateMap[config.date].classes.push(config.className);
        }
        if (dateMap[config.date].judges.indexOf(config.judge) === -1) {
            dateMap[config.date].judges.push(config.judge);
        }
    }
    
    dates.sort();
    
    var html = '';
    for (var i = 0; i < dates.length; i++) {
        var date = dates[i];
        var dateInfo = dateMap[date];
        var formattedDate = new Date(date).toLocaleDateString();
        
        html += '<div class="date-checkbox">' +
            '<input type="checkbox" id="date_' + date + '" value="' + date + '" onchange="updateSelectedDatesCount()">' +
            '<div class="date-info">' +
            '<div class="date-name">' + formattedDate + '</div>' +
            '<div class="date-meta">' + dateInfo.classes.length + ' classes, ' + dateInfo.judges.length + ' judges</div>' +
            '</div>' +
            '</div>';
    }
    
    document.getElementById('dateSelectionContainer').innerHTML = html;
    updateSelectedDatesCount();
}

function updateSelectedDatesCount() {
    var checkboxes = document.querySelectorAll('#dateSelectionContainer input[type="checkbox"]:checked');
    document.getElementById('selectedDatesCount').textContent = checkboxes.length + ' dates selected';
}

function selectAllDates() {
    var checkboxes = document.querySelectorAll('#dateSelectionContainer input[type="checkbox"]');
    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = true;
    }
    updateSelectedDatesCount();
}

function clearAllDates() {
    var checkboxes = document.querySelectorAll('#dateSelectionContainer input[type="checkbox"]');
    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
    }
    updateSelectedDatesCount();
}

function selectSheetType(type, element) {
    selectedSheetType = type;
    
    // Update visual selection
    var options = document.querySelectorAll('.sheet-type-option');
    for (var i = 0; i < options.length; i++) {
        options[i].classList.remove('selected');
    }
    element.classList.add('selected');
    
    // Show/hide scent options
    var scentOptions = document.getElementById('scentOptions');
    if (type === 'scent') {
        scentOptions.style.display = 'block';
    } else {
        scentOptions.style.display = 'none';
    }
}

// Generate score sheets
function generateScoreSheets(preview) {
    var selectedDates = [];
    var checkboxes = document.querySelectorAll('#dateSelectionContainer input[type="checkbox"]:checked');
    
    for (var i = 0; i < checkboxes.length; i++) {
        selectedDates.push(checkboxes[i].value);
    }
    
    if (selectedDates.length === 0) {
        alert('Please select at least one date');
        return;
    }
    
    var sheetsHTML = '';
    
    for (var d = 0; d < selectedDates.length; d++) {
        var date = selectedDates[d];
        
        // Get classes for this date
        var classesForDate = {};
        for (var i = 0; i < trialConfig.length; i++) {
            var config = trialConfig[i];
            if (config.date === date) {
                var key = config.className + '_' + config.roundNum;
                if (!classesForDate[key]) {
                    classesForDate[key] = config;
                }
            }
        }
        
        // Generate sheet for each class/round combination
        for (var classKey in classesForDate) {
            var config = classesForDate[classKey];
            var entriesForClass = getEntriesForClassRound(config.date, config.className, config.roundNum);
            
            if (selectedSheetType === 'scent') {
                sheetsHTML += generateScentDetectiveSheet(config, entriesForClass);
            } else {
                sheetsHTML += generateStandardSheet(config, entriesForClass);
            }
        }
    }
    
    if (preview) {
        document.getElementById('previewContent').innerHTML = sheetsHTML;
        document.getElementById('previewModal').style.display = 'flex';
    } else {
        var printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Score Sheets</title>');
        printWindow.document.write('<style>' + getScentScoreSheetStyles() + '</style>');
        printWindow.document.write('</head><body>' + sheetsHTML + '</body></html>');
        printWindow.document.close();
        printWindow.print();
    }
}

// Professional Score Sheet Generation - REPLACE the existing generateScentDetectiveSheet function

function generateScentDetectiveSheet(config, entries) {
    var round = document.getElementById('scentRoundSelect') ? document.getElementById('scentRoundSelect').value : '1';
    var formattedDate = new Date(config.date).toLocaleDateString();
    
    var html = '<div class="professional-score-sheet">' +
        
        // Header Section
        '<div class="sheet-header-section">' +
        '<div class="sheet-title">SCENT DETECTIVE SCORE SHEET</div>' +
        '<div class="sheet-subtitle">Official Competition Scoring Form</div>' +
        '</div>' +
        
        // Trial Information Grid
        '<div class="trial-info-grid">' +
        '<div class="info-row">' +
        '<div class="info-box">' +
        '<label>DATE:</label>' +
        '<div class="info-value">' + formattedDate + '</div>' +
        '</div>' +
        '<div class="info-box">' +
        '<label>CLASS:</label>' +
        '<div class="info-value">' + config.className + '</div>' +
        '</div>' +
        '<div class="info-box">' +
        '<label>JUDGE:</label>' +
        '<div class="info-value">' + config.judge + '</div>' +
        '</div>' +
        '</div>' +
        '<div class="info-row">' +
        '<div class="info-box wide">' +
        '<label>TRIAL LOCATION:</label>' +
        '<div class="info-line">_________________________________</div>' +
        '</div>' +
        '<div class="info-box">' +
        '<label>WEATHER:</label>' +
        '<div class="info-line">_____________</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        
        // Round Selection
        '<div class="round-selection-section">' +
        '<div class="round-label">ROUND:</div>' +
        '<div class="round-boxes">';
    
    for (var i = 1; i <= 4; i++) {
        var isSelected = (i == round);
        html += '<div class="round-checkbox' + (isSelected ? ' selected' : '') + '">' +
                '<div class="checkbox-mark">' + (isSelected ? '✓' : '') + '</div>' +
                '<label>' + i + '</label>' +
                '</div>';
    }
    html += '</div></div>';
    
    // Scent Locations Grid
    html += '<div class="scent-locations-section">' +
        '<div class="section-title">SCENT LOCATIONS</div>' +
        '<div class="locations-grid">' +
        '<div class="location-box">' +
        '<div class="location-label">SCENT 1</div>' +
        '<div class="location-detail">Located in/on:</div>' +
        '<div class="location-line">_________________________</div>' +
        '</div>' +
        '<div class="location-box">' +
        '<div class="location-label">SCENT 2</div>' +
        '<div class="location-detail">Located in/on:</div>' +
        '<div class="location-line">_________________________</div>' +
        '</div>' +
        '<div class="location-box">' +
        '<div class="location-label">SCENT 3</div>' +
        '<div class="location-detail">Located in/on:</div>' +
        '<div class="location-line">_________________________</div>' +
        '</div>' +
        '<div class="location-box">' +
        '<div class="location-label">SCENT 4</div>' +
        '<div class="location-detail">Located in/on:</div>' +
        '<div class="location-line">_________________________</div>' +
        '</div>' +
        '</div>' +
        '</div>';
    
    // Faults Reference
    html += '<div class="faults-reference">' +
        '<div class="section-title">SCORING FAULTS</div>' +
        '<div class="faults-grid">' +
        '<div class="fault-item">• Dropped Food</div>' +
        '<div class="fault-item">• Dog Stops Working</div>' +
        '<div class="fault-item">• Handler Guiding Dog</div>' +
        '<div class="fault-item">• Incorrect Find</div>' +
        '<div class="fault-item">• Destructive Behavior</div>' +
        '<div class="fault-item">• Disturbing Search Area</div>' +
        '<div class="fault-item">• Verbally Naming Item</div>' +
        '<div class="fault-item">• Continue Search After "Alert"</div>' +
        '</div>' +
        '</div>';
    
    // Main Scoring Table
    html += '<div class="scoring-section">' +
        '<div class="section-title">TEAM SCORING</div>' +
        '<table class="professional-score-table">' +
        '<thead>' +
        '<tr class="table-header">' +
        '<th class="team-col">TEAM</th>' +
        '<th class="dog-handler-col">DOG & HANDLER</th>' +
        '<th class="scent-col">SCENT 1</th>' +
        '<th class="scent-col">SCENT 2</th>' +
        '<th class="scent-col">SCENT 3</th>' +
        '<th class="scent-col">SCENT 4</th>' +
        '<th class="faults-col">FAULTS</th>' +
        '<th class="time-col">TIME</th>' +
        '<th class="result-col">RESULT</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody>';
    
    // Add entry rows with proper spacing
    var maxEntries = Math.max(8, entries.length + 2); // Ensure minimum 8 rows
    
    for (var i = 0; i < maxEntries; i++) {
        var entry = i < entries.length ? entries[i] : null;
        
        html += '<tr class="score-row">' +
            '<td class="team-col">' +
            '<div class="team-number">' + (i + 1) + '</div>' +
            '</td>' +
            '<td class="dog-handler-col">';
        
        if (entry) {
            html += '<div class="dog-info">' +
                '<div class="reg-name"><strong>' + entry.regNumber + '</strong> - ' + entry.callName + '</div>' +
                '<div class="handler-name">' + entry.handler + '</div>' +
                '<div class="entry-type">(' + entry.entryType.toUpperCase() + ')</div>' +
                '</div>';
        } else {
            html += '<div class="empty-entry">' +
                '<div class="reg-line">Reg: _______________</div>' +
                '<div class="name-line">Name: _____________</div>' +
                '<div class="handler-line">Handler: __________</div>' +
                '</div>';
        }
        
        html += '</td>';
        
        // Scent columns with checkboxes
        for (var s = 1; s <= 4; s++) {
            html += '<td class="scent-col">' +
                '<div class="scent-checkbox-container">' +
                '<div class="print-checkbox"></div>' +
                '<div class="checkbox-label">FOUND</div>' +
                '</div>' +
                '</td>';
        }
        
        // Faults column
        html += '<td class="faults-col">' +
            '<div class="faults-input">' +
            '<div class="fault-line">________________</div>' +
            '<div class="fault-line">________________</div>' +
            '</div>' +
            '</td>';
        
        // Time column
        html += '<td class="time-col">' +
            '<div class="time-input">' +
            '<div class="time-line">___:___</div>' +
            '<div class="time-label">(MM:SS)</div>' +
            '</div>' +
            '</td>';
        
        // Result column
        html += '<td class="result-col">' +
            '<div class="result-options">' +
            '<div class="result-option">' +
            '<div class="print-checkbox"></div>' +
            '<label>PASS</label>' +
            '</div>' +
            '<div class="result-option">' +
            '<div class="print-checkbox"></div>' +
            '<label>FAIL</label>' +
            '</div>' +
            '</div>' +
            '</td>';
        
        html += '</tr>';
    }
    
    html += '</tbody></table></div>';
    
    // Footer Section
    html += '<div class="sheet-footer">' +
        '<div class="signature-section">' +
        '<div class="signature-box">' +
        '<div class="signature-line">_________________________________</div>' +
        '<div class="signature-label">JUDGE SIGNATURE</div>' +
        '</div>' +
        '<div class="signature-box">' +
        '<div class="signature-line">_________________________________</div>' +
        '<div class="signature-label">DATE COMPLETED</div>' +
        '</div>' +
        '</div>' +
        '<div class="footer-notes">' +
        '<div class="note"><strong>NOTE:</strong> Mark all applicable faults and record exact time. Pass requires finding at least one correct scent with no disqualifying faults.</div>' +
        '</div>' +
        '</div>';
    
    html += '</div>'; // Close professional-score-sheet
    
    return html;
}

// Generate Professional Standard Score Sheet
function generateStandardSheet(config, entries) {
    var formattedDate = new Date(config.date).toLocaleDateString();
    
    var html = '<div class="professional-score-sheet standard-sheet">' +
        
        // Header Section
        '<div class="sheet-header-section">' +
        '<div class="sheet-title">COMPETITION SCORE SHEET</div>' +
        '<div class="sheet-subtitle">Official Trial Scoring Form</div>' +
        '</div>' +
        
        // Trial Information
        '<div class="trial-info-grid">' +
        '<div class="info-row">' +
        '<div class="info-box">' +
        '<label>DATE:</label>' +
        '<div class="info-value">' + formattedDate + '</div>' +
        '</div>' +
        '<div class="info-box">' +
        '<label>CLASS:</label>' +
        '<div class="info-value">' + config.className + '</div>' +
        '</div>' +
        '<div class="info-box">' +
        '<label>JUDGE:</label>' +
        '<div class="info-value">' + config.judge + '</div>' +
        '</div>' +
        '</div>' +
        '<div class="info-row">' +
        '<div class="info-box wide">' +
        '<label>TRIAL LOCATION:</label>' +
        '<div class="info-line">_________________________________</div>' +
        '</div>' +
        '<div class="info-box">' +
        '<label>ROUND:</label>' +
        '<div class="info-value">' + config.roundNum + '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        
        // Running Order Table
        '<div class="scoring-section">' +
        '<div class="section-title">RUNNING ORDER & SCORES</div>' +
        '<table class="professional-score-table standard-table">' +
        '<thead>' +
        '<tr class="table-header">' +
        '<th class="position-col">POS</th>' +
        '<th class="reg-col">REGISTRATION</th>' +
        '<th class="name-col">CALL NAME</th>' +
        '<th class="handler-col">HANDLER</th>' +
        '<th class="score-col">SCORE</th>' +
        '<th class="placement-col">PLACE</th>' +
        '<th class="notes-col">NOTES</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody>';
    
    var maxEntries = Math.max(12, entries.length + 3);
    
    for (var i = 0; i < maxEntries; i++) {
        var entry = i < entries.length ? entries[i] : null;
        
        html += '<tr class="score-row">' +
            '<td class="position-col">' + (i + 1) + '</td>';
        
        if (entry) {
            html += '<td class="reg-col">' + entry.regNumber + '</td>' +
                '<td class="name-col">' + entry.callName + '</td>' +
                '<td class="handler-col">' + entry.handler + '</td>';
        } else {
            html += '<td class="reg-col">___________</td>' +
                '<td class="name-col">___________</td>' +
                '<td class="handler-col">___________</td>';
        }
        
        html += '<td class="score-col">_______</td>' +
            '<td class="placement-col">____</td>' +
            '<td class="notes-col">___________________</td>' +
            '</tr>';
    }
    
    html += '</tbody></table></div>';
    
    // Footer
    html += '<div class="sheet-footer">' +
        '<div class="signature-section">' +
        '<div class="signature-box">' +
        '<div class="signature-line">_________________________________</div>' +
        '<div class="signature-label">JUDGE SIGNATURE</div>' +
        '</div>' +
        '<div class="signature-box">' +
        '<div class="signature-line">_________________________________</div>' +
        '<div class="signature-label">DATE COMPLETED</div>' +
        '</div>' +
        '</div>' +
        '</div>';
    
    html += '</div>';
    return html;
}

// Enhanced Print Function with PDF option
function printScoreSheets() {
    var selectedDates = [];
    var checkboxes = document.querySelectorAll('#dateSelectionContainer input[type="checkbox"]:checked');
    
    for (var i = 0; i < checkboxes.length; i++) {
        selectedDates.push(checkboxes[i].value);
    }
    
    if (selectedDates.length === 0) {
        alert('Please select at least one date');
        return;
    }
    
    var sheetsHTML = generateAllScoreSheets(selectedDates);
    
    // Create print window with enhanced styling
    var printWindow = window.open('', '_blank');
    printWindow.document.write('<!DOCTYPE html><html><head>');
    printWindow.document.write('<title>Professional Score Sheets</title>');
    printWindow.document.write('<meta charset="UTF-8">');
    printWindow.document.write('<style>' + getProfessionalScoreSheetStyles() + '</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<div class="print-container">' + sheetsHTML + '</div>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    
    // Auto-print after load
    printWindow.onload = function() {
        printWindow.print();
    };
}

function generateAllScoreSheets(selectedDates) {
    var sheetsHTML = '';
    
    for (var d = 0; d < selectedDates.length; d++) {
        var date = selectedDates[d];
        
        // Get classes for this date
        var classesForDate = {};
        for (var i = 0; i < trialConfig.length; i++) {
            var config = trialConfig[i];
            if (config.date === date) {
                var key = config.className + '_' + config.roundNum;
                if (!classesForDate[key]) {
                    classesForDate[key] = config;
                }
            }
        }
        
        // Generate sheet for each class/round combination
        for (var classKey in classesForDate) {
            var config = classesForDate[classKey];
            var entriesForClass = getEntriesForClassRound(config.date, config.className, config.roundNum);
            
            if (selectedSheetType === 'scent') {
                sheetsHTML += generateScentDetectiveSheet(config, entriesForClass);
            } else {
                sheetsHTML += generateStandardSheet(config, entriesForClass);
            }
        }
    }
    
    return sheetsHTML;
}
function generateStandardSheet(config, entries) {
    var formattedDate = new Date(config.date).toLocaleDateString();
    
    var html = '<div class="score-sheet">' +
        '<div class="score-sheet-header">' +
        '<div class="trial-info">' +
        '<div class="info-block">' +
        '<div class="info-label">Date</div>' +
        '<div class="info-value">' + formattedDate + '</div>' +
        '</div>' +
        '<div class="info-block">' +
        '<div class="info-label">Class</div>' +
        '<div class="info-value">' + config.className + '</div>' +
        '</div>' +
        '<div class="info-block">' +
        '<div class="info-label">Judge</div>' +
        '<div class="info-value">' + config.judge + '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        
        '<table class="running-order-table">' +
        '<thead>' +
        '<tr>' +
        '<th class="position-col">Position</th>' +
        '<th class="reg-col">Registration</th>' +
        '<th class="name-col">Call Name</th>' +
        '<th class="handler-col">Handler</th>' +
        '<th class="score-col">Score</th>' +
        '<th class="placement-col">Placement</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody>';
    
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        html += '<tr>' +
            '<td class="position-col">' + (i + 1) + '</td>' +
            '<td class="reg-col">' + entry.regNumber + '</td>' +
            '<td class="name-col">' + entry.callName + '</td>' +
            '<td class="handler-col">' + entry.handler + '</td>' +
            '<td class="score-col">&nbsp;</td>' +
            '<td class="placement-col">&nbsp;</td>' +
            '</tr>';
    }
    
    html += '</tbody></table></div>';
    return html;
}

function getScentScoreSheetStyles() {
    return `
        .scent-score-sheet { background: white; margin: 20px 0; page-break-after: always; border: 2px solid #000; padding: 15px; font-family: 'Times New Roman', serif; }
        .scent-sheet-header { text-align: center; margin-bottom: 20px; }
        .scent-sheet-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
        .scent-sheet-info { display: flex; justify-content: space-between; margin-bottom: 15px; font-weight: bold; }
        .scent-round-boxes { text-align: center; margin: 15px 0; }
        .scent-round-box { display: inline-block; width: 30px; height: 30px; border: 2px solid #000; margin: 0 10px; line-height: 26px; font-weight: bold; font-size: 16px; }
        .scent-round-box.selected { background: #000; color: white; }
        .scent-locations { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 15px 0; border: 2px solid #000; padding: 10px; }
        .scent-location { text-align: center; border: 1px solid #000; padding: 8px; min-height: 40px; }
        .scent-faults-section { border: 1px solid #000; padding: 10px; margin: 15px 0; font-size: 11px; }
        .scent-score-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 10px; }
        .scent-score-table th, .scent-score-table td { border: 1px solid #000; padding: 4px; text-align: center; }
        .scent-score-table th { background: #f0f0f0; font-weight: bold; }
        .scent-team-col { width: 60px; } .scent-dog-handler-col { width: 120px; text-align: left; }
        .scent-scent-col { width: 50px; } .scent-fault-col { width: 80px; }
        .scent-time-col { width: 60px; } .scent-pass-fail-col { width: 60px; }
    `;
}

// Preview and Print Functions
function previewScoreSheets() {
    generateScoreSheets(true);
}

function printScoreSheets() {
    generateScoreSheets(false);
}

function closePreview() {
    document.getElementById('previewModal').style.display = 'none';
}

function printFromPreview() {
    var printContent = document.getElementById('previewContent').innerHTML;
    var printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Score Sheets</title>');
    printWindow.document.write('<style>' + getScentScoreSheetStyles() + '</style>');
    printWindow.document.write('</head><body>' + printContent + '</body></html>');
    printWindow.document.close();
    printWindow.print();
}

function openDigitalEntry() {
    closePreview();
    showTab('score-entry', document.querySelectorAll('.nav-tab')[6]);
}

// Digital Score Entry Functions
function loadDigitalScoreEntry() {
    if (trialConfig.length === 0) {
        document.getElementById('digitalSheetSelector').innerHTML = 
            '<p style="color: #666; padding: 20px; text-align: center;">No trial configuration found. Please complete trial setup first.</p>';
        return;
    }
    
    loadDigitalSheetSelector();
    updateCompletionProgress();
}

function loadDigitalSheetSelector() {
    var sheetOptions = {};
    
    for (var i = 0; i < trialConfig.length; i++) {
        var config = trialConfig[i];
        var key = config.date + '|' + config.className + '|' + config.roundNum;
        if (!sheetOptions[key]) {
            var entriesForClass = getEntriesForClassRound(config.date, config.className, config.roundNum);
            sheetOptions[key] = {
                config: config,
                entries: entriesForClass,
                key: key
            };
        }
    }
    
    var html = '';
    var sortedKeys = Object.keys(sheetOptions).sort();
    
    for (var i = 0; i < sortedKeys.length; i++) {
        var key = sortedKeys[i];
        var option = sheetOptions[key];
        var config = option.config;
        var entries = option.entries;
        
        if (entries.length === 0) continue;
        
        var formattedDate = new Date(config.date).toLocaleDateString();
        var completedCount = getCompletedScoresCount(key);
        var totalEntries = entries.length;
        var isSelected = (currentDigitalSheet === key);
        
        html += '<div class="sheet-option' + (isSelected ? ' selected' : '') + '" onclick="selectDigitalSheet(\'' + key + '\')">' +
            '<div class="sheet-option-title">' + config.className + ' - Round ' + config.roundNum + '</div>' +
            '<div class="sheet-option-meta">' + formattedDate + ' | Judge: ' + config.judge + '</div>' +
            '<div class="sheet-option-stats">' + completedCount + '/' + totalEntries + ' scored (' + 
            Math.round((completedCount / totalEntries) * 100) + '%)</div>' +
            '</div>';
    }
    
    if (html === '') {
        html = '<p style="color: #666; padding: 20px; text-align: center;">No entries found. Please add entries to your trial first.</p>';
    }
    
    document.getElementById('digitalSheetSelector').innerHTML = html;
}

function selectDigitalSheet(sheetKey) {
    currentDigitalSheet = sheetKey;
    
    // Update visual selection
    var options = document.querySelectorAll('.sheet-option');
    for (var i = 0; i < options.length; i++) {
        options[i].classList.remove('selected');
    }
    event.target.classList.add('selected');
    
    loadDigitalScoreSheet(sheetKey);
    updateCompletionProgress();
}

function loadDigitalScoreSheet(sheetKey) {
    var keyParts = sheetKey.split('|');
    var date = keyParts[0];
    var className = keyParts[1];
    var round = keyParts[2];
    
    var config = null;
    for (var i = 0; i < trialConfig.length; i++) {
        if (trialConfig[i].date === date && 
            trialConfig[i].className === className && 
            trialConfig[i].roundNum == round) {
            config = trialConfig[i];
            break;
        }
    }
    
    if (!config) return;
    
    var entries = getEntriesForClassRound(date, className, round);
    if (entries.length === 0) {
        document.getElementById('digitalScoreSheetContainer').innerHTML = 
            '<p style="color: #666; padding: 20px; text-align: center;">No entries found for this class/round.</p>';
        return;
    }
    
    var html = generateDigitalScentSheet(config, entries, sheetKey);
    document.getElementById('digitalScoreSheetContainer').innerHTML = html;
}

function generateDigitalScentSheet(config, entries, sheetKey) {
    var formattedDate = new Date(config.date).toLocaleDateString();
    
    var html = '<div class="digital-score-sheet">' +
        '<div class="digital-sheet-header">' +
        '<div class="scent-sheet-title">Scent Detective Digital Score Entry</div>' +
        '<div class="scent-sheet-info">' +
        '<div>Date: <strong>' + formattedDate + '</strong></div>' +
        '<div>CLASS: <strong>' + config.className + '</strong></div>' +
        '<div>Round: <strong>' + config.roundNum + '</strong></div>' +
        '<div>Judge: <strong>' + config.judge + '</strong></div>' +
        '</div>' +
        '</div>' +
        
        '<div class="digital-sheet-controls">' +
        '<div>' +
        '<button class="score-control-btn save" onclick="saveCurrentSheet()">💾 Save Scores</button>' +
        '<button class="score-control-btn clear" onclick="clearCurrentSheet()">🗑️ Clear Sheet</button>' +
        '<button class="score-control-btn export" onclick="exportCurrentSheet()">📊 Export Sheet</button>' +
        '</div>' +
        '<div>' +
        '<label style="font-size: 12px;">' +
        '<input type="checkbox" id="autoSaveEnabled" checked onchange="toggleAutoSave()"> Auto-save enabled' +
        '</label>' +
        '</div>' +
        '</div>';
    
    // Scent locations section
    html += '<div class="scent-locations">' +
        '<div class="scent-location">' +
        '<strong>Scent 1 Located:</strong><br>' +
        '<input type="text" id="scent1Location" placeholder="Location..." style="width: 90%; margin-top: 5px;" onchange="saveScoreData()">' +
        '</div>' +
        '<div class="scent-location">' +
        '<strong>Scent 2 Located:</strong><br>' +
        '<input type="text" id="scent2Location" placeholder="Location..." style="width: 90%; margin-top: 5px;" onchange="saveScoreData()">' +
        '</div>' +
        '<div class="scent-location">' +
        '<strong>Scent 3 Located:</strong><br>' +
        '<input type="text" id="scent3Location" placeholder="Location..." style="width: 90%; margin-top: 5px;" onchange="saveScoreData()">' +
        '</div>' +
        '<div class="scent-location">' +
        '<strong>Scent 4 Located:</strong><br>' +
        '<input type="text" id="scent4Location" placeholder="Location..." style="width: 90%; margin-top: 5px;" onchange="saveScoreData()">' +
        '</div>' +
        '</div>';
    
    html += '<div class="scent-faults-section">' +
        '<strong>Faults:</strong> Dropped Food; Dog stops working; Handler guiding dog; ' +
        'Incorrect find; Destructive behavior; Disturbing search area by dog or handler; ' +
        'Verbally naming item; Continue search after "alert"; SR crossing line less than half.' +
        '</div>';
    
    html += '<table class="scent-score-table">' +
        '<thead>' +
        '<tr>' +
        '<th class="scent-team-col">Team</th>' +
        '<th class="scent-dog-handler-col">Dog -- Handler</th>' +
        '<th class="scent-scent-col">Scent 1</th>' +
        '<th class="scent-scent-col">Scent 2</th>' +
        '<th class="scent-scent-col">Scent 3</th>' +
        '<th class="scent-scent-col">Scent 4</th>' +
        '<th class="scent-fault-col">Faults</th>' +
        '<th class="scent-time-col">Time</th>' +
        '<th class="scent-pass-fail-col">Result</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody>';
    
    // Add entries with input fields
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var entryKey = sheetKey + '|' + entry.regNumber + '|' + entry.entryType;
        var savedData = digitalScoreData[entryKey] || {};
        
        html += '<tr class="score-entry-row" data-entry-key="' + entryKey + '">' +
            '<td class="scent-team-col">' + (i + 1) + '</td>' +
            '<td class="scent-dog-handler-col" style="text-align: left;">' + 
            '<strong>' + entry.regNumber + ' - ' + entry.callName + '</strong><br>' +
            '<small>' + entry.handler + ' (' + entry.entryType.toUpperCase() + ')</small></td>';
        
        // Scent checkboxes
        for (var s = 1; s <= 4; s++) {
            var checked = savedData['scent' + s] ? 'checked' : '';
            html += '<td class="scent-scent-col">' +
                '<input type="checkbox" class="scent-checkbox" ' + checked + ' ' +
                'onchange="updateScentScore(\'' + entryKey + '\', \'scent' + s + '\', this.checked)">' +
                '</td>';
        }
        
        html += '<td class="scent-fault-col">' +
            '<input type="text" class="digital-fault-input" value="' + (savedData.faults || '') + '" ' +
            'onchange="updateScentScore(\'' + entryKey + '\', \'faults\', this.value)" placeholder="Faults">' +
            '</td>' +
            '<td class="scent-time-col">' +
            '<input type="text" class="digital-time-input" value="' + (savedData.time || '') + '" ' +
            'onchange="updateScentScore(\'' + entryKey + '\', \'time\', this.value)" placeholder="mm:ss">' +
            '</td>' +
            '<td class="scent-pass-fail-col">' +
            '<select class="digital-pass-fail-select" onchange="updateScentScore(\'' + entryKey + '\', \'result\', this.value)">' +
            '<option value="">-</option>' +
            '<option value="Pass"' + (savedData.result === 'Pass' ? ' selected' : '') + '>Pass</option>' +
            '<option value="Fail"' + (savedData.result === 'Fail' ? ' selected' : '') + '>Fail</option>' +
            '</select>' +
            '</td>' +
            '</tr>';
    }
    
    html += '</tbody></table></div>';
    
    // Load saved location data
    setTimeout(function() {
        loadSavedLocationData(sheetKey);
    }, 100);
    
    return html;
}

// Digital scoring utility functions
function updateScentScore(entryKey, field, value) {
    if (!digitalScoreData[entryKey]) {
        digitalScoreData[entryKey] = {};
    }
    digitalScoreData[entryKey][field] = value;
    
    // Update row styling based on completion
    var row = document.querySelector('[data-entry-key="' + entryKey + '"]');
    if (row) {
        var isCompleted = checkEntryCompletion(entryKey);
        if (isCompleted) {
            row.classList.add('completed');
        } else {
            row.classList.remove('completed');
        }
    }
    
    // Trigger auto-save
    if (document.getElementById('autoSaveEnabled') && document.getElementById('autoSaveEnabled').checked) {
        scheduleAutoSave();
    }
    
    updateCompletionProgress();
}

function checkEntryCompletion(entryKey) {
    var data = digitalScoreData[entryKey];
    if (!data) return false;
    
    // Check if at least one scent is found and result is set
    var hasScent = data.scent1 || data.scent2 || data.scent3 || data.scent4;
    var hasResult = data.result && data.result !== '';
    
    return hasScent && hasResult;
}

function getCompletedScoresCount(sheetKey) {
    var count = 0;
    for (var entryKey in digitalScoreData) {
        if (entryKey.startsWith(sheetKey + '|')) {
            if (checkEntryCompletion(entryKey)) {
                count++;
            }
        }
    }
    return count;
}

function updateCompletionProgress() {
    if (!currentDigitalSheet) return;
    
    var keyParts = currentDigitalSheet.split('|');
    var entries = getEntriesForClassRound(keyParts[0], keyParts[1], keyParts[2]);
    var completed = getCompletedScoresCount(currentDigitalSheet);
    var total = entries.length;
    
    if (total === 0) return;
    
    var percentage = Math.round((completed / total) * 100);
    
    var progressBar = document.getElementById('completionBar');
    var progressText = document.getElementById('completionText');
    
    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }
    if (progressText) {
        progressText.textContent = percentage + '% Complete (' + completed + '/' + total + ' entries)';
    }
}

function scheduleAutoSave() {
    if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
    }
    
    showAutoSaveStatus('saving');
    
    autoSaveTimer = setTimeout(function() {
        saveScoreData();
        showAutoSaveStatus('saved');
        
        setTimeout(function() {
            hideAutoSaveStatus();
        }, 2000);
    }, 1000);
}

function showAutoSaveStatus(status) {
    var statusDiv = document.getElementById('autoSaveStatus');
    statusDiv.style.display = 'block';
    statusDiv.className = 'auto-save-status ' + status;
    
    switch(status) {
        case 'saving':
            statusDiv.textContent = '💾 Saving...';
            break;
        case 'saved':
            statusDiv.textContent = '✅ Saved';
            break;
        case 'error':
            statusDiv.textContent = '❌ Save Error';
            break;
    }
}

function hideAutoSaveStatus() {
    var statusDiv = document.getElementById('autoSaveStatus');
    statusDiv.style.display = 'none';
}

function toggleAutoSave() {
    var checkbox = document.getElementById('autoSaveEnabled');
    if (checkbox.checked) {
        showStatusMessage('Auto-save enabled', 'success');
    } else {
        showStatusMessage('Auto-save disabled', 'info');
    }
}

function loadSavedLocationData(sheetKey) {
    var locationInputs = ['scent1Location', 'scent2Location', 'scent3Location', 'scent4Location'];
    
    for (var i = 0; i < locationInputs.length; i++) {
        var inputId = locationInputs[i];
        var dataKey = sheetKey + '|' + inputId;
        var input = document.getElementById(inputId);
        
        if (input && digitalScoreData[dataKey]) {
            input.value = digitalScoreData[dataKey];
        }
    }
}

// Sheet control functions
function saveCurrentSheet() {
    if (!currentDigitalSheet) {
        alert('No sheet selected');
        return;
    }
    
    saveScoreData();
    showStatusMessage('Score sheet saved successfully!', 'success');
    updateCompletionProgress();
    loadDigitalSheetSelector();
}

function clearCurrentSheet() {
    if (!currentDigitalSheet) {
        alert('No sheet selected');
        return;
    }
    
    if (confirm('Are you sure you want to clear all scores for this sheet? This action cannot be undone.')) {
        // Clear all scores for current sheet
        for (var entryKey in digitalScoreData) {
            if (entryKey.startsWith(currentDigitalSheet + '|')) {
                delete digitalScoreData[entryKey];
            }
        }
        
        saveScoreData();
        loadDigitalScoreSheet(currentDigitalSheet);
        updateCompletionProgress();
        loadDigitalSheetSelector();
        showStatusMessage('Score sheet cleared!', 'success');
    }
}

function exportCurrentSheet() {
    if (!currentDigitalSheet) {
        alert('No sheet selected');
        return;
    }
    
    var keyParts = currentDigitalSheet.split('|');
    var date = keyParts[0];
    var className = keyParts[1];
    var round = keyParts[2];
    var entries = getEntriesForClassRound(date, className, round);
    
    var csv = 'Team,Registration,Call Name,Handler,Entry Type,Scent 1,Scent 2,Scent 3,Scent 4,Faults,Time,Result\n';
    
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var entryKey = currentDigitalSheet + '|' + entry.regNumber + '|' + entry.entryType;
        var data = digitalScoreData[entryKey] || {};
        
        csv += (i + 1) + ',' + 
               entry.regNumber + ',' + 
               entry.callName + ',' + 
               entry.handler + ',' + 
               entry.entryType + ',' + 
               (data.scent1 ? 'Found' : 'Not Found') + ',' + 
               (data.scent2 ? 'Found' : 'Not Found') + ',' + 
               (data.scent3 ? 'Found' : 'Not Found') + ',' + 
               (data.scent4 ? 'Found' : 'Not Found') + ',' + 
               (data.faults || '') + ',' + 
               (data.time || '') + ',' + 
               (data.result || '') + '\n';
    }
    
    var filename = 'scent_scores_' + className.replace(/\s+/g, '_') + '_round_' + round + '_' + date + '.csv';
    downloadFile(csv, filename, 'text/csv');
    showStatusMessage('Score sheet exported successfully!', 'success');
}

function exportAllScores() {
    if (Object.keys(digitalScoreData).length === 0) {
        alert('No scores to export');
        return;
    }

    var csv = 'Date,Class,Round,Judge,Team,Registration,Call Name,Handler,Entry Type,Scent 1,Scent 2,Scent 3,Scent 4,Faults,Time,Result\n';
    
    // Group scores by sheet
    var sheetGroups = {};
    for (var entryKey in digitalScoreData) {
        var keyParts = entryKey.split('|');
        if (keyParts.length >= 5) {
            var sheetKey = keyParts[0] + '|' + keyParts[1] + '|' + keyParts[2];
            if (!sheetGroups[sheetKey]) {
                sheetGroups[sheetKey] = [];
            }
            sheetGroups[sheetKey].push(entryKey);
        }
    }
    
    for (var sheetKey in sheetGroups) {
        var keyParts = sheetKey.split('|');
        var date = keyParts[0];
        var className = keyParts[1];
        var round = keyParts[2];
        
        var config = null;
        for (var i = 0; i < trialConfig.length; i++) {
            if (trialConfig[i].date === date && 
                trialConfig[i].className === className && 
                trialConfig[i].roundNum == round) {
                config = trialConfig[i];
                break;
            }
        }
        
        var judge = config ? config.judge : 'Unknown';
        var entries = getEntriesForClassRound(date, className, round);
        
        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            var entryKey = sheetKey + '|' + entry.regNumber + '|' + entry.entryType;
            var data = digitalScoreData[entryKey];
            
            if (data && Object.keys(data).length > 0) {
                csv += date + ',' + 
                       className + ',' + 
                       round + ',' + 
                       judge + ',' + 
                       (i + 1) + ',' + 
                       entry.regNumber + ',' + 
                       entry.callName + ',' + 
                       entry.handler + ',' + 
                       entry.entryType + ',' + 
                       (data.scent1 ? 'Found' : 'Not Found') + ',' + 
                       (data.scent2 ? 'Found' : 'Not Found') + ',' + 
                       (data.scent3 ? 'Found' : 'Not Found') + ',' + 
                       (data.scent4 ? 'Found' : 'Not Found') + ',' + 
                       (data.faults || '') + ',' + 
                       (data.time || '') + ',' + 
                       (data.result || '') + '\n';
            }
        }
    }

    downloadFile(csv, 'all_digital_scores.csv', 'text/csv');
    showStatusMessage('All digital scores exported successfully!', 'success');
}

function clearAllScores() {
    if (confirm('Are you sure you want to clear ALL digital scores? This action cannot be undone.')) {
        digitalScoreData = {};
        saveScoreData();
        
        if (currentDigitalSheet) {
            loadDigitalScoreSheet(currentDigitalSheet);
        }
        updateCompletionProgress();
        loadDigitalSheetSelector();
        showStatusMessage('All digital scores cleared!', 'success');
    }
}

function printCurrentSheet() {
    if (!currentDigitalSheet) {
        alert('No sheet selected');
        return;
    }
    
    var sheetContent = document.getElementById('digitalScoreSheetContainer').innerHTML;
    var printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Digital Score Sheet</title>');
    printWindow.document.write('<style>' + getDigitalScoreSheetStyles() + '</style>');
    printWindow.document.write('</head><body>' + sheetContent + '</body></html>');
    printWindow.document.close();
    printWindow.print();
}

function getDigitalScoreSheetStyles() {
    return `
        .digital-score-sheet { background: white; margin: 20px 0; border: 2px solid #333; padding: 15px; font-family: 'Times New Roman', serif; }
        .digital-sheet-header { background: #f8f9fa; padding: 15px 20px; border-bottom: 2px solid #333; text-align: center; }
        .scent-sheet-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
        .scent-sheet-info { display: flex; justify-content: space-between; margin-bottom: 15px; font-weight: bold; }
        .scent-locations { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 15px 0; border: 2px solid #000; padding: 10px; }
        .scent-location { text-align: center; border: 1px solid #000; padding: 8px; min-height: 40px; }
        .scent-faults-section { border: 1px solid #000; padding: 10px; margin: 15px 0; font-size: 11px; }
        .scent-score-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 10px; }
        .scent-score-table th, .scent-score-table td { border: 1px solid #000; padding: 4px; text-align: center; }
        .scent-score-table th { background: #f0f0f0; font-weight: bold; }
        .digital-sheet-controls { display: none; }
        .digital-score-input, .digital-fault-input, .digital-time-input, .digital-pass-fail-select { border: none; background: transparent; font-weight: bold; }
    `;
}
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
// MODIFY the existing updateScentScore function in js/score-sheets.js
// Add this line at the very end of the function:

function updateScentScore(entryKey, field, value) {
    if (!digitalScoreData[entryKey]) {
        digitalScoreData[entryKey] = {};
    }
    digitalScoreData[entryKey][field] = value;
    
    // Update row styling based on completion
    var row = document.querySelector('[data-entry-key="' + entryKey + '"]');
    if (row) {
        var isCompleted = checkEntryCompletion(entryKey);
        if (isCompleted) {
            row.classList.add('completed');
        } else {
            row.classList.remove('completed');
        }
    }
    
    // Trigger auto-save
    if (document.getElementById('autoSaveEnabled') && document.getElementById('autoSaveEnabled').checked) {
        scheduleAutoSave();
    }
    
    updateCompletionProgress();
    
    // ADD THIS LINE - Auto-update score summary when scores change
    updateScoreSummaryDisplay();
}
