// Waiver management system
const WaiverSystem = {
    waivers: {},
    
    // Initialize waiver system
    init: function() {
        this.loadWaivers();
    },
    
    // Load waivers from localStorage
    loadWaivers: function() {
        this.waivers = JSON.parse(localStorage.getItem('trialWaivers') || '{}');
    },
    
    // Save waivers to localStorage
    saveWaivers: function() {
        localStorage.setItem('trialWaivers', JSON.stringify(this.waivers));
    },
    
    // Create digital waiver
    createWaiver: function(trialId, waiverData) {
        const waiverId = generateId();
        this.waivers[waiverId] = {
            id: waiverId,
            trialId: trialId,
            participantName: waiverData.participantName,
            email: waiverData.email,
            phone: waiverData.phone,
            emergencyContact: waiverData.emergencyContact,
            emergencyPhone: waiverData.emergencyPhone,
            signature: waiverData.signature,
            agreedToTerms: waiverData.agreedToTerms,
            timestamp: new Date().toISOString(),
            ipAddress: 'localhost' // In real app, would capture actual IP
        };
        
        this.saveWaivers();
        return waiverId;
    },
    
    // Get waiver by ID
    getWaiver: function(waiverId) {
        return this.waivers[waiverId] || null;
    },
    
    // Get all waivers for a trial
    getTrialWaivers: function(trialId) {
        return Object.values(this.waivers).filter(waiver => waiver.trialId === trialId);
    },
    
    // Generate waiver form HTML
    generateWaiverForm: function(trialId) {
        return `
            <div class="waiver-form">
                <h2>Liability Waiver and Release Form</h2>
                <p><strong>Trial ID:</strong> ${trialId}</p>
                
                <form id="waiverForm" onsubmit="WaiverSystem.submitWaiver(event, '${trialId}')">
                    <div class="waiver-section">
                        <h3>Participant Information</h3>
                        <div class="form-group">
                            <label>Full Name <span class="required">*</span></label>
                            <input type="text" name="participantName" required>
                        </div>
                        <div class="form-group">
                            <label>Email Address <span class="required">*</span></label>
                            <input type="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label>Phone Number <span class="required">*</span></label>
                            <input type="tel" name="phone" required>
                        </div>
                    </div>
                    
                    <div class="waiver-section">
                        <h3>Emergency Contact</h3>
                        <div class="form-group">
                            <label>Emergency Contact Name <span class="required">*</span></label>
                            <input type="text" name="emergencyContact" required>
                        </div>
                        <div class="form-group">
                            <label>Emergency Contact Phone <span class="required">*</span></label>
                            <input type="tel" name="emergencyPhone" required>
                        </div>
                    </div>
                    
                    <div class="waiver-section">
                        <h3>Waiver Terms</h3>
                        <div class="waiver-text">
                            <p>I understand that participation in this dog trial involves inherent risks...</p>
                            <p>By signing below, I acknowledge that I have read and understood this waiver...</p>
                        </div>
                        
                        <div class="form-group">
                            <label class="custom-checkbox">
                                <input type="checkbox" name="agreedToTerms" required>
                                <span class="checkmark"></span>
                                I agree to the terms and conditions above <span class="required">*</span>
                            </label>
                        </div>
                        
                        <div class="form-group">
                            <label>Digital Signature <span class="required">*</span></label>
                            <input type="text" name="signature" placeholder="Type your full name as signature" required>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-success">Submit Waiver</button>
                        <button type="button" class="btn btn-secondary" onclick="WaiverSystem.clearForm()">Clear Form</button>
                    </div>
                </form>
            </div>
        `;
    },
    
    // Submit waiver
    submitWaiver: function(event, trialId) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const waiverData = {
            participantName: formData.get('participantName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            emergencyContact: formData.get('emergencyContact'),
            emergencyPhone: formData.get('emergencyPhone'),
            signature: formData.get('signature'),
            agreedToTerms: formData.get('agreedToTerms') === 'on'
        };
        
        // Validate signature matches name
        if (waiverData.signature.toLowerCase() !== waiverData.participantName.toLowerCase()) {
            showStatusMessage('Digital signature must match your full name exactly', 'error');
            return;
        }
        
        const waiverId = this.createWaiver(trialId, waiverData);
        showStatusMessage('Waiver submitted successfully!', 'success');
        
        // Clear form
        event.target.reset();
        
        return waiverId;
    },
    
    // Clear waiver form
    clearForm: function() {
        const form = document.getElementById('waiverForm');
        if (form) {
            form.reset();
        }
    },
    
    // Export waivers for a trial
    exportTrialWaivers: function(trialId) {
        const waivers = this.getTrialWaivers(trialId);
        if (waivers.length === 0) {
            showStatusMessage('No waivers found for this trial', 'warning');
            return;
        }
        
        const exportData = {
            trialId: trialId,
            exportDate: new Date().toISOString(),
            waiverCount: waivers.length,
            waivers: waivers
        };
        
        const filename = `waivers_${trialId}.json`;
        downloadFile(JSON.stringify(exportData, null, 2), filename, 'application/json');
        showStatusMessage(`Exported ${waivers.length} waivers`, 'success');
    },
    
    // Generate waiver summary
    generateWaiverSummary: function(trialId) {
        const waivers = this.getTrialWaivers(trialId);
        
        let html = `
            <div class="waiver-summary">
                <h3>📋 Waiver Summary</h3>
                <p>Total Waivers: <strong>${waivers.length}</strong></p>
                
                <div class="waiver-actions">
                    <button class="btn btn-primary" onclick="WaiverSystem.exportTrialWaivers('${trialId}')">📤 Export Waivers</button>
                </div>
        `;
        
        if (waivers.length > 0) {
            html += `
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>Participant</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Submitted</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            waivers.forEach(waiver => {
                html += `
                    <tr>
                        <td><strong>${waiver.participantName}</strong></td>
                        <td>${waiver.email}</td>
                        <td>${waiver.phone}</td>
                        <td>${formatDate(waiver.timestamp)}</td>
                        <td>
                            <button class="btn btn-info btn-sm" onclick="WaiverSystem.viewWaiver('${waiver.id}')">👁️ View</button>
                        </td>
                    </tr>
                `;
            });
            
            html += '</tbody></table>';
        }
        
        html += '</div>';
        return html;
    },
    
    // View individual waiver
    viewWaiver: function(waiverId) {
        const waiver = this.getWaiver(waiverId);
        if (!waiver) {
            showStatusMessage('Waiver not found', 'error');
            return;
        }
        
        const details = `
Participant: ${waiver.participantName}
Email: ${waiver.email}
Phone: ${waiver.phone}
Emergency Contact: ${waiver.emergencyContact}
Emergency Phone: ${waiver.emergencyPhone}
Digital Signature: ${waiver.signature}
Agreed to Terms: ${waiver.agreedToTerms ? 'Yes' : 'No'}
Submitted: ${formatDate(waiver.timestamp)}
IP Address: ${waiver.ipAddress}
        `;
        
        alert(details);
    }
};

// Initialize waiver system
WaiverSystem.init();

// Add waiver functionality to existing trial system
function addWaiverToTrial(trialId) {
    const waiverHtml = WaiverSystem.generateWaiverForm(trialId);
    // This would be integrated into the trial entry form
    return waiverHtml;
}

function getTrialWaiverSummary(trialId) {
    return WaiverSystem.generateWaiverSummary(trialId);
}
