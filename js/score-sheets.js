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
    
    // Add scent information if available
    if (trialScents.some(s => s.trim())) {
        html += `
            <div class="scents-info">
                <h3>🌸 TRIAL SCENTS</h3>
                <div class="scents-grid">
                    ${trialScents.map((scent, i) => `
                        <div class="scent-box">
                            <strong>Scent ${i + 1}:</strong> ${scent || 'TBD'}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    html += `
            <table class="score-table">
                <thead>
                    <tr>
                        <th>POS</th>
                        <th>REGISTRATION</th>
                        <th>CALL NAME</th>
                        <th>HANDLER</th>
                        <th>SCORE</th>
                        <th>TIME</th>
                        <th>PLACE</th>
                        <th>NOTES</th>
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
                <td>${entry ? entry.registration : ''}</td>
                <td class="name-col">${entry ? entry.callName : ''}</td>
                <td>${entry ? entry.handler : ''}</td>
                <td class="score-col"></td>
                <td class="time-col"></td>
                <td class="place-col"></td>
                <td class="notes-col"></td>
            </tr>
        `;
    }
    
    html += `
                </tbody>
            </table>
            
            <div class="signatures">
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <label>JUDGE SIGNATURE</label>
                </div>
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <label>STEWARD SIGNATURE</label>
                </div>
            </div>
            
            <div class="footer-notes">
                <strong>SCORING NOTES:</strong> Pass requires finding at least one correct scent with no disqualifying faults. 
                Time penalties and faults to be recorded in notes section.
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
                <link rel="stylesheet" href="css/print.css">
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
                    .professional-score-sheet { 
                        margin: 0; 
                        padding: 20px; 
                        page-break-after: always; 
                        border: 2px solid #000;
                    }
                    .sheet-header { text-align: center; margin-bottom: 20px; }
                    .sheet-header h2 { font-size: 24px; margin-bottom: 5px; }
                    .trial-info { margin-bottom: 20px; }
                    .info-row { display: flex; gap: 20px; margin-bottom: 10px; }
                    .info-item { flex: 1; }
                    .info-item label { font-weight: bold; margin-right: 10px; }
                    .score-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .score-table th, .score-table td { 
                        border: 1px solid #000; 
                        padding: 8px; 
                        text-align: left; 
                    }
                    .score-table th { background: #000; color: white; text-align: center; }
                    .pos-col { width: 50px; text-align: center; font-weight: bold; }
                    .name-col { font-weight: bold; }
                    .score-col, .time-col, .place-col { width: 80px; text-align: center; }
                    .signatures { display: flex; justify-content: space-around; margin: 20px 0; }
                    .signature-box { text-align: center; }
                    .signature-line { border-bottom: 2px solid #000; width: 200px; height: 30px; margin-bottom: 5px; }
                    .signature-box label { font-size: 12px; font-weight: bold; }
                    .footer-notes { background: #f0f0f0; padding: 10px; font-size: 11px; }
                    .scents-info { margin: 15px 0; padding: 10px; background: #f8f9fa; }
                    .scents-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
                    .scent-box { text-align: center; padding: 5px; background: white; border: 1px solid #ccc; }
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
