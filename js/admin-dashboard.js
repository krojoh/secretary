// Load cross reference tab
function loadCrossReferenceTab() {
    const container = document.getElementById('crossReferenceResults');
    if (!container) return;
    
    if (entryResults.length === 0) {
        container.innerHTML = '<p class="no-data">No entries available for cross-reference.</p>';
        return;
    }
    
    container.innerHTML = '<p class="no-data">Enter search criteria above to find entries.</p>';
}

// Perform cross reference search
function performCrossReference() {
    const searchReg = document.getElementById('searchReg')?.value.toLowerCase() || '';
    const searchHandler = document.getElementById('searchHandler')?.value.toLowerCase() || '';
    const searchDog = document.getElementById('searchDog')?.value.toLowerCase() || '';
    
    if (!searchReg && !searchHandler && !searchDog) {
        showStatusMessage('Please enter at least one search criteria', 'warning');
        return;
    }
    
    const results = entryResults.filter(entry => {
        const matchesReg = !searchReg || entry.registration.toLowerCase().includes(searchReg);
        const matchesHandler = !searchHandler || entry.handler.toLowerCase().includes(searchHandler);
        const matchesDog = !searchDog || entry.callName.toLowerCase().includes(searchDog);
        
        return matchesReg && matchesHandler && matchesDog;
    });
    
    displayCrossReferenceResults(results);
}

// Display cross reference results
function displayCrossReferenceResults(results) {
    const container = document.getElementById('crossReferenceResults');
    if (!container) return;
    
    if (results.length === 0) {
        container.innerHTML = '<p class="no-data">No entries found matching your search criteria.</p>';
        return;
    }
    
    let html = `
        <div class="cross-reference-header">
            <h4>Cross Reference Results (${results.length} found)</h4>
        </div>
        <table class="cross-reference-table">
            <thead>
                <tr>
                    <th>Registration</th>
                    <th>Call Name</th>
                    <th>Handler</th>
                    <th>Class</th>
                    <th>Judge</th>
                    <th>Date</th>
                    <th>Round</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    results.forEach((entry, index) => {
        html += `
            <tr onclick="highlightEntry(this)">
                <td>${entry.registration}</td>
                <td><strong>${entry.callName}</strong></td>
                <td>${entry.handler}</td>
                <td>${entry.className}</td>
                <td>${entry.judge}</td>
                <td>${formatDate(entry.date)}</td>
                <td>${entry.roundNum}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-info btn-sm" onclick="viewEntryDetails('${entry.entryId}')">👁️</button>
                        <button class="btn btn-warning btn-sm" onclick="editEntry('${entry.entryId}')">✏️</button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Clear cross reference
function clearCrossReference() {
    document.getElementById('searchReg').value = '';
    document.getElementById('searchHandler').value = '';
    document.getElementById('searchDog').value = '';
    document.getElementById('crossReferenceResults').innerHTML = '<p class="no-data">Enter search criteria above to find entries.</p>';
}

// Highlight entry row
function highlightEntry(row) {
    // Remove previous highlights
    document.querySelectorAll('.cross-reference-table tr').forEach(tr => {
        tr.classList.remove('highlighted');
    });
    
    // Add highlight to clicked row
    row.classList.add('highlighted');
}

// View entry details
function viewEntryDetails(entryId) {
    const entry = entryResults.find(e => e.entryId === entryId);
    if (!entry) {
        showStatusMessage('Entry not found', 'error');
        return;
    }
    
    const details = `
        Registration: ${entry.registration}
        Call Name: ${entry.callName}
        Registered Name: ${entry.registeredName || 'N/A'}
        Handler: ${entry.handler}
        Class: ${entry.className}
        Judge: ${entry.judge}
        Date: ${formatDate(entry.date)}
        Round: ${entry.roundNum}
        Entry Time: ${formatDate(entry.timestamp)}
    `;
    
    alert(details);
}

// Edit entry
function editEntry(entryId) {
    const entry = entryResults.find(e => e.entryId === entryId);
    if (!entry) {
        showStatusMessage('Entry not found', 'error');
        return;
    }
    
    // Switch to entry tab and populate form
    showTab('entry', document.querySelectorAll('.nav-tab')[1]);
    
    // Populate form with entry data
    setTimeout(() => {
        document.getElementById('entryRegNumber').value = entry.registration;
        document.getElementById('entryCallName').value = entry.callName;
        document.getElementById('entryRegisteredName').value = entry.registeredName || '';
        document.getElementById('entryHandler').value = entry.handler;
        document.getElementById('entryClass').value = entry.className;
        document.getElementById('entryJudge').value = entry.judge;
        document.getElementById('entryDate').value = entry.date;
        document.getElementById('entryRound').value = entry.roundNum;
        
        showStatusMessage('Entry loaded for editing', 'info');
    }, 500);
}

// Load digital score entry
function loadDigitalScoreEntry() {
    const container = document.getElementById('digitalSheetSelector');
    if (!container) return;
    
    if (trialConfig.length === 0) {
        container.innerHTML = '<p class="no-data">No trial configuration found. Please complete trial setup first.</p>';
        return;
    }
    
    let html = '<div class="digital-sheets-grid">';
    
    trialConfig.forEach(config => {
        const sheetKey = `${config.date}|${config.className}|${config.roundNum}`;
        const hasScores = digitalScoreData[sheetKey] && Object.keys(digitalScoreData[sheetKey]).length > 0;
        const entries = getEntriesForSheet(config);
        
        html += `
            <div class="sheet-option ${hasScores ? 'has-scores' : ''}" onclick="selectDigitalSheet('${sheetKey}')">
                <div class="sheet-info">
                    <h4>${config.className}</h4>
                    <p>📅 ${formatDate(config.date)}</p>
                    <p>👨‍⚖️ ${config.judge}</p>
                    <p>🔄 Round ${config.roundNum}</p>
                    <p>📊 ${entries.length} entries</p>
                </div>
                <div class="sheet-status">
                    ${hasScores ? 
                        '<span class="status-badge scored">✅ Scored</span>' : 
                        '<span class="status-badge pending">⏳ Pending</span>'
                    }
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Select digital sheet
function selectDigitalSheet(sheetKey) {
    const container = document.getElementById('digitalScoreSheetContainer');
    if (!container) return;
    
    // Remove previous selections
    document.querySelectorAll('.sheet-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selection to clicked option
    event.target.closest('.sheet-option').classList.add('selected');
    
    const [date, className, roundNum] = sheetKey.split('|');
    const config = trialConfig.find(c => 
        c.date === date && 
        c.className === className && 
        c.roundNum === parseInt(roundNum)
    );
    
    if (!config) {
        container.innerHTML = '<p class="no-data">Configuration not found for this sheet.</p>';
        return;
    }
    
    const entries = getEntriesForSheet(config);
    if (entries.length === 0) {
        container.innerHTML = '<p class="no-data">No entries found for this class/round.</p>';
        return;
    }
    
    generateDigitalScoreSheet(config, entries, sheetKey);
}

// Generate digital score sheet
function generateDigitalScoreSheet(config, entries, sheetKey) {
    const container = document.getElementById('digitalScoreSheetContainer');
    
    let html = `
        <div class="digital-score-sheet">
            <div class="digital-sheet-header">
                <h3>💻 Digital Score Entry - ${config.className}</h3>
                <div class="sheet-meta">
                    <span>📅 ${formatDate(config.date)}</span>
                    <span>👨‍⚖️ ${config.judge}</span>
                    <span>🔄 Round ${config.roundNum}</span>
                </div>
            </div>
            
            <div class="digital-controls">
                <button class="btn btn-success" onclick="saveDigitalSheet('${sheetKey}')">💾 Save Scores</button>
                <button class="btn btn-warning" onclick="clearDigitalSheet('${sheetKey}')">🗑️ Clear Sheet</button>
                <button class="btn btn-info" onclick="exportDigitalSheet('${sheetKey}')">📤 Export</button>
            </div>
            
            <table class="digital-score-table">
                <thead>
                    <tr>
                        <th>Position</th>
                        <th>Call Name</th>
                        <th>Handler</th>
                        <th>Registration</th>
                        <th>Score</th>
                        <th>Time</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    entries.forEach((entry, index) => {
        const existingScore = digitalScoreData[sheetKey]?.[entry.registration] || {};
        
        html += `
            <tr>
                <td class="position-cell">${index + 1}</td>
                <td class="name-cell"><strong>${entry.callName}</strong></td>
                <td class="handler-cell">${entry.handler}</td>
                <td class="reg-cell">${entry.registration}</td>
                <td class="score-cell">
                    <input type="number" 
                           value="${existingScore.score || ''}" 
                           placeholder="Score"
                           onchange="updateDigitalScore('${sheetKey}', '${entry.registration}', 'score', this.value)"
                           class="score-input">
                </td>
                <td class="time-cell">
                    <input type="text" 
                           value="${existingScore.time || ''}" 
                           placeholder="MM:SS"
                           onchange="updateDigitalScore('${sheetKey}', '${entry.registration}', 'time', this.value)"
                           class="time-input">
                </td>
                <td class="notes-cell">
                    <input type="text" 
                           value="${existingScore.notes || ''}" 
                           placeholder="Notes"
                           onchange="updateDigitalScore('${sheetKey}', '${entry.registration}', 'notes', this.value)"
                           class="notes-input">
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// Update digital score
function updateDigitalScore(sheetKey, registration, field, value) {
    if (!digitalScoreData[sheetKey]) {
        digitalScoreData[sheetKey] = {};
    }
    if (!digitalScoreData[sheetKey][registration]) {
        digitalScoreData[sheetKey][registration] = {};
    }
    
    digitalScoreData[sheetKey][registration][field] = value;
    
    // Auto-save after short delay
    if (autoSaveEnabled) {
        debounce(() => {
            saveTrialUpdates();
            showStatusMessage('Score auto-saved', 'saved', 1000);
        }, 1500)();
    }
}

// Save digital sheet
function saveDigitalSheet(sheetKey) {
    saveTrialUpdates();
    showStatusMessage('Digital scores saved successfully!', 'success');
    
    // Update the sheet selector to show it has scores
    loadDigitalScoreEntry();
}

// Clear digital sheet
function clearDigitalSheet(sheetKey) {
    if (confirm('Are you sure you want to clear all scores for this sheet?')) {
        delete digitalScoreData[sheetKey];
        saveTrialUpdates();
        selectDigitalSheet(sheetKey);
        showStatusMessage('Digital sheet cleared', 'success');
    }
}

// Export digital sheet
function exportDigitalSheet(sheetKey) {
    const scores = digitalScoreData[sheetKey];
    if (!scores || Object.keys(scores).length === 0) {
        showStatusMessage('No scores to export for this sheet', 'warning');
        return;
    }
    
    const [date, className, roundNum] = sheetKey.split('|');
    const exportData = {
        date: date,
        className: className,
        round: parseInt(roundNum),
        scores: scores,
        exportDate: new Date().toISOString()
    };
    
    const filename = `${className}_Round${roundNum}_${date.replace(/-/g, '')}_scores.json`;
    downloadFile(JSON.stringify(exportData, null, 2), filename, 'application/json');
    showStatusMessage('Digital scores exported', 'success');
}

// Save all digital scores
function saveAllDigitalScores() {
    saveTrialUpdates();
    showStatusMessage('All digital scores saved!', 'success');
}

// Sync digital scores
function syncDigitalScores() {
    // This would typically sync with external systems
    showStatusMessage('Digital scores synced (simulation)', 'info');
}

// Load existing digital scores
function loadExistingDigitalScores() {
    // This function loads any existing digital scores when tab is opened
    if (Object.keys(digitalScoreData).length > 0) {
        showStatusMessage(`Loaded ${Object.keys(digitalScoreData).length} digital score sheets`, 'info', 2000);
    }
}

// Load reports
function loadReports() {
    const container = document.getElementById('reportsContainer');
    if (!container) return;
    
    if (trialConfig.length === 0) {
        container.innerHTML = '<p class="no-data">Complete trial setup first to generate reports.</p>';
        return;
    }
    
    container.innerHTML = '<p class="no-data">Select a report type above to get started.</p>';
}

// Generate summary report
function generateSummaryReport() {
    const container = document.getElementById('reportsContainer');
    
    const totalEntries = entryResults.length;
    const uniqueHandlers = new Set(entryResults.map(e => e.handler)).size;
    const uniqueDogs = new Set(entryResults.map(e => e.registration)).size;
    const uniqueClasses = getUniqueClasses(trialConfig).length;
    const uniqueJudges = getUniqueJudges(trialConfig).length;
    const trialDays = getUniqueDays(trialConfig).length;
    
    let html = `
        <div class="summary-report">
            <h3>📈 Trial Summary Report</h3>
            <div class="report-date">Generated: ${new Date().toLocaleDateString()}</div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${totalEntries}</div>
                    <div class="stat-label">Total Entries</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${uniqueDogs}</div>
                    <div class="stat-label">Unique Dogs</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${uniqueHandlers}</div>
                    <div class="stat-label">Handlers</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${uniqueJudges}</div>
                    <div class="stat-label">Judges</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${uniqueClasses}</div>
                    <div class="stat-label">Classes</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${trialDays}</div>
                    <div class="stat-label">Trial Days</div>
                </div>
            </div>
    `;
    
    if (entryResults.length > 0) {
        // Entries by class
        const classCounts = {};
        entryResults.forEach(entry => {
            classCounts[entry.className] = (classCounts[entry.className] || 0) + 1;
        });
        
        html += `
            <div class="report-section">
                <h4>📊 Entries by Class</h4>
                <table class="results-table">
                    <thead>
                        <tr><th>Class</th><th>Entries</th><th>Percentage</th></tr>
                    </thead>
                    <tbody>
        `;
        
        Object.entries(classCounts)
            .sort(([,a], [,b]) => b - a)
            .forEach(([className, count]) => {
                const percentage = ((count / totalEntries) * 100).toFixed(1);
                html += `
                    <tr>
                        <td>${className}</td>
                        <td>${count}</td>
                        <td>${percentage}%</td>
                    </tr>
                `;
            });
        
        html += '</tbody></table></div>';
    }
    
    html += `
            <div class="report-actions">
                <button class="btn btn-primary" onclick="printReport()">🖨️ Print Report</button>
                <button class="btn btn-success" onclick="exportSummaryReport()">📤 Export Report</button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Generate placement report
function generatePlacementReport() {
    const container = document.getElementById('reportsContainer');
    
    if (Object.keys(digitalScoreData).length === 0) {
        container.innerHTML = '<p class="no-data">No digital scores entered yet. Complete digital scoring to generate placement reports.</p>';
        return;
    }
    
    let html = `
        <div class="placement-report">
            <h3>🏆 Placement Results Report</h3>
            <div class="report-date">Generated: ${new Date().toLocaleDateString()}</div>
    `;
    
    Object.entries(digitalScoreData).forEach(([sheetKey, scores]) => {
        const [date, className, roundNum] = sheetKey.split('|');
        
        html += `
            <div class="placement-section">
                <h4>${className} - Round ${roundNum}</h4>
                <p class="placement-meta">Date: ${formatDate(date)}</p>
        `;
        
        // Sort entries by score (descending)
        const sortedEntries = Object.entries(scores)
            .filter(([reg, data]) => data.score !== undefined && data.score !== '')
            .sort(([,a], [,b]) => parseFloat(b.score) - parseFloat(a.score));
        
        if (sortedEntries.length > 0) {
            html += `
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>Place</th>
                            <th>Registration</th>
                            <th>Call Name</th>
                            <th>Handler</th>
                            <th>Score</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            sortedEntries.forEach(([registration, data], index) => {
                const place = index + 1;
                const medal = place === 1 ? '🥇' : place === 2 ? '🥈' : place === 3 ? '🥉' : '';
                const entry = entryResults.find(e => e.registration === registration);
                
                html += `
                    <tr>
                        <td class="place-cell">${medal} ${place}</td>
                        <td>${registration}</td>
                        <td><strong>${entry ? entry.callName : 'Unknown'}</strong></td>
                        <td>${entry ? entry.handler : 'Unknown'}</td>
                        <td class="score-cell"><strong>${data.score}</strong></td>
                        <td class="time-cell">${data.time || 'N/A'}</td>
                    </tr>
                `;
            });
            
            html += '</tbody></table>';
        } else {
            html += '<p class="no-data">No scores recorded for this class/round.</p>';
        }
        
        html += '</div>';
    });
    
    html += `
            <div class="report-actions">
                <button class="btn btn-primary" onclick="printReport()">🖨️ Print Placements</button>
                <button class="btn btn-success" onclick="exportPlacementReport()">📤 Export Placements</button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Export all data
function exportAllData() {
    const trialData = {
        trialName: document.getElementById('trialName')?.value || 'Trial Export',
        config: trialConfig,
        entries: entryResults,
        runningOrders: runningOrders,
        digitalScoreData: digitalScoreData,
        scents: trialScents,
        summary: {
            totalEntries: entryResults.length,
            uniqueHandlers: new Set(entryResults.map(e => e.handler)).size,
            uniqueDogs: new Set(entryResults.map(e => e.registration)).size,
            classes: getUniqueClasses(trialConfig).length,
            judges: getUniqueJudges(trialConfig).length,
            days: getUniqueDays(trialConfig).length
        },
        exportDate: new Date().toISOString()
    };
    
    const filename = `complete_trial_data_${currentTrialId}.json`;
    downloadFile(JSON.stringify(trialData, null, 2), filename, 'application/json');
    showStatusMessage('Complete trial data exported successfully!', 'success');
}

// Generate full trial PDF
function generateFullTrialPDF() {
    const printWindow = window.open('', '_blank');
    const trialName = document.getElementById('trialName')?.value || 'Complete Trial Documentation';
    
    let html = `
        <html>
            <head>
                <title>${trialName}</title>
                <link rel="stylesheet" href="css/print.css">
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
                    .document-header { text-align: center; border-bottom: 3px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
                    .section { margin-bottom: 40px; page-break-inside: avoid; }
                    .section h2 { color: #000; border-bottom: 2px solid #000; padding-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                    th { background: #f0f0f0; font-weight: bold; }
                    @page { size: letter; margin: 0.75in; }
                </style>
            </head>
            <body>
                <div class="document-header">
                    <h1>🐕 ${trialName}</h1>
                    <h2>Complete Trial Documentation</h2>
                    <p>Generated: ${new Date().toLocaleDateString()}</p>
                </div>
    `;
    
    // Add all sections
    if (trialConfig.length > 0) {
        html += generateConfigurationSection();
    }
    
    if (trialScents.some(s => s.trim())) {
        html += generateScentsSection();
    }
    
    if (entryResults.length > 0) {
        html += generateEntriesSection();
    }
    
    if (Object.keys(runningOrders).length > 0) {
        html += generateRunningOrdersSection();
    }
    
    // Add score sheets
    html += generateScoreSheetsSection();
    
    html += '</body></html>';
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
}

// Helper functions for PDF generation
function generateConfigurationSection() {
    let html = `
        <div class="section">
            <h2>📋 Trial Configuration</h2>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Location</th>
                        <th>Class</th>
                        <th>Judge</th>
                        <th>Round</th>
                        <th>Max Entries</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    trialConfig.forEach(config => {
        html += `
            <tr>
                <td>${formatDate(config.date)}</td>
                <td>${config.location}</td>
                <td>${config.className}</td>
                <td>${config.judge}</td>
                <td>${config.roundNum}</td>
                <td>${config.maxEntries}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    return html;
}

function generateScentsSection() {
    return `
        <div class="section">
            <h2>🌸 Trial Scents</h2>
            <table>
                <thead>
                    <tr>
                        <th>Scent 1</th>
                        <th>Scent 2</th>
                        <th>Scent 3</th>
                        <th>Scent 4</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${trialScents[0] || 'TBD'}</td>
                        <td>${trialScents[1] || 'TBD'}</td>
                        <td>${trialScents[2] || 'TBD'}</td>
                        <td>${trialScents[3] || 'TBD'}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

function generateEntriesSection() {
    let html = `
        <div class="section">
            <h2>📝 Trial Entries (${entryResults.length} total)</h2>
            <table>
                <thead>
                    <tr>
                        <th>Registration</th>
                        <th>Call Name</th>
                        <th>Handler</th>
                        <th>Class</th>
                        <th>Judge</th>
                        <th>Date</th>
                        <th>Round</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    entryResults.forEach(entry => {
        html += `
            <tr>
                <td>${entry.registration}</td>
                <td><strong>${entry.callName}</strong></td>
                <td>${entry.handler}</td>
                <td>${entry.className}</td>
                <td>${entry.judge}</td>
                <td>${formatDate(entry.date)}</td>
                <td>${entry.roundNum}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    return html;
}

function generateRunningOrdersSection() {
    let html = '<div class="section"><h2>🏃 Running Orders</h2>';
    
    Object.entries(runningOrders).forEach(([key, order]) => {
        html += `
            <h3>${key}</h3>
            <table>
                <thead>
                    <tr>
                        <th>Position</th>
                        <th>Call Name</th>
                        <th>Handler</th>
                        <th>Registration</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        order.forEach((entry, index) => {
            html += `
                <tr>
                    <td><strong>${index + 1}</strong></td>
                    <td>${entry.callName}</td>
                    <td>${entry.handler}</td>
                    <td>${entry.registration}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
    });
    
    html += '</div>';
    return html;
}

function generateScoreSheetsSection() {
    let html = '<div class="section page-break"><h2>📄 Score Sheets</h2>';
    
    trialConfig.forEach(config => {
        html += generateProfessionalScoreSheet(config);
    });
    
    html += '</div>';
    return html;
}

// Export reports
function exportSummaryReport() {
    const reportData = generateSummaryReportData();
    const filename = `summary_report_${currentTrialId}.json`;
    downloadFile(JSON.stringify(reportData, null, 2), filename, 'application/json');
    showStatusMessage('Summary report exported', 'success');
}

function exportPlacementReport() {
    const reportData = generatePlacementReportData();
    const filename = `placement_report_${currentTrialId}.json`;
    downloadFile(JSON.stringify(reportData, null, 2), filename, 'application/json');
    showStatusMessage('Placement report exported', 'success');
}

function generateSummaryReportData() {
    const classCounts = {};
    entryResults.forEach(entry => {
        classCounts[entry.className] = (classCounts[entry.className] || 0) + 1;
    });
    
    return {
        trialName: document.getElementById('trialName')?.value || 'Trial Summary',
        generatedDate: new Date().toISOString(),
        statistics: {
            totalEntries: entryResults.length,
            uniqueHandlers: new Set(entryResults.map(e => e.handler)).size,
            uniqueDogs: new Set(entryResults.map(e => e.registration)).size,
            uniqueClasses: getUniqueClasses(trialConfig).length,
            uniqueJudges: getUniqueJudges(trialConfig).length,
            trialDays: getUniqueDays(trialConfig).length
        },
        entriesByClass: classCounts,
        trialConfiguration: trialConfig,
        scents: trialScents
    };
}

function generatePlacementReportData() {
    const placements = {};
    
    Object.entries(digitalScoreData).forEach(([sheetKey, scores]) => {
        const [date, className, roundNum] = sheetKey.split('|');
        
        const sortedEntries = Object.entries(scores)
            .filter(([reg, data]) => data.score !== undefined && data.score !== '')
            .sort(([,a], [,b]) => parseFloat(b.score) - parseFloat(a.score))
            .map(([registration, data], index) => {
                const entry = entryResults.find(e => e.registration === registration);
                return {
                    place: index + 1,
                    registration: registration,
                    callName: entry ? entry.callName : 'Unknown',
                    handler: entry ? entry.handler : 'Unknown',
                    score: data.score,
                    time: data.time || 'N/A',
                    notes: data.notes || ''
                };
            });
        
        placements[sheetKey] = {
            date: date,
            className: className,
            round: parseInt(roundNum),
            results: sortedEntries
        };
    });
    
    return {
        trialName: document.getElementById('trialName')?.value || 'Placement Report',
        generatedDate: new Date().toISOString(),
        placements: placements
    };
}

// Print report
function printReport() {
    const content = document.getElementById('reportsContainer').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Trial Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                    th { background: #f0f0f0; font-weight: bold; }
                    h3, h4 { color: #000; }
                    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
                    .stat-card { background: #f0f0f0; padding: 15px; border: 1px solid #000; text-align: center; }
                    .stat-number { font-size: 24px; font-weight: bold; }
                    .stat-label { font-size: 12px; }
                    .report-actions { display: none; }
                    @page { margin: 0.75in; }
                </style>
            </head>
            <body>
                <h1>🐕 Trial Report</h1>
                <p>Generated: ${new Date().toLocaleDateString()}</p>
                ${content}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}
