export type Language = 'en' | 'tl';

export const dictionary = {
  en: {
    splash: {
      tagline: "You'll never be lost.",
      next: "Next"
    },
    language: {
      select: "Select Language",
      english: "English",
      tagalog: "Tagalog",
      continue: "Continue"
    },
    auth: {
      login: "Log In",
      signup: "Sign Up",
      username: "Username",
      password: "Password",
      terms: "I agree to the terms and conditions",
      submit: "Submit",
      errorEmpty: "Fields cannot be empty.",
      errorTerms: "You must agree to the terms.",
      errorInvalid: "Invalid credentials.",
      or: "or continue with"
    },
    home: {
      whereTo: "Where to?",
      locateMe: "Locate Me"
    },
    search: {
      placeholder: "Search destination...",
      results: "Top Results"
    },
    results: {
      recommended: "Recommended Route",
      mins: "mins",
      ride: "Ride",
      walk: "Walk",
      startTrip: "Start Trip Guide"
    },
    trip: {
      step: "Step",
      of: "of",
      finish: "Finish Trip",
      bayadPrompt: "Bayad po, isa hanggang"
    }
  },
  tl: {
    splash: {
      tagline: "Hindi ka na maliligaw.",
      next: "Susunod"
    },
    language: {
      select: "Pumili ng Wika",
      english: "Ingles",
      tagalog: "Tagalog",
      continue: "Magpatuloy"
    },
    auth: {
      login: "Mag-log In",
      signup: "Mag-sign Up",
      username: "Username",
      password: "Password",
      terms: "Sumasang-ayon ako sa mga tuntunin",
      submit: "Ipasa",
      errorEmpty: "Hindi maaaring walang laman.",
      errorTerms: "Dapat kang sumang-ayon sa mga tuntunin.",
      errorInvalid: "Mali ang username o password.",
      or: "o magpatuloy gamit ang"
    },
    home: {
      whereTo: "Saan tayo?",
      locateMe: "Hanapin Ako"
    },
    search: {
      placeholder: "Maghanap ng pupuntahan...",
      results: "Nangungunang Resulta"
    },
    results: {
      recommended: "Inirerekomendang Ruta",
      mins: "minuto",
      ride: "Sumakay",
      walk: "Maglakad",
      startTrip: "Simulan ang Biyahe"
    },
    trip: {
      step: "Hakbang",
      of: "ng",
      finish: "Tapusin",
      bayadPrompt: "Bayad po, isa hanggang"
    }
  }
};

export type Dictionary = typeof dictionary.en;
