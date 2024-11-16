import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        eventManager: 'Event Manager',
        addEvent: 'Add Event',
        chatFor: 'Chat for',
        addANewEvent: 'Add a New Event',
        eventTitle: 'Event Title',
        eventDescription: 'Event Description',
        fromDate: 'From Date',
        toDate: 'To Date',
        location: 'Location',
        participants: 'Participants (comma separated)',
        cancel: 'Cancel',
        addEventButton: 'Add Event',
      },
    },
    np: {
      translation: {
        eventManager: 'कार्यक्रम व्यवस्थापक',
        addEvent: 'कार्यक्रम थप्नुहोस्',
        chatFor: '', // "संवाद" is more formal than "गफ"
        addANewEvent: 'नयाँ कार्यक्रम थप्नुहोस्',
        eventTitle: 'कार्यक्रमको शीर्षक',
        eventDescription: 'कार्यक्रमको विवरण',
        fromDate: 'सुरु मिति',
        toDate: 'अन्त्य मिति',
        location: 'स्थान',
        participants: 'सहभागीहरू (कमाले छुट्याएर)',
        cancel: 'रद्द गर्नुहोस्',
        addEventButton: 'कार्यक्रम थप्नुहोस्',
      },
    },
  },
  lng: 'en', // default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
