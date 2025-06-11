import React, { useState } from 'react';
import { AlertTriangle, Check, FileText, Settings, Users, Calendar } from 'lucide-react';

const WaiverEntryForm = () => {
  const [currentStep, setCurrentStep] = useState('waiver'); // 'waiver', 'entry', 'confirmation'
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [entryData, setEntryData] = useState({
    dogName: '',
    breed: '',
    birthDate: '',
    handlerName: '',
    handlerEmail: '',
    handlerPhone: '',
    emergencyContact: '',
    trialClass: '',
    specialNeeds: ''
  });

  // Sample waiver configurations (would come from trial setup)
  const [waiverConfig] = useState({
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
  });

  const handleWaiverAccept = () => {
    if (waiverAccepted) {
      setCurrentStep('entry');
    }
  };

  const handleEntrySubmit = (e) => {
    e.preventDefault();
    // In real app, this would submit to database
    setCurrentStep('confirmation');
  };

  const handleInputChange = (field, value) => {
    setEntryData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Waiver Step
  if (currentStep === 'waiver') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg">
            <div className="bg-blue-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">{waiverConfig.trialName}</h1>
                  <p className="text-blue-100">{waiverConfig.clubName}</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">LIABILITY WAIVER AND RELEASE</h2>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Trial:</strong> {waiverConfig.trialName}</p>
                  <p><strong>Date:</strong> {new Date(waiverConfig.trialDate).toLocaleDateString()}</p>
                  <p><strong>Location:</strong> {waiverConfig.location}</p>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-800">Important Legal Document</h3>
                    <p className="text-yellow-700 text-sm mt-1">
                      Please read this waiver carefully before proceeding. By accepting, you agree to all terms and conditions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 text-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">ASSUMPTION OF RISK</h3>
                  <p className="leading-relaxed">
                    I acknowledge that participation in dog obedience trials and related activities involves inherent risks, 
                    including but not limited to: dog bites, falls, collisions, and other injuries that may result from the 
                    unpredictable behavior of dogs or other participants. I voluntarily assume all such risks.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">RELEASE AND WAIVER</h3>
                  <p className="leading-relaxed">
                    In consideration for being permitted to participate in this event, I hereby release, waive, discharge, 
                    and hold harmless {waiverConfig.clubName}, its officers, directors, members, volunteers, and the facility 
                    owners from any and all claims, demands, or causes of action arising out of or related to any loss, 
                    damage, or injury that may be sustained by myself, my dog, or any property.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">PARTICIPANT AGREEMENTS</h3>
                  <ul className="space-y-2">
                    {waiverConfig.customClauses.map((clause, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>{clause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {waiverConfig.requiresVetCertificate && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Veterinary Requirements</h4>
                    <p className="text-blue-700 text-sm">
                      All dogs must have current vaccinations and be in good health. Proof of vaccination may be required.
                    </p>
                  </div>
                )}

                {waiverConfig.additionalRequirements && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">ADDITIONAL REQUIREMENTS</h3>
                    <p className="leading-relaxed">{waiverConfig.additionalRequirements}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">CONTACT INFORMATION</h3>
                  <div className="text-sm space-y-1">
                    <p><strong>Email:</strong> {waiverConfig.contactEmail}</p>
                    <p><strong>Phone:</strong> {waiverConfig.contactPhone}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t pt-6">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="waiver-accept"
                    checked={waiverAccepted}
                    onChange={(e) => setWaiverAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="waiver-accept" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                    <strong>I have read, understood, and agree to all terms and conditions stated in this waiver.</strong>
                    <br />
                    I acknowledge that I am voluntarily participating in this event and assume all associated risks. 
                    I certify that I am at least 18 years old or have parental/guardian consent.
                  </label>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <p className="text-sm text-gray-500">
                    This agreement is binding and governed by applicable laws.
                  </p>
                  <button
                    onClick={handleWaiverAccept}
                    disabled={!waiverAccepted}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      waiverAccepted 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Check className="w-4 h-4 inline mr-2" />
                    Accept & Continue to Entry Form
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Entry Form Step
  if (currentStep === 'entry') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg">
            <div className="bg-green-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">Trial Entry Form</h1>
                  <p className="text-green-100">{waiverConfig.trialName}</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Dog Information</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dog Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={entryData.dogName}
                      onChange={(e) => handleInputChange('dogName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your dog's name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Breed *
                    </label>
                    <input
                      type="text"
                      required
                      value={entryData.breed}
                      onChange={(e) => handleInputChange('breed', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter breed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      required
                      value={entryData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trial Class *
                    </label>
                    <select
                      required
                      value={entryData.trialClass}
                      onChange={(e) => handleInputChange('trialClass', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select a class</option>
                      <option value="Novice A">Novice A</option>
                      <option value="Novice B">Novice B</option>
                      <option value="Open A">Open A</option>
                      <option value="Open B">Open B</option>
                      <option value="Utility A">Utility A</option>
                      <option value="Utility B">Utility B</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Handler Information</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Handler Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={entryData.handlerName}
                      onChange={(e) => handleInputChange('handlerName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter handler's full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={entryData.handlerEmail}
                      onChange={(e) => handleInputChange('handlerEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={entryData.handlerPhone}
                      onChange={(e) => handleInputChange('handlerPhone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact *
                    </label>
                    <input
                      type="text"
                      required
                      value={entryData.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Name and phone number"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Needs or Notes (Optional)
                </label>
                <textarea
                  value={entryData.specialNeeds}
                  onChange={(e) => handleInputChange('specialNeeds', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Any special requirements, behavioral notes, or other information..."
                />
              </div>

              <div className="mt-8 border-t pt-6">
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('waiver')}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    ← Back to Waiver
                  </button>
                  <button
                    type="button"
                    onClick={handleEntrySubmit}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Submit Entry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation Step
  if (currentStep === 'confirmation') {
    const confirmationNumber = `DOG${new Date().getFullYear()}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg">
            <div className="bg-green-600 text-white p-6 rounded-t-xl text-center">
              <Check className="w-12 h-12 mx-auto mb-3" />
              <h1 className="text-2xl font-bold">Entry Submitted Successfully!</h1>
            </div>

            <div className="p-8 text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-green-800 mb-2">Confirmation Number</h2>
                <p className="text-2xl font-bold text-green-600 font-mono">{confirmationNumber}</p>
                <p className="text-sm text-green-700 mt-2">
                  Save this number - you'll need it to access and modify your entry
                </p>
              </div>

              <div className="space-y-4 text-left">
                <h3 className="font-semibold text-gray-800">What's Next?</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>You'll receive a confirmation email at {entryData.handlerEmail}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Payment instructions will be included in the email</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>You can log in anytime to view or edit your entry</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Final details will be sent 1 week before the trial</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Questions?</strong> Contact us at {waiverConfig.contactEmail} or {waiverConfig.contactPhone}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default WaiverEntryForm;