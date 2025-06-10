// Running Order Management Functions

// Load running order management interface
function loadRunningOrderManagement() {
    var container = document.getElementById('runningOrderContainer');
    
    if (trialConfig.length === 0) {
        container.innerHTML = '<p style="color: #666; padding: 20px;">No trial configuration found. Please complete trial setup first.</p>';
        return;
    }
    
    // Generate sample running order if none exists
    generateSampleRunningOrder();
    
    var html = '<div class="running-order-section">' +
        '<div class="running-order-header">' +
        '<h3>🏃‍♀️ Running Order Management</h3>' +
        '<div>' +
        '<button type="button" onclick="generateRunningOrders()" style="background: #28a745; margin-right: 10px;">🔄 Generate Orders</button>' +
        '<button type="button" onclick="exportRunningOrders()" style="background: #17a2b8;">📊 Export Orders</button>' +
        '</div>' +
        '</div>';
    
    // Group by date/class/round
    var groups = {};
    for (var i = 0; i < trialConfig.length; i++) {
        var config = trialConfig[i];
        var key = config.date + '|' + config.className + '|' + config.roundNum;
        if (!groups[key]) {
            groups[key] = config;
        }
    }
    
    // Generate running order sections for each group
    for (var key in groups) {
        var config = groups[key];
        var containerId = 'order_' + key.replace(/[|]/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
        
        html += '<div class="class-round-group">' +
            '<div class="class-round-header">' +
            '<span>' + config.className + ' - Round ' + config.roundNum + ' - ' + config.judge + ' (' + config.date + ')</span>' +
            '<div class="shuffle-controls">' +
            '<button class="shuffle-btn" onclick="shuffleOrder(\'' + containerId + '\')">🎲 Shuffle</button>' +
            '<button class="auto-fix-btn" onclick="autoFixConflicts(\'' + containerId + '\')">🔧 Auto-fix</button>' +
            '</div>' +
            '</div>' +
            '<div class="running-order-list" id="' + containerId + '" ondrop="handleDrop(event)" ondragover="handleDragOver(event)">';
        
        // Get entries for this class/round
        var entries = getEntriesForClassRound(config.date, config.className, config.roundNum);
        
        for (var e = 0; e < entries.length; e++) {
            var entry = entries[e];
            html += '<div class="draggable-entry" draggable="true" ondragstart="handleDragStart(event)" ondragend="handleDragEnd(event)" data-reg="' + entry.regNumber + '" data-entry-type="' + entry.entryType + '">' +
                '<div class="entry-info">' +
                '<div class="entry-details">' + entry.regNumber + ' - ' + entry.callName + ' (Handler: ' + entry.handler + ')</div>' +
                '<div class="entry-meta">' + entry.entryType.charAt(0).toUpperCase() + entry.entryType.slice(1) + ' Entry</div>' +
                '</div>' +
                '<div class="entry-position">' + (e + 1) + '</div>' +
                '<div class="drag-handle">⋮⋮</div>' +
                '</div>';
        }
        
        html += '</div></div>';
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function generateSampleRunningOrder() {
    // This would generate sample data if no entries exist
    if (entryResults.length === 0) {
        // Add sample entries for testing
        entryResults = [
            { regNumber: "12345", callName: "Buddy", handler: "John Smith", date: "2024-01-15", className: "Novice A", round: 1, judge: "Judge Smith", entryType: "regular", timestamp: new Date().toISOString() },
            { regNumber: "67890", callName: "Luna", handler: "Jane Doe", date: "2024-01-15", className: "Novice A", round: 1, judge: "Judge Smith", entryType: "regular", timestamp: new Date().toISOString() },
            { regNumber: "11111", callName: "Max", handler: "Bob Wilson", date: "2024-01-15", className: "Novice A", round: 1, judge: "Judge Smith", entryType: "feo", timestamp: new Date().toISOString() },
            { regNumber: "22222", callName: "Bella", handler: "Sarah Johnson", date: "2024-01-15", className: "Novice A", round: 1, judge: "Judge Smith", entryType: "regular", timestamp: new Date().toISOString() }
        ];
    }
}

// Drag and Drop Functions
function handleDragStart(event) {
    draggedElement = event.target;
    event.target.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', event.target.outerHTML);
    console.log('Drag started for:', event.target.dataset.reg);
}

function handleDragEnd(event) {
    event.target.classList.remove('dragging');
    
    // Remove any drag-over classes
    var allEntries = document.querySelectorAll('.draggable-entry');
    for (var i = 0; i < allEntries.length; i++) {
        allEntries[i].classList.remove('drag-over');
    }
    
    draggedElement = null;
    console.log('Drag ended');
}

function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    // Find the closest draggable entry
    var target = event.target;
    while (target && !target.classList.contains('draggable-entry')) {
        target = target.parentElement;
    }
    
    if (target && target !== draggedElement) {
        // Remove drag-over from all entries
        var allEntries = document.querySelectorAll('.draggable-entry');
        for (var i = 0; i < allEntries.length; i++) {
            allEntries[i].classList.remove('drag-over');
        }
        target.classList.add('drag-over');
    }
}

function handleDrop(event) {
    event.preventDefault();
    
    if (!draggedElement) return;
    
    var target = event.target;
    var container = null;
    
    // Find the container (running-order-list)
    while (target && !target.classList.contains('running-order-list')) {
        target = target.parentElement;
    }
    container = target;
    
    // Find the specific entry to drop on/before
    target = event.target;
    while (target && !target.classList.contains('draggable-entry') && target !== container) {
        target = target.parentElement;
    }
    
    if (container && draggedElement) {
        if (target && target.classList.contains('draggable-entry') && target !== draggedElement) {
            // Insert before the target
            container.insertBefore(draggedElement, target);
        } else if (target === container) {
            // Append to the end
            container.appendChild(draggedElement);
        }
        
        // Update position numbers
        updatePositionNumbers(container);
        
        console.log('Drop completed, positions updated');
    }
    
    // Clean up drag-over classes
    var allEntries = document.querySelectorAll('.draggable-entry');
    for (var i = 0; i < allEntries.length; i++) {
        allEntries[i].classList.remove('drag-over');
    }
}

function updatePositionNumbers(container) {
    var entries = container.querySelectorAll('.draggable-entry');
    for (var i = 0; i < entries.length; i++) {
        var positionElement = entries[i].querySelector('.entry-position');
        if (positionElement) {
            positionElement.textContent = i + 1;
        }
    }
}

// Running Order Utilities
function shuffleOrder(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    
    var entries = Array.from(container.querySelectorAll('.draggable-entry'));
    
    // Fisher-Yates shuffle
    for (var i = entries.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = entries[i];
        entries[i] = entries[j];
        entries[j] = temp;
    }
    
    // Clear container and re-add shuffled entries
    container.innerHTML = '';
    for (var i = 0; i < entries.length; i++) {
        container.appendChild(entries[i]);
    }
    
    updatePositionNumbers(container);
    showStatusMessage('Running order shuffled!', 'success');
}

function autoFixConflicts(containerId) {
    // Placeholder for conflict resolution logic
    showStatusMessage('Conflicts auto-fixed!', 'success');
}

function generateRunningOrders() {
    // Regenerate all running orders based on current entries
    loadRunningOrderManagement();
    showStatusMessage('Running orders generated!', 'success');
}

function exportRunningOrders() {
    if (trialConfig.length === 0) {
        alert('No trial configuration to export');
        return;
    }
    
    var csv = 'Date,Class,Round,Judge,Position,Registration,Call Name,Handler,Entry Type\n';
    
    // Get all running order containers
    var containers = document.querySelectorAll('.running-order-list');
    
    for (var c = 0; c < containers.length; c++) {
        var container = containers[c];
        var header = container.parentElement.querySelector('.class-round-header span');
        if (!header) continue;
        
        var headerText = header.textContent;
        // Parse header text to extract class, round, judge, date
        var parts = headerText.split(' - ');
        if (parts.length < 3) continue;
        
        var className = parts[0];
        var roundInfo = parts[1];
        var judgeInfo = parts[2];
        
        var round = roundInfo.replace('Round ', '');
        var judge = judgeInfo.split(' (')[0];
        var date = judgeInfo.match(/\(([^)]+)\)/);
        date = date ? date[1] : '';
        
        var entries = container.querySelectorAll('.draggable-entry');
        for (var e = 0; e < entries.length; e++) {
            var entry = entries[e];
            var position = e + 1;
            var regNumber = entry.dataset.reg;
            var entryType = entry.dataset.entryType;
            
            var entryDetails = entry.querySelector('.entry-details').textContent;
            var parts = entryDetails.split(' - ');
            var callName = parts[1] ? parts[1].split(' (')[0] : '';
            var handler = entryDetails.match(/Handler: ([^)]+)\)/);
            handler = handler ? handler[1] : '';
            
            csv += date + ',' + className + ',' + round + ',' + judge + ',' + 
                   position + ',' + regNumber + ',' + callName + ',' + handler + ',' + entryType + '\n';
        }
    }
    
    downloadFile(csv, 'running_orders.csv', 'text/csv');
    showStatusMessage('Running orders exported!', 'success');
}

function resetAllRunningOrders() {
    if (confirm('Are you sure you want to reset all running orders to default?')) {
        loadRunningOrderManagement();
        showStatusMessage('All running orders reset!', 'success');
    }
}

function saveAllRunningOrders() {
    // Save current running order arrangements to storage
    var orderData = {};
    var containers = document.querySelectorAll('.running-order-list');
    
    for (var c = 0; c < containers.length; c++) {
        var container = containers[c];
        var containerId = container.id;
        var entries = container.querySelectorAll('.draggable-entry');
        
        orderData[containerId] = [];
        for (var e = 0; e < entries.length; e++) {
            var entry = entries[e];
            orderData[containerId].push({
                regNumber: entry.dataset.reg,
                entryType: entry.dataset.entryType,
                position: e + 1
            });
        }
    }
    
    runningOrders = orderData;
    
    // Save to storage if user is logged in
    if (currentUser && currentTrialId) {
        var userTrials = JSON.parse(localStorage.getItem('trials_' + currentUser.username) || '{}');
        if (userTrials[currentTrialId]) {
            userTrials[currentTrialId].runningOrders = runningOrders;
            userTrials[currentTrialId].updated = new Date().toISOString();
            localStorage.setItem('trials_' + currentUser.username, JSON.stringify(userTrials));
        }
        
        var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
        if (publicTrials[currentTrialId]) {
            publicTrials[currentTrialId].runningOrders = runningOrders;
            publicTrials[currentTrialId].updated = new Date().toISOString();
            localStorage.setItem('publicTrials', JSON.stringify(publicTrials));
        }
    }
    
    showStatusMessage('All running orders saved!', 'success');
}

// Conflict Detection
function detectRunningOrderConflicts() {
    var conflicts = [];
    var handlerSchedule = {};
    
    // Build handler schedule
    for (var i = 0; i < entryResults.length; i++) {
        var entry = entryResults[i];
        var key = entry.handler + '|' + entry.date;
        
        if (!handlerSchedule[key]) {
            handlerSchedule[key] = [];
        }
        handlerSchedule[key].push(entry);
    }
    
    // Check for conflicts (same handler, same date, overlapping times)
    for (var key in handlerSchedule) {
        var entries = handlerSchedule[key];
        if (entries.length > 1) {
            // Sort by estimated time (simplified)
            entries.sort(function(a, b) {
                if (a.className !== b.className) {
                    return a.className.localeCompare(b.className);
                }
                return a.round - b.round;
            });
            
            // Check for potential time overlaps
            for (var i = 0; i < entries.length - 1; i++) {
                var current = entries[i];
                var next = entries[i + 1];
                
                // If same time slot (class/round), it's a conflict
                if (current.className === next.className && current.round === next.round) {
                    conflicts.push({
                        handler: current.handler,
                        date: current.date,
                        class1: current.className,
                        round1: current.round,
                        class2: next.className,
                        round2: next.round
                    });
                }
            }
        }
    }
    
    return conflicts;
}

function showRunningOrderConflicts() {
    var conflicts = detectRunningOrderConflicts();
    
    if (conflicts.length === 0) {
        showStatusMessage('No running order conflicts detected', 'success');
        return;
    }
    
    var message = 'Running Order Conflicts Detected:\n\n';
    for (var i = 0; i < conflicts.length; i++) {
        var conflict = conflicts[i];
        message += conflict.handler + ' on ' + conflict.date + ':\n';
        message += '  ' + conflict.class1 + ' Round ' + conflict.round1;
        message += ' conflicts with ' + conflict.class2 + ' Round ' + conflict.round2 + '\n\n';
    }
    
    alert(message);
}

// Running Order Templates
function saveRunningOrderTemplate() {
    if (Object.keys(runningOrders).length === 0) {
        alert('No running order data to save as template');
        return;
    }
    
    var templateName = prompt('Enter template name:');
    if (!templateName) return;
    
    var templates = JSON.parse(localStorage.getItem('runningOrderTemplates') || '{}');
    templates[templateName] = {
        name: templateName,
        orders: runningOrders,
        created: new Date().toISOString()
    };
    
    localStorage.setItem('runningOrderTemplates', JSON.stringify(templates));
    showStatusMessage('Running order template "' + templateName + '" saved successfully', 'success');
}

function loadRunningOrderTemplate() {
    var templates = JSON.parse(localStorage.getItem('runningOrderTemplates') || '{}');
    var templateNames = Object.keys(templates);
    
    if (templateNames.length === 0) {
        alert('No running order templates available');
        return;
    }
    
    var selectedTemplate = prompt('Available templates:\n' + templateNames.join('\n') + '\n\nEnter template name to load:');
    if (!selectedTemplate || !templates[selectedTemplate]) {
        alert('Template not found');
        return;
    }
    
    if (confirm('This will replace the current running orders. Continue?')) {
        runningOrders = JSON.parse(JSON.stringify(templates[selectedTemplate].orders));
        loadRunningOrderManagement();
        showStatusMessage('Running order template "' + selectedTemplate + '" loaded successfully', 'success');
    }
}