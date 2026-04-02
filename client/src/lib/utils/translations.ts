export type Language = 'en' | 'hi';

export interface Translations {
  // Page title and headers
  pageTitle: string;
  pageSubtitle: string;
  stepOf: string;
  
  // Navigation
  previous: string;
  next: string;
  submit: string;
  submitReport: string;
  submitting: string;
  saveDraft: string;
  
  // Form sections
  issueDetails: string;
  location: string;
  description: string;
  photos: string;
  contact: string;
  
  // Form fields
  title: string;
  titlePlaceholder: string;
  titleHelper: string;
  category: string;
  categoryHelper: string;
  descriptionPlaceholder: string;
  descriptionHelper: string;
  descriptionVoiceHelper: string;
  
  // Location
  useCurrentLocation: string;
  searchAddress: string;
  dropPin: string;
  dragPin: string;
  locationAccuracy: string;
  exactAddress: string;
  
  // Voice controls
  tapToSpeak: string;
  listening: string;
  stopListening: string;
  voiceLanguage: string;
  voiceNotSupported: string;
  micPermissionDenied: string;
  
  // Photos
  addPhotos: string;
  photosRequired: string;
  photosHelper: string;
  photoUploadProgress: string;
  removePhoto: string;
  reorderPhotos: string;
  
  // Validation
  required: string;
  minLength: string;
  maxLength: string;
  invalidFormat: string;
  
  // Categories
  categories: {
    roads: string;
    streetlights: string;
    sanitation: string;
    water: string;
    parks: string;
    safety: string;
    other: string;
  };
  
  // Success/Error states
  reportSubmitted: string;
  submissionSuccess: string;
  submissionError: string;
  trackingId: string;
  trackStatus: string;
  shareLink: string;
  reportAnother: string;
  
  // Privacy
  privacyNote: string;
  consentPublicDisplay: string;
  
  // Status
  statusNew: string;
  statusTriaged: string;
  statusAssigned: string;
  statusInProgress: string;
  statusOnHold: string;
  statusResolved: string;
  statusRejected: string;
  
  // Map and Location
  yourLocation: string;
  selectedLocation: string;
  accuracy: string;
  accuracyHigh: string;
  accuracyMedium: string;
  accuracyLow: string;
  accuracyUnknown: string;
  loadingMap: string;
  locationNotSupported: string;
  locationError: string;
  locationPermissionDenied: string;
  locationUnavailable: string;
  locationTimeout: string;
  
  // Errors
  errors: {
    titleTooShort: string;
    titleTooLong: string;
    descriptionTooShort: string;
    descriptionTooLong: string;
    categoryRequired: string;
    locationRequired: string;
    photosRequired: string;
    photosTooMany: string;
    photoTooLarge: string;
    photoInvalidType: string;
    networkError: string;
    gpsError: string;
    geocodingError: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    // Page title and headers
    pageTitle: "Report an Issue",
    pageSubtitle: "Help us keep the city better. Share details and location for a quick response.",
    stepOf: "Step {current} of {total}",
    
    // Navigation
    previous: "Previous",
    next: "Next",
    submit: "Submit",
    submitReport: "Submit Report",
    submitting: "Submitting...",
    saveDraft: "Save Draft",
    
    // Form sections
    issueDetails: "Issue Details",
    location: "Location",
    description: "Description",
    photos: "Photos",
    contact: "Contact Information",
    
    // Form fields
    title: "Issue Title",
    titlePlaceholder: "Broken streetlight near Sector 12 gate",
    titleHelper: "Say what and where briefly (10-80 characters)",
    category: "Category",
    categoryHelper: "Select the type of issue you're reporting",
    descriptionPlaceholder: "Pole #SL-27 flickers after 7 pm, unsafe for pedestrians...",
    descriptionHelper: "Describe what, where, and impact (20-500 characters)",
    descriptionVoiceHelper: "Tap the microphone to speak your description",
    
    // Location
    useCurrentLocation: "Use my current location",
    searchAddress: "Search address or landmark",
    dropPin: "Drop a pin on map",
    dragPin: "Drag the pin to exact spot",
    locationAccuracy: "Location accuracy",
    exactAddress: "Exact address hidden publicly; authorities get precise location",
    
    // Voice controls
    tapToSpeak: "Tap to speak",
    listening: "Listening...",
    stopListening: "Stop listening",
    voiceLanguage: "Voice language",
    voiceNotSupported: "Voice input not supported in this browser",
    micPermissionDenied: "Microphone permission denied",
    
    // Photos
    addPhotos: "Add Photos",
    photosRequired: "2-3 photos required",
    photosHelper: "Add 2-3 clear photos (daylight if possible)",
    photoUploadProgress: "Uploading photos...",
    removePhoto: "Remove photo",
    reorderPhotos: "Drag to reorder",
    
    // Validation
    required: "This field is required",
    minLength: "Minimum {min} characters required",
    maxLength: "Maximum {max} characters allowed",
    invalidFormat: "Invalid format",
    
    // Categories
    categories: {
      roads: "Roads & Transport",
      streetlights: "Street Lights",
      sanitation: "Sanitation & Waste",
      water: "Water Supply",
      parks: "Parks & Recreation",
      safety: "Public Safety",
      other: "Other Issues"
    },
    
    // Success/Error states
    reportSubmitted: "Report Submitted Successfully",
    submissionSuccess: "Thanks! Your report helps us act faster.",
    submissionError: "Failed to submit report. Please try again.",
    trackingId: "Tracking ID",
    trackStatus: "Track Status",
    shareLink: "Share Link",
    reportAnother: "Report Another Issue",
    
    // Privacy
    privacyNote: "Your exact address won't be publicly shown; authorities receive precise location.",
    consentPublicDisplay: "Allow public display of my name with this report",
    
    // Status
    statusNew: "New",
    statusTriaged: "Under Review",
    statusAssigned: "Assigned",
    statusInProgress: "In Progress",
    statusOnHold: "On Hold",
    statusResolved: "Resolved",
    statusRejected: "Rejected",
    
    // Map and Location
    yourLocation: "Your Location",
    selectedLocation: "Selected Location",
    accuracy: "Accuracy",
    accuracyHigh: "High",
    accuracyMedium: "Medium",
    accuracyLow: "Low",
    accuracyUnknown: "Unknown",
    loadingMap: "Loading map...",
    locationNotSupported: "Geolocation not supported in this browser",
    locationError: "Unable to get your location",
    locationPermissionDenied: "Location access denied. Please enable location permissions.",
    locationUnavailable: "Location service unavailable",
    locationTimeout: "Location request timed out",
    
    // Errors
    errors: {
      titleTooShort: "Title must be at least 10 characters",
      titleTooLong: "Title must be less than 80 characters",
      descriptionTooShort: "Description must be at least 20 characters",
      descriptionTooLong: "Description must be less than 500 characters",
      categoryRequired: "Please select a category",
      locationRequired: "Please provide a location",
      photosRequired: "Please upload 2-3 photos",
      photosTooMany: "Maximum 3 photos allowed",
      photoTooLarge: "Photo size must be less than 10MB",
      photoInvalidType: "Only JPG, PNG, and HEIC files are allowed",
      networkError: "Network error. Please check your connection.",
      gpsError: "Unable to get your location. Please use map or search.",
      geocodingError: "Unable to get address for this location"
    }
  },
  
  hi: {
    // Page title and headers
    pageTitle: "समस्या दर्ज करें",
    pageSubtitle: "शहर को बेहतर रखने में मदद करें। त्वरित प्रतिक्रिया के लिए विवरण और स्थान साझा करें।",
    stepOf: "चरण {current} of {total}",
    
    // Navigation
    previous: "पिछला",
    next: "अगला",
    submit: "भेजें",
    submitReport: "रिपोर्ट भेजें",
    submitting: "भेजा जा रहा है...",
    saveDraft: "ड्राफ्ट सेव करें",
    
    // Form sections
    issueDetails: "समस्या का विवरण",
    location: "स्थान",
    description: "विवरण",
    photos: "तस्वीरें",
    contact: "संपर्क जानकारी",
    
    // Form fields
    title: "समस्या का शीर्षक",
    titlePlaceholder: "सेक्टर 12 गेट के पास टूटी स्ट्रीट लाइट",
    titleHelper: "संक्षेप में क्या और कहाँ बताएं (10-80 अक्षर)",
    category: "श्रेणी",
    categoryHelper: "आप जिस प्रकार की समस्या रिपोर्ट कर रहे हैं उसे चुनें",
    descriptionPlaceholder: "पोल #SL-27 शाम 7 बजे के बाद टिमटिमाती है, पैदल चलने वालों के लिए असुरक्षित...",
    descriptionHelper: "क्या, कहाँ, और प्रभाव का वर्णन करें (20-500 अक्षर)",
    descriptionVoiceHelper: "अपना विवरण बोलने के लिए माइक्रोफोन दबाएं",
    
    // Location
    useCurrentLocation: "मेरी वर्तमान स्थिति का उपयोग करें",
    searchAddress: "पता या लैंडमार्क खोजें",
    dropPin: "मैप पर पिन डालें",
    dragPin: "पिन को सही स्थान पर खींचें",
    locationAccuracy: "स्थान की सटीकता",
    exactAddress: "सटीक पता सार्वजनिक रूप से नहीं दिखाया जाएगा; अधिकारियों को सटीक स्थान मिलेगा",
    
    // Voice controls
    tapToSpeak: "बोलने के लिए टैप करें",
    listening: "सुन रहा है...",
    stopListening: "सुनना बंद करें",
    voiceLanguage: "आवाज की भाषा",
    voiceNotSupported: "इस ब्राउज़र में आवाज़ इनपुट समर्थित नहीं है",
    micPermissionDenied: "माइक्रोफोन की अनुमति नकार दी गई",
    
    // Photos
    addPhotos: "तस्वीरें जोड़ें",
    photosRequired: "2-3 तस्वीरें आवश्यक",
    photosHelper: "2-3 साफ़ तस्वीरें जोड़ें (यदि संभव हो तो दिन की रोशनी में)",
    photoUploadProgress: "तस्वीरें अपलोड हो रही हैं...",
    removePhoto: "तस्वीर हटाएं",
    reorderPhotos: "क्रम बदलने के लिए खींचें",
    
    // Validation
    required: "यह फ़ील्ड आवश्यक है",
    minLength: "न्यूनतम {min} अक्षर आवश्यक",
    maxLength: "अधिकतम {max} अक्षर की अनुमति",
    invalidFormat: "गलत प्रारूप",
    
    // Categories
    categories: {
      roads: "सड़क और परिवहन",
      streetlights: "स्ट्रीट लाइट",
      sanitation: "स्वच्छता और कचरा",
      water: "पानी की आपूर्ति",
      parks: "पार्क और मनोरंजन",
      safety: "सार्वजनिक सुरक्षा",
      other: "अन्य समस्याएं"
    },
    
    // Success/Error states
    reportSubmitted: "रिपोर्ट सफलतापूर्वक दर्ज हो गई",
    submissionSuccess: "धन्यवाद! आपकी रिपोर्ट हमें तेज़ी से कार्रवाई में मदद करती है।",
    submissionError: "रिपोर्ट भेजने में विफल। कृपया पुनः प्रयास करें।",
    trackingId: "ट्रैकिंग आईडी",
    trackStatus: "स्थिति ट्रैक करें",
    shareLink: "लिंक साझा करें",
    reportAnother: "दूसरी समस्या रिपोर्ट करें",
    
    // Privacy
    privacyNote: "आपका सटीक पता सार्वजनिक रूप से नहीं दिखाया जाएगा; अधिकारियों को सटीक स्थान मिलेगा।",
    consentPublicDisplay: "इस रिपोर्ट के साथ मेरे नाम का सार्वजनिक प्रदर्शन की अनुमति दें",
    
    // Status
    statusNew: "नया",
    statusTriaged: "समीक्षाधीन",
    statusAssigned: "सौंपा गया",
    statusInProgress: "प्रगति में",
    statusOnHold: "रोक पर",
    statusResolved: "हल हो गया",
    statusRejected: "अस्वीकृत",
    
    // Map and Location
    yourLocation: "आपका स्थान",
    selectedLocation: "चयनित स्थान",
    accuracy: "सटीकता",
    accuracyHigh: "उच्च",
    accuracyMedium: "मध्यम",
    accuracyLow: "निम्न",
    accuracyUnknown: "अज्ञात",
    loadingMap: "मैप लोड हो रहा है...",
    locationNotSupported: "इस ब्राउज़र में भूस्थान समर्थित नहीं है",
    locationError: "आपका स्थान प्राप्त करने में असमर्थ",
    locationPermissionDenied: "स्थान पहुंच से इनकार। कृपया स्थान अनुमतियाँ सक्षम करें।",
    locationUnavailable: "स्थान सेवा अनुपलब्ध",
    locationTimeout: "स्थान अनुरोध समाप्त हो गया",
    
    // Errors
    errors: {
      titleTooShort: "शीर्षक कम से कम 10 अक्षर का होना चाहिए",
      titleTooLong: "शीर्षक 80 अक्षर से कम होना चाहिए",
      descriptionTooShort: "विवरण कम से कम 20 अक्षर का होना चाहिए",
      descriptionTooLong: "विवरण 500 अक्षर से कम होना चाहिए",
      categoryRequired: "कृपया एक श्रेणी चुनें",
      locationRequired: "कृपया एक स्थान प्रदान करें",
      photosRequired: "कृपया 2-3 तस्वीरें अपलोड करें",
      photosTooMany: "अधिकतम 3 तस्वीरों की अनुमति है",
      photoTooLarge: "तस्वीर का साइज़ 10MB से कम होना चाहिए",
      photoInvalidType: "केवल JPG, PNG, और HEIC फाइलों की अनुमति है",
      networkError: "नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें।",
      gpsError: "आपका स्थान प्राप्त करने में असमर्थ। कृपया मैप या खोज का उपयोग करें।",
      geocodingError: "इस स्थान के लिए पता प्राप्त करने में असमर्थ"
    }
  }
};

// Translation utility functions
export function useTranslation(language: Language = 'en') {
  return translations[language];
}

export function t(key: string, language: Language = 'en', params?: Record<string, string | number>): string {
  const keys = key.split('.');
  let value: unknown = translations[language];
  
  for (const k of keys) {
    if (typeof value === 'object' && value !== null && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key; // Return key if path not found
    }
  }
  
  if (typeof value !== 'string') {
    return key; // Return key if translation not found
  }
  
  // Replace parameters
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match: string, param: string) => {
      return params[param]?.toString() || match;
    });
  }
  
  return value;
}
