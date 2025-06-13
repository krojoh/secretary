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
                <div class="entry-stats">
                    <span>Available Classes: ${getUniqueClasses(trialConfig).length}</span> |
                    <span>Total Rounds: ${trialConfig.length}</span> |
                    <span>Current Entries: ${entryResults.length}</span>
                </div>
            </div>
            
            <form id="dogEntryForm" onsubmit="submitEntry(event)">
                <div class="entry-form-grid">
                    <div class="entry-field">
                        <label>Registration Number <span class="required">*</span></label>
                        <input type="text" id="entryRegNumber" list="regNumberList" placeholder="Type or select registration" required onchange="populateFromRegistration()" oninput="filterRegistrations()">
                        <datalist id="regNumberList">
                            ${dogData.map(dog => `<option value="${dog.registrationNumber}">${dog.registrationNumber} - ${dog.callName}</option>`).join('')}
                        </datalist>
                        <div id="regSuggestions" class="dropdown-suggestions"></div>
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
                        <select id="entryJudge" required onchange="updateDateOptions()">
                            <option value="">Select a judge</option>
                        </select>
                    </div>
                    
                    <div class="entry-field">
                        <label>Date <span class="required">*</span></label>
                        <select id="entryDate" required onchange="updateRoundOptions()">
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
        
        <div class="entry-preview" id="entryPreview" style="display: none;">
            <h4>Entry Preview</h4>
            <div id="previewContent"></div>
        </div>
    `;
    
    optionsDiv.innerHTML = html;
}

// Filter registrations as user types
function filterRegistrations() {
    const input = document.getElementById('entryRegNumber');
    const suggestions = document.getElementById('regSuggestions');
    
    if (!input || !suggestions) return;
    
    const value = input.value.toLowerCase();
    if (value.length < 2) {
        suggestions.innerHTML = '';
        suggestions.classList.remove('active');
        return;
    }
    
    const matches = dogData.filter(dog => 
        dog.registrationNumber.toLowerCase().includes(value) ||
        dog.callName.toLowerCase().includes(value) ||
        dog.handlerFull.toLowerCase().includes(value)
    ).slice(0, 10); // Limit to 10 suggestions
    
    if (matches.length > 0) {
        suggestions.innerHTML = matches.map(dog => `
            <div class="suggestion-item" onclick="selectRegistration('${dog.registrationNumber}')">
                <strong>${dog.registrationNumber}</strong> - ${dog.callName} (${dog.handlerFull})
            </div>
        `).join('');
        suggestions.classList.add('active');
    } else {
        suggestions.innerHTML = '<div class="suggestion-item">No matches found</div>';
        suggestions.classList.add('active');
    }
}

// Select registration from dropdown
function selectRegistration(regNumber) {
    document.getElementById('entryRegNumber').value = regNumber;
    document.getElementById('regSuggestions').classList.remove('active');
    populateFromRegistration();
}

// Hide suggestions when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.entry-field')) {
        const suggestions = document.getElementById('regSuggestions');
        if (suggestions) {
            suggestions.classList.remove('active');
        }
    }
});

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
        updateEntryPreview();
    } else {
        callNameInput.value = '';
        registeredNameInput.value = '';
        handlerInput.value = '';
        hideEntryPreview();
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
    
    if (!selectedClass) {
        updateEntryPreview();
        return;
    }
    
    // Get configs for selected class
    const classConfigs = trialConfig.filter(c => c.className === selectedClass);
    
    // Populate judges
    const judges = [...new Set(classConfigs.map(c => c.judge))];
    judges.forEach(judge => {
        judgeSelect.innerHTML += `<option value="${judge}">${judge}</option>`;
    });
    
    updateEntryPreview();
}

// Update date options based on judge selection
function updateDateOptions() {
    const selectedClass = document.getElementById('entryClass').value;
    const selectedJudge = document.getElementById('entryJudge').value;
    const dateSelect = document.getElementById('entryDate');
    const roundSelect = document.getElementById('entryRound');
    
    // Clear dependent dropdowns
    dateSelect.innerHTML = '<option value="">Select a date</option>';
    roundSelect.innerHTML = '<option value="">Select a round</option>';
    
    if (!selectedClass || !selectedJudge) {
        updateEntryPreview();
        return;
    }
    
    // Get configs for selected class and judge
    const configs = trialConfig.filter(c => 
        c.className === selectedClass && c.judge === selectedJudge
    );
    
    // Populate dates
    const dates = [...new Set(configs.map(c => c.date))];
    dates.forEach(date => {
        dateSelect.innerHTML += `<option value="${date}">${formatDate(date)}</option>`;
    });
    
    updateEntryPreview();
}

// Update round options based on date selection
function updateRoundOptions() {
    const selectedClass = document.getElementById('entryClass').value;
    const selectedJudge = document.getElementById('entryJudge').value;
    const selectedDate = document.getElementById('entryDate').value;
    const roundSelect = document.getElementById('entryRound');
    
    // Clear round dropdown
    roundSelect.innerHTML = '<option value="">Select a round</option>';
    
    if (!selectedClass || !selectedJudge || !selectedDate) {
        updateEntryPreview();
        return;
    }
    
    // Get configs for selected class, judge, and date
    const configs = trialConfig.filter(c => 
        c.className === selectedClass && 
        c.judge === selectedJudge && 
        c.date === selectedDate
    );
    
    // Populate rounds
    const rounds = configs.map(c => c.roundNum).sort((a, b) => a - b);
    rounds.forEach(round => {
        const config = configs.find(c => c.roundNum === round);
        const currentEntries = entryResults.filter(e => 
            e.className === selectedClass && 
            e.judge === selectedJudge && 
            e.date === selectedDate && 
            e.roundNum === round
        ).length;
        
        const maxEntries = config.maxEntries;
        const availableSpots = maxEntries - currentEntries;
        const spotText = availableSpots > 0 ? ` (${availableSpots} spots left)` : ' (FULL)';
        
        roundSelect.innerHTML += `<option value="${round}" ${availableSpots <= 0 ? 'disabled' : ''}>Round ${round}${spotText}</option>`;
    });
    
    updateEntryPreview();
}

// Update entry preview
function updateEntryPreview() {
    const preview = document.getElementById('entryPreview');
    const content = document.getElementById('previewContent');
    
    if (!preview || !content) return;
    
    const regNumber = document.getElementById('entryRegNumber').value;
    const callName = document.getElementById('entryCallName').value;
    const handler = document.getElementById('entryHandler').value;
    const className = document.getElementById('entryClass').value;
    const judge = document.getElementById('e
