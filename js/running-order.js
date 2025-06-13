// Load running order management
function loadRunningOrderManagement() {
    const container = document.getElementById('runningOrderContainer');
    if (!container) return;
    
    if (entryResults.length === 0) {
        container.innerHTML = '<p class="no-data">No entries available. Add entries first to generate running orders.</p>';
        return;
    }
    
    if (Object.keys(runningOrders).length === 0) {
        container.innerHTML = '<p class="no-data">Click "Generate Running Order" to create running orders from your entries.</p>';
        return;
    }
    
    let html = '';
    Object.entries(runningOrders).forEach(([key, order]) => {
        html += `
            <div class="running-order-section">
                <h4>${key}</h4>
                <div class="running-order-actions">
                    <button class="btn btn-warning btn-sm" onclick="shuffleSpecificOrder('${key}')">🔀 Shuffle</button>
                    <button class="btn btn-info btn-sm" onclick="printSpecificOrder('${key}')">🖨️ Print</button>
                </div>
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>Position</th>
                            <th>Call Name</th>
                            <th>Handler</th>
                            <th>Registration</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.map((entry, index) => `
                            <tr>
                                <td><strong>${index + 1}</strong></td>
                                <td>${entry.callName}</td>
                                <td>${entry.handler}</td>
                                <td>${entry.registration}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Generate running order
function generateRunningOrder() {
    if (entryResults.length === 0) {
        showStatusMessage('No entries available. Add entries first.', 'warning');
        return;
    }
    
    // Group entries by class, date, and round
    const groupedEntries = {};
    entryResults.forEach(entry => {
        const key = `${formatDate(entry.date)} - ${entry.className} - Round ${entry.roundNum}`;
        if (!groupedEntries[key]) {
            groupedEntries[key] = [];
        }
        groupedEntries[key].push(entry);
    });
    
    // Generate running order for each group
    Object.entries(groupedEntries).forEach(([key, entries]) => {
        // Shuffle entries randomly
        const shuffled = [...entries].sort(() => Math.random() - 0.5);
        runningOrders[key] = shuffled;
    });
    
    // Save updates
    saveTrialUpdates();
    loadRunningOrderManagement();
    showStatusMessage('Running orders generated successfully!', 'success');
}

// Shuffle all running orders
function shuffleRunningOrder() {
    if (Object.keys(runningOrders).length === 0) {
        showStatusMessage('No running orders to shuffle. Generate them first.', 'warning');
        return;
    }
    
    Object.keys(runningOrders).forEach(key => {
        runningOrders[key] = [...runningOrders[key]].sort(() => Math.random() - 0.5);
    });
    
    saveTrialUpdates();
    loadRunningOrderManagement();
    showStatusMessage('All running orders shuffled!', 'success');
}

// Shuffle specific order
function shuffleSpecificOrder(key) {
    if (runningOrders[key]) {
        runningOrders[key] = [...runningOrders[key]].sort(() => Math.random() - 0.5);
        saveTrialUpdates();
        loadRunningOrderManagement();
        showStatusMessage(`${key} shuffled!`, 'success');
    }
}

// Print running order
function printRunningOrder() {
    const container = document.getElementById('runningOrderContainer');
    if (!container) return;
    
    const printContent = container.innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Running Orders</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                    th { background: #f0f0f0; font-weight: bold; }
                    h4 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px; }
                    .running-order-actions { display: none; }
                    @page { margin: 0.5in; }
                </style>
            </head>
            <body>
                <h2>🏃 Running Orders</h2>
                ${printContent}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Print specific order
function printSpecificOrder(key) {
    const order = runningOrders[key];
    if (!order) return;
    
    let html = `
        <html>
            <head>
                <title>${key} - Running Order</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #000; padding: 12px; text-align: left; }
                    th { background: #f0f0f0; font-weight: bold; }
                    h2 { color: #2c3e50; text-align: center; }
                    @page { margin: 0.75in; }
                </style>
            </head>
            <body>
                <h2>${key}</h2>
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
                <td style="text-align: center; font-weight: bold;">${index + 1}</td>
                <td style="font-weight: bold;">${entry.callName}</td>
                <td>${entry.handler}</td>
                <td>${entry.registration}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table></body></html>';
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
}
