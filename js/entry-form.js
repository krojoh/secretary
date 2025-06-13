// Update trial options for entry form
function updateTrialOptions() {
    const optionsDiv = document.getElementById('trialOptions');
    if (!optionsDiv) return;
    
    if (trialConfig.length === 0) {
        optionsDiv.innerHTML = '<p class="no-data">Please complete trial setup first.</p>';
        return;
    }
    
    let html = `
        <div class="entry-form-section">
            <div class="entry-form-header">
                <h3>📝 Dog Entry Form</h3>
                <p>Select class and enter dog information below</p>
            </div>
            
            <form id="dogEntryForm" onsubmit="submitEntry(event)">
                <div class="entry-form-grid">
                    <div class="entry-field">
                        <label>Registration Number <span class="required">*</span></label>
                        <input type="text" id="entryRegNumber" list="regNumberList" placeholder="Type or select registration" required onchange="populateFromRegistration()">
                        <datalist id="regNumberList">
                            ${dogData.map(dog => `<option value="${dog.registrationNumber}">${dog.registrationNumber} - ${dog.callName}</option>`).join('')}
                        </datalist>
                    </div>
                    
                    <div class="entry-field">
                        <label>Call Name <span class="required">*</span></label>
                        <input type="text" id="entryCallName" placeholder="Dog's call name" required>
                    </div>
                    
                    <div class="entry-field">
                        <label>Registered Name</label>
                        <input type="text" id="entryRegisteredName" placeholder="Full registered name">
                    </div>
                    
                    <div class="entry-field">
                        <label>Handler Name <span class="required">*</span></label>
                        <input type="text" id="entryHandler" placeholder="Handler's name" required>
                    </div>
                    
                    <div class="entry-field">
                        <label>Class <span class="required">*</span></label>
                        <select id="entryClass" required onchange="updateRoundsAndJudge()">
                            <option value="">Select a class</option>
                            ${getUniqueClasses(trialConfig).map(className => 
                                `<option value="${className}">${className}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="entry-field">
                        <label>Judge <span class="required">*</span></label>
                        <select id="entryJudge" required>
                            <option value="">Select a judge</option>
                        </select>
                    </div>
                    
                    <div class="entry-field">
                        <label>Date <span class="required">*</span></label>
                        <select id="entryDate" required>
                            <option value="">Select a date</option>
                        </select>
                    </div>
                    
                    <div class="entry-field">
                        <label>Round <span class="required">*</span></label>
                        <select id="entryRound" required>
                            <option value="">Select a round</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-success">✅ Submit Entry</button>
                    <button type="button" class="btn btn-warning" onclick="clearEntryForm()">🗑️ Clear Form</button>
                </div>
            </form>
        </div>
    `;
    
    optionsDiv.innerHTML = html;
}

// Populate form from registration number
function populateFromRegistration() {
    const regNumber = document.getElementById('entryRegNumber').value.trim();
    const dog = dogData.find(d => d.registrationNumber === regNumber);
    
    const callNameInput = document.getElementById('entryCallName');
    const registeredNameInput = document.getElementById('entryRegisteredName');
    const handlerInput = document.getElementById('entryHandler');
    
    if (dog) {
        callNameInput.value = dog.callName;
        registeredNameInput.value = dog.registeredName;
        handlerInput.value = dog.handlerFull;
        
        // Add visual feedback
        [callNameInput, registeredNameInput, handlerInput].forEach(input => {
            input.classList.add('auto-populated');
            setTimeout(() => input.classList.remove('auto-populated'), 2000);
        });
        
        showStatusMessage('Dog information auto-populated', 'success', 1500);
    } else {
        callNameInput.value = '';
        registeredNameInput.value = '';
        handlerInput.value = '';
    }
}

// Update rounds and judge based on class selection
function updateRoundsAndJudge() {
    const selectedClass = document.getElementById('entryClass').value;
    const judgeSelect = document.getElementById('entryJudge');
    const dateSelect = document.getElementById('entryDate');
    const roundSelect = document.getElementById('entryRound');
    
    // Clear dependent dropdowns
    judgeSelect.innerHTML = '<option value="">Select a judge</option>';
    dateSelect.innerHTML = '<option value="">Select a date</option>';
    roundSelect.innerHTML = '<option value="">Select a round</option>';
    
    if (!selectedClass) return;
    
    // Get configs for selected class
    const classConfigs = trialConfig.filter(c => c.className === selectedClass);
    
    // Populate judges
    const judges = [...new Set(classConfigs.map(c => c.judge))];
    judges.forEach(judge => {
        judgeSelect.innerHTML += `<option value="${judge}">${judge}</option>`;
    });
    
    // Populate dates
    const dates = [...new Set(classConfigs.map(c => c.date))];
    dates.forEach(date => {
        dateSelect.innerHTML += `<option value="${date}">${formatDate(date)}</option>`;
    });
    
    // Populate rounds
    const rounds = [...new Set(classConfigs.map(c => c.roundNum))];
    rounds.sort((a, b) => a - b);
    rounds.forEach(round => {
        roundSelect.innerHTML += `<option value="${round}">Round ${round}</option>`;
    });
}

// Submit entry
function submitEntry(event) {
    event.preventDefault();
    
    const entryData = {
        registration: document.getElementById('entryRegNumber').value,
        callName: document.getElementById('entryCallName').value,
        registeredName: document.getElementById('entryRegisteredName').value,
        handler: document.getElementById('entryHandler').value,
        className: document.getElementById('entryClass').value,
        judge: document.getElementById('entryJudge').value,
        date: document.getElementById('entryDate').value,
        roundNum: parseInt(document.getElementById('entryRound').value),
        entryId: generateId(),
        timestamp: new Date().toISOString()
    };
    
    // Validate entry
    if (!validateEntry(entryData)) {
        return;
    }
    
    // Check for duplicates
    const isDuplicate = entryResults.some(entry => 
        entry.registration === entryData.registration && 
        entry.className === entryData.className && 
        entry.date === entryData.date && 
        entry.roundNum === entryData.roundNum
    );
    
    if (isDuplicate) {
        showStatusMessage('This dog is already entered in this class/round', 'error');
        return;
    }
    
    // Add entry
    entryResults.push(entryData);
    
    // Save updates
    saveTrialUpdates();
    
    showStatusMessage('Entry submitted successfully!', 'success');
    clearEntryForm();
    
