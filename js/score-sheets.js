// Load score sheets management
function loadScoreSheetsManagement() {
    const container = document.getElementById('scoreSheetsContainer');
    if (!container) return;
    
    if (trialConfig.length === 0) {
        container.innerHTML = '<p class="no-data">Complete trial setup first to generate score sheets.</p>';
        return;
    }
    
    const totalSheets = trialConfig.length;
    const uniqueClasses = getUniqueClasses(trialConfig).length;
    const uniqueDays = getUniqueDays(trialConfig).length;
    
    container.innerHTML = `
        <!-- Scent Configuration Section -->
        <div class="scent-section">
            <div class="scent-header">🌸 Judge Scent Configuration</div>
            <p>Configure the 4 scents that will be used for this trial and appear on score sheets:</p>
            <div class="scent-grid">
                <div class="scent-box">
                    <label>Scent 1:</label>
                    <input type="text" class="scent-input" id="scoreSheetScent1" placeholder="Enter scent 1" maxlength="20" value="${trialScents[0] || ''}" onchange="updateTrialScent(0, this.value)">
                </div>
                <div class="scent-box">
                    <label>Scent 2:</label>
                    <input type="text" class="scent-input" id="scoreSheetScent2" placeholder="Enter scent 2" maxlength="20" value="${trialScents[1] || ''}" onchange="updateTrialScent(1, this.value)">
                </div>
                <div class="scent-box">
                    <label>Scent 3:</label>
                    <input type="text" class="scent-input" id="scoreSheetScent3" placeholder="Enter scent 3" maxlength="20" value="${trialScents[2] || ''}" onchange="updateTrialScent(2, this.value)">
                </div>
                <div class="scent-box">
                    <label>Scent 4:</label>
                    <input type="text" class="scent-input" id="scoreSheetScent4" placeholder="Enter scent 4" maxlength="20" value="${trialScents[3] || ''}" onchange="updateTrialScent(3, this.value)">
                </div>
            </div>
            <div class="scent-actions">
                <button class="btn btn-success" onclick="saveTrialScents()">💾 Save Scents</button>
                <button class="btn btn-warning" onclick="clearTrialScents()">🗑️ Clear All</button>
            </div>
        </div>

        <div class="score-sheets-stats">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${totalSheets}</div>
                    <div class="stat-label">Total Sheets</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${uniqueDays}</div>
                    <div class="stat-label">Trial Days</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${uniqueClasses}</div>
                    <div class="stat-label">Unique Classes</div>
                </div>
            </div>
            <p style="text-align: center; margin-top: 20px; color: #666;">
                Professional score sheets are ready to be generated for all configured classes and rounds.
            </p>
        </div>
    `;
}

// Update trial scent
function updateTrialScent(index, value) {
    if (index >= 0 && index < 4) {
        trialScents[index] = value.trim();
        // Auto-save after short delay
        if (autoSaveEnabled) {
            debounce(() => {
                saveTrialUpdates();
                showStatusMessage('Scent updated', 'saved', 1000);
            }, 1500)();
        }
    }
}

// Save trial scents
function saveTrialScents() {
    // Get current scent values
    for (let i = 1; i <= 4; i++) {
        const scentInput = document.getElementById(`scoreSheetScent${i}`);
        if (scentInput) {
            trialScents[i - 1] = scentInput.value.trim();
        }
    }
    
    saveTrialUpdates();
    showStatusMessage('Trial scents saved successfully!', 'success');
}

// Clear trial scents
function clearTrialScents() {
    if (confirm('Are you sure you want to clear all scents?')) {
        trialScents = ['', '', '', ''];
        
        // Clear input fields
        for (let i = 1; i <= 4; i++) {
            const scentInput = document.getElementById(`scoreSheetScent${i}`);
            if (scentInput) {
                scentInput.value = '';
            }
        }
        
        saveTrialUpdates();
        showStatusMessage('All scents cleared', 'success');
    }
}

// Preview score sheets
function previewScoreSheets() {
    if (trialConfig.length === 0) {
        showStatusMessage('No trial configuration found. Please complete trial setup first.', 'warning');
        return;
    }
    
    const modal = document.getElementById('previewModal');
    const content = document.getElementById('previewContent');
    
    let html = '';
    trialConfig.forEach(config => {
        html += generateProfessionalScoreSheet(config);
    });
    
    content.innerHTML = html;
    modal.style.display = 'flex';
}

// Generate professional score sheet
function generateProfessionalScoreSheet(config) {
    const formattedDate = formatDate(config.date);
    const entries = getEntriesForSheet(config);
    
    let html = `
        <div class="professional-score-sheet">
            <div class="sheet-header">
                <h2>🐕 SCENT WORK COMPETITION SCORE SHEET</h2>
                <p>Official Trial Scoring Form</p>
            </div>
            
            <div class="trial-info">
                <div class="info-row">
                    <div class="info-item">
                        <label>DATE:</label>
                        <span>${formattedDate}</span>
                    </div>
                    <div class="info-item">
                        <label>CLASS:</label>
                        <span>${config.className}</span>
                    </div>
                    <div class="info-item">
                        <label>JUDGE:</label>
                        <span>${config.judge}</span>
                    </div>
                </div>
                <div class="info-row">
                    <div class="info-item">
                        <label>LOCATION:</label>
                        <span>${config.location}</span>
                    </div>
                    <div class="info-item">
                        <label>ROUND:</label>
                        <span>${config.roundNum}</span>
                    </div>
                </div>
            </div>
    `;
    
    // Add scent information - always show scent section on score sheets
    html += `
        <div class="scents-info">
            <h3>🌸 TRIAL SCENTS</h3>
            <div class="scents-grid">
                ${trialScents.map((scent, i) => `
                    <div class="scent-box">
                        <div class="scent-header">Scent ${i + 1}</div>
                        <div class="scent-value">${scent || '____________________'}</div>
                        <div class="scent-location">
                            <label>Located:</label>
                            <div class="location-line">____________________</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    html += `
            <table class="score-table">
                <thead>
                    <tr>
                        <th rowspan="2" class="pos-col">POS</th>
                        <th rowspan="2" class="name-col">DOG/HANDLER</th>
                        <th rowspan="2" class="reg-col">REG#</th>
                        <th colspan="4" class="scent-header">SCENT RESULTS</th>
                        <th rowspan="2" class="fault-col">FAULTS</th>
                        <th rowspan="2" class="time-col">TIME</th>
                        <th rowspan="2" class="result-col">PASS/FAIL</th>
                    </tr>
                    <tr>
                        <th class="scent-col">S1</th>
                        <th class="scent-col">S2</th>
                        <th class="scent-col">S3</th>
                        <th class="scent-col">S4</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Add entries or blank rows
    const maxRows = Math.max(15, entries.length + 5);
    for (let i = 0; i < maxRows; i++) {
        const entry = i < entries.length ? entries[i] : null;
        html += `
            <tr>
                <td class="pos-col">${i + 1}</td>
                <td class="name-col">
                    ${entry ? `<strong>${entry.callName}</strong><br/>${entry.handler}` : ''}
                </td>
                <td class="reg-col">${entry ? entry.registration : ''}</td>
                <td class="scent-col"></td>
                <td class="scent-col"></td>
                <td class="scent-col"></td>
                <td class="scent-col"></td>
                <td class="fault-col"></td>
                <td class="time-col"></td>
                <td class="result-col"></td>
            </tr>
        `;
    }
    
    html += `
                </tbody>
            </table>
            
            <div class="scoring-instructions">
                <div class="instruction-section">
                    <h4>SCORING INSTRUCTIONS:</h4>
                    <ul>
                        <li><strong>Scent Results:</strong> Mark ✓ for correct finds, ✗ for missed/incorrect</li>
                        <li><strong>Time:</strong> Record in MM:SS format (e.g., 2:30)</li>
                        <li><strong>Pass/Fail:</strong> Must find at least one correct scent with no DQ faults</li>
                        <li><strong>Faults:</strong> Record specific faults (e.g., DF=Dropped Food, IH=Incorrect Handler)</li>
                    </ul>
                </div>
                
                <div class="fault-codes">
                    <h4>FAULT CODES:</h4>
                    <div class="fault-grid">
                        <span>DF - Dropped Food</span>
                        <span>SW - Dog Stops Working</span>
                        <span>HG - Handler Guiding</span>
                        <span>IF - Incorrect Find</span>
                        <span>DB - Destructive Behavior</span>
                        <span>DA - Disturbing Area</span>
                    </div>
                </div>
            </div>
            
            <div class="signatures">
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <label>JUDGE SIGNATURE & DATE</label>
                </div>
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <label>STEWARD SIGNATURE & DATE</label>
                </div>
            </div>
        </div>
    `;
    
    return html;
}

// Get entries for specific sheet
function getEntriesForSheet(config) {
    return entryResults.filter(entry => 
        entry.date === config.date && 
        entry.className === config.className && 
        entry.roundNum === config.roundNum
    );
}

// Print score sheets
function printScoreSheets() {
    previewScoreSheets();
}

// Print from preview
function printFromPreview() {
    const printContent = document.getElementById('previewContent').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Score Sheets</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
                    .professional-score-sheet { 
                        margin: 0; 
                        padding: 20px; 
                        page-break-after: always; 
                        border: 2px solid #000;
                        width: 8.5in;
                        min-height: 11in;
                        box-sizing: border-box;
                    }
                    .sheet-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                    .sheet-header h2 { font-size: 24px; margin-bottom: 5px; font-weight: bold; }
                    .sheet-header p { font-size: 14px; color: #666; margin: 0; }
                    .trial-info { margin-bottom: 20px; }
                    .info-row { display: flex; gap: 20px; margin-bottom: 10px; }
                    .info-item { flex: 1; display: flex; align-items: center; gap: 8px; }
                    .info-item label { font-weight: bold; margin-right: 10px; font-size: 12px; }
                    .info-item span { border-bottom: 1px solid #000; min-width: 100px; padding: 2px 5px; }
                    .scents-info { margin: 15px 0; padding: 15px; background: #f8f9fa; border: 1px solid #000; }
                    .scents-info h3 { text-align: center; margin-bottom: 15px; font-size: 16px; font-weight: bold; }
                    .scents-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
                    .scent-box { text-align: center; padding: 10px; background: white; border: 1px solid #ccc; }
                    .scent-header { font-weight: bold; font-size: 14px; margin-bottom: 8px; }
                    .scent-value { font-size: 12px; min-height: 20px; border-bottom: 1px solid #000; margin-bottom: 8px; padding: 2px; }
                    .scent-location label { font-size: 10px; }
                    .location-line { border-bottom: 1px solid #000; height: 16px; }
                    .score-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 10px; }
                    .score-table th, .score-table td { 
                        border: 1px solid #000; 
                        padding: 6px 4px; 
                        text-align: center;
                        vertical-align: middle;
                    }
                    .score-table th { background: #000; color: white; font-weight: bold; }
                    .pos-col { width: 40px; }
                    .name-col { width: 120px; text-align: left; }
                    .reg-col { width: 80px; }
                    .scent-col { width: 30px; }
                    .fault-col { width: 60px; }
                    .time-col { width: 60px; }
                    .result-col { width: 60px; }
                    .scent-header { text-align: center; font-weight: bold; }
                    .scoring-instructions { margin: 20px 0; padding: 15px; background: #f0f0f0; border: 1px solid #000; }
                    .scoring-instructions h4 { margin-bottom: 10px; font-size: 12px; }
                    .scoring-instructions ul { margin: 0; padding-left: 20px; }
                    .scoring-instructions li { margin-bottom: 5px; font-size: 10px; }
                    .fault-codes { margin-top: 15px; }
                    .fault-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; font-size: 9px; }
                    .signatures { display: flex; justify-content: space-around; margin: 20px 0; }
                    .signature-box { text-align: center; }
                    .signature-line { border-bottom: 2px solid #000; width: 200px; height: 30px; margin-bottom: 5px; }
                    .signature-box label { font-size: 11px; font-weight: bold; }
                    @page { size: letter; margin: 0.5in; }
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

// Generate PDF score sheets
function generatePDFScoreSheets() {
    showStatusMessage('PDF generation requires additional library. Using enhanced print function.', 'info');
    printScoreSheets();
}

// Close preview
function closePreview() {
    document.getElementById('previewModal').style.display = 'none';
}

// Open digital entry from preview
function openDigitalEntryFromPreview() {
    closePreview();
    showTab('score-entry', document.querySelectorAll('.nav-tab')[6]);
}
