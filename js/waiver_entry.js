// Waiver Entry Form JavaScript
// Integrates with existing dog trial management system

// Global state management
let currentStep = 'waiver';
let waiverAccepted = false;
let entryData = {};
let waiverConfig = {};

// Initialize the waiver system
document.addEventListener('DOMContentLoaded', function() {
    loadWaiverConfiguration();
    initializeFormHandlers();
    loadTrialData();
});

// Load waiver configuration (integrates with existing trial setup)
function loadWaiverConfiguration() {
    // Try to load from existing trial configuration first
    const urlParams = new URLSearchParams(window.location.search);
    const trialId = urlParams.get('trial');
    
    if (trialId && typeof loadTrialDataFromStorage !== 'undefined') {
        // Integration with existing trial system
        try {
            const savedTrials = loadTrialDataFromStorage();
            if (savedTrials && savedTrials[trialId]) {
                waiverConfig = createWaiverConfigFromTrial(savedTrials[trialId]);
            } else {
                loadDefaultWaiverConfig();
            }
        } catch (error) {
            console.log('No existing trial data found, using defaults');
            loadDefaultWaiverConfig();
        }
    } else {
        loadDefaultWaiverConfig();
    }
    
    updateWaiverDisplay();
}

// Create waiver config from existing trial data
function createWaiverConfigFromTrial(trialData) {
    return {
        clubName: trialData.clubName || 'Dog Trial Club',
        trialName: trialData.trialName || 'Dog Trial',
        trialDate: trialData.date || new Date().toISOString().split('T')[0],
        location: trialData.location || 'Training Center',
        customClauses: [
            'I understand that dog training and competition activities involve inherent risks.',
            'I acknowledge that my dog is current on all required vaccinations.',
            'I agree to clean up after my dog and maintain control at all times.',
            'I understand that entry fees are non-refundable except in case of trial cancellation.'
        ],
        requiresVetCertificate: trialData.requiresVetCertificate !== false,
        requiresInsurance: trialData.requiresInsurance || false,
        additionalRequirements: trialData.additionalRequirements || 'All dogs must be at least 6 months old.',
        contactEmail: trialData.contactEmail || 'secretary@dogtrial.com',
        contactPhone: trialData.contactPhone || '(555) 123-4567'
    };
}

// Load default waiver configuration
function loadDefaultWaiverConfig() {
    waiverConfig = {
        clubName: 'Prairie Dog Obedience Club',
        trialName: 'Summer Championship Trial',
        trialDate: '2025-07-15',
        location: 'Spruce Grove Community Center',
        customClauses: [
            'I understand that dog training and competition activities involve inherent risks.',
            'I acknowledge that my dog is current on all required vaccinations.',
            'I agree to clean up after my dog and maintain control at all times.',
            'I understand that entry fees are non-refundable except in case of trial cancellation.'
        ],
        requiresVetCertificate: true,
        requiresInsurance: false,
        additionalRequirements: 'All dogs must be at least 6 months old and spayed/neutered if over 1 year old.',
        contactEmail: 'secretary@prairiedogs.ca',
        contactPhone: '780-555-0123'
    };
}

// Update waiver display with configuration
function updateWaiverDisplay() {
    // Update header information
    document.getElementById('waiver-trial-name').textContent = waiverConfig.trialName;
    document.getElementById('waiver-trial-date').textContent = formatDate(waiverConfig.trialDate);
    document.getElementById('waiver-location').textContent = waiverConfig.location;
    document.getElementById('waiver-club').textContent = waiverConfig.clubName;
    document.getElementById('waiver-club-name').textContent = waiverConfig.clubName;
    
    // Update contact information
    document.getElementById('contact-email').textContent = waiverConfig.contactEmail;
    document.getElementById('contact-phone').textContent = waiverConfig.contactPhone;
    
    // Update custom clauses
    const clausesList = document.getElementById('custom-clauses');
    clausesList.innerHTML = '';
    waiverConfig.customClauses.forEach(clause => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="clause-bullet">•</span><span>${clause}</span>`;
        clausesList.appendChild(li);
    });
    
    // Show/hide veterinary requirements
    const vetReq = document.getElementById('vet-requirements');
    if (waiverConfig.requiresVetCertificate) {
        vetReq.style.display = 'block';
    }
    
    // Show/hide additional requirements
    const addReq = document.getElementById('additional-requirements');
    const addReqText = document.getElementById('additional-requirements-text');
    if (waiverConfig.additionalRequirements) {
        addReqText.textContent = waiverConfig.additionalRequirements;
        addReq.style.display = 'block';
    }
}

// Initialize form handlers
function initializeFormHandlers() {
    // Waiver acceptance checkbox
    const waiverCheckbox = document.getElementById('waiver-accept');
    const acceptButton = document.getElementById('accept-waiver-btn');
    
    waiverCheckbox.addEventListener('change', function() {
        waiverAccepted = this.checked;
        acceptButton.disabled = !waiverAccepted;
        if (waiverAccepted) {
            acceptButton.classList.remove('disabled');
        } else {
            acceptButton.classList.add('disabled');
        }
    });
    
    // Form validation
    const entryForm = document.getElementById('entry-form');
    if (entryForm) {
        const inputs = entryForm.querySelectorAll('input[required], select[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });
    }
}

// Load trial data from existing system
function loadTrialData() {
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedClass = urlParams.get('class');
    
    if (preselectedClass) {
        const classSelect = document.getElementById('trial-class');
        if (classSelect && classSelect.querySelector(`option[value="${preselectedClass}"]`)) {
            classSelect.value = preselectedClass;
        }
    }
}

// Step navigation
function showStep(stepName) {
    // Hide all steps
    document.querySelectorAll('.step-content').forEach(step => {
        step.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected step
    document.getElementById(stepName + '-step').classList.add('active');
    
    // Add active class to selected tab
    const tabs = document.querySelectorAll('.nav-tab');
    if (stepName === 'waiver') tabs[0].classList.add('active');
    if (stepName === 'entry') tabs[1].classList.add('active');
    if (stepName === 'confirmation') tabs[2].classList.add('active');
    
    currentStep = stepName;
}

// Accept waiver and proceed to entry form
function acceptWaiver() {
    if (!waiverAccepted) {
        alert('Please accept the waiver terms to continue.');
        return;
    }
    
    // Log waiver acceptance
    const waiverAcceptance = {
        timestamp: new Date().toISOString(),
        trialName: waiverConfig.trialName,
        clubName: waiverConfig.clubName,
        userAgent: navigator.userAgent,
        ipAddress: 'logged-by-server' // Would be logged server-side
    };
    
    // Store waiver acceptance (integrate with existing storage)
    if (typeof saveWaiverAcceptance === 'function') {
        saveWaiverAcceptance(waiverAcceptance);
    } else {
        // Fallback storage
        const acceptances = JSON.parse(localStorage.getItem('waiverAcceptances') || '[]');
        acceptances.push(waiverAcceptance);
        localStorage.setItem('waiverAcceptances', JSON.stringify(acceptances));
    }
    
    showStep('entry');
}

// Form validation
function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    clearFieldError(event);
    
    if (field.required && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }
    
    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\d\s\-\(\)\+]+$/;
        if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
            showFieldError(field, 'Please enter a valid phone number');
            return false;
        }
    }
    
    // Date validation (ensure dog is old enough)
    if (field.type === 'date' && field.id === 'birth-date' && value) {
        const birthDate = new Date(value);
        const today = new Date();
        const monthsOld = (today - birthDate) / (1000 * 60 * 60 * 24 * 30.44);
        
        if (monthsOld < 6) {
            showFieldError(field, 'Dog must be at least 6 months old');
            return false;
        }
    }
    
    return true;
}

function showFieldError(field, message) {
    clearFieldError({ target: field });
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    
    field.classList.add('error');
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(event) {
    const field = event.target;
    field.classList.remove('error');
    
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Submit entry form
function submitEntry(event) {
    event.preventDefault();
    
    // Validate all fields
    const form = event.target;
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        alert('Please correct the errors above before submitting.');
        return;
    }
    
    // Collect form data
    const formData = new FormData(form);
    entryData = {
        dogName: formData.get('dogName'),
        breed: formData.get('breed'),
        birthDate: formData.get('birthDate'),
        handlerName: formData.get('handlerName'),
        handlerEmail: formData.get('handlerEmail'),
        handlerPhone: formData.get('handlerPhone'),
        emergencyContact: formData.get('emergencyContact'),
        trialClass: formData.get('trialClass'),
        specialNeeds: formData.get('specialNeeds'),
        trialName: waiverConfig.trialName,
        trialDate: waiverConfig.trialDate,
        clubName: waiverConfig.clubName,
        timestamp: new Date().toISOString()
    };
    
    // Generate confirmation number
    const confirmationNumber = generateConfirmationNumber();
    entryData.confirmationNumber = confirmationNumber;
    
    // Save entry (integrate with existing system)
    saveEntry(entryData);
    
    // Update confirmation display
    updateConfirmationDisplay();
    
    // Show confirmation step
    showStep('confirmation');
}

// Generate unique confirmation number
function generateConfirmationNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `DOG${year}${random}`;
}

// Save entry to storage (integrates with existing system)
function saveEntry(entry) {
    try {
        // Try to use existing entry system
        if (typeof saveEntryToSystem === 'function') {
            saveEntryToSystem(entry);
        } else if (typeof entryResults !== 'undefined') {
            // Integration with existing entryResults array
            entryResults.push({
                regNumber: entry.confirmationNumber,
                callName: entry.dogName,
                handler: entry.handlerName,
                date: entry.trialDate,
                className: entry.trialClass,
                round: 1,
                judge: 'TBD',
                entryType: 'regular',
                timestamp: entry.timestamp,
                breed: entry.breed,
                email: entry.handlerEmail,
                phone: entry.handlerPhone,
                emergencyContact: entry.emergencyContact,
                specialNeeds: entry.specialNeeds
            });
            
            // Save to existing storage system
            if (typeof saveEntriesToTrial === 'function') {
                saveEntriesToTrial();
            }
        } else {
            // Fallback storage
            const entries = JSON.parse(localStorage.getItem('trialEntries') || '[]');
            entries.push(entry);
            localStorage.setItem('trialEntries', JSON.stringify(entries));
        }
        
        // Send confirmation email (would be handled server-side)
        if (typeof sendConfirmationEmail === 'function') {
            sendConfirmationEmail(entry);
        }
        
    } catch (error) {
        console.error('Error saving entry:', error);
        alert('There was an error saving your entry. Please try again.');
    }
}

// Update confirmation display
function updateConfirmationDisplay() {
    document.getElementById('confirmation-number').textContent = entryData.confirmationNumber;
    document.getElementById('confirm-email').textContent = entryData.handlerEmail;
    document.getElementById('confirm-contact-email').textContent = waiverConfig.contactEmail;
    document.getElementById('confirm-contact-phone').textContent = waiverConfig.contactPhone;
}

// Utility function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Integration helper functions for existing system
function saveWaiverAcceptance(acceptance) {
    // This function can be implemented to integrate with existing user tracking
    console.log('Waiver accepted:', acceptance);
}

function sendConfirmationEmail(entry) {
    // This function would be implemented server-side
    console.log('Sending confirmation email to:', entry.handlerEmail);
}

// Export functions for integration with existing system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadWaiverConfiguration,
        showStep,
        acceptWaiver,
        submitEntry,
        saveEntry
    };
}
