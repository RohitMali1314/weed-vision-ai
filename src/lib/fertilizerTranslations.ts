// Multilingual fertilizer data keyed by detection label
export interface FertilizerTranslation {
  fertilizer: { en: string; hi: string; mr: string };
  quantity: { en: string; hi: string; mr: string };
  frequency: { en: string; hi: string; mr: string };
}

export const fertilizerTranslations: Record<string, FertilizerTranslation> = {
  "Cotton": {
    fertilizer: { en: "Urea (46% N)", hi: "यूरिया (46% नाइट्रोजन)", mr: "युरिया (46% नायट्रोजन)" },
    quantity: { en: "60 kg per acre", hi: "60 किलोग्राम प्रति एकड़", mr: "60 किलो प्रति एकर" },
    frequency: { en: "Split into 2 to 3 doses during crop cycle", hi: "फसल अवधि में 2 से 3 बार दें", mr: "पिक वाढीच्या काळात 2 ते 3 वेळा द्या" }
  },
  "Maize": {
    fertilizer: { en: "DAP + Urea", hi: "डीएपी + यूरिया", mr: "डीएपी + युरिया" },
    quantity: { en: "50 kg per acre", hi: "50 किलोग्राम प्रति एकड़", mr: "50 किलो प्रति एकर" },
    frequency: { en: "Apply twice during crop growth", hi: "फसल वृद्धि के दौरान 2 बार दें", mr: "पिक वाढीच्या काळात 2 वेळा द्या" }
  },
  "Soybean": {
    fertilizer: { en: "NPK (12:32:16)", hi: "एनपीके (12:32:16)", mr: "एनपीके (12:32:16)" },
    quantity: { en: "75 kg per acre", hi: "75 किलोग्राम प्रति एकड़", mr: "75 किलो प्रति एकर" },
    frequency: { en: "Apply once at sowing", hi: "बुवाई के समय एक बार दें", mr: "पेरणीच्या वेळी एकदा द्या" }
  },
  "Abutilon_theophrasti": {
    fertilizer: { en: "2,4-D Amine Salt", hi: "2,4-D अमाइन सॉल्ट", mr: "2,4-D अमाइन सॉल्ट" },
    quantity: { en: "500 ml per acre", hi: "500 मिली प्रति एकड़", mr: "500 मिली प्रति एकर" },
    frequency: { en: "Spray once after weed emergence", hi: "खरपतवार निकलने के बाद एक बार स्प्रे करें", mr: "तण उगवल्यानंतर एकदा फवारणी करा" }
  },
  "Digitaria_sanguinalis": {
    fertilizer: { en: "Atrazine 50% WP", hi: "एट्राजीन 50% WP", mr: "एट्राजीन 50% WP" },
    quantity: { en: "0.5 to 1 kg per acre", hi: "0.5 से 1 किलोग्राम प्रति एकड़", mr: "0.5 ते 1 किलो प्रति एकर" },
    frequency: { en: "Apply once pre-emergence", hi: "अंकुरण से पहले एक बार", mr: "उगवण्यापूर्वी एकदा" }
  },
  "Field_bindweed": {
    fertilizer: { en: "Glyphosate 41% SL", hi: "ग्लाइफोसेट 41% SL", mr: "ग्लायफोसेट 41% SL" },
    quantity: { en: "1.5 liters per acre", hi: "1.5 लीटर प्रति एकड़", mr: "1.5 लिटर प्रति एकर" },
    frequency: { en: "Every 30 days until controlled", hi: "नियंत्रण तक हर 30 दिन में", mr: "नियंत्रण होईपर्यंत दर 30 दिवसांनी" }
  },
  "Lambsquarters": {
    fertilizer: { en: "Metribuzin 70% WP", hi: "मेट्रिब्यूजिन 70% WP", mr: "मेट्रिब्यूजिन 70% WP" },
    quantity: { en: "200–300 g per acre", hi: "200–300 ग्राम प्रति एकड़", mr: "200–300 ग्रॅम प्रति एकर" },
    frequency: { en: "Spray once post-emergence", hi: "अंकुरण के बाद एक बार स्प्रे", mr: "उगवल्यानंतर एकदा फवारणी" }
  },
  "Crabgrass": {
    fertilizer: { en: "Pendimethalin 30% EC", hi: "पेंडिमेथालिन 30% EC", mr: "पेंडिमेथालिन 30% EC" },
    quantity: { en: "1 liter per acre", hi: "1 लीटर प्रति एकड़", mr: "1 लिटर प्रति एकर" },
    frequency: { en: "Pre-emergence once", hi: "अंकुरण से पहले एक बार", mr: "उगवण्यापूर्वी एकदा" }
  },
  "Goosegrass": {
    fertilizer: { en: "Oxadiazon 25% EC", hi: "ऑक्साडियाजोन 25% EC", mr: "ऑक्साडियाजोन 25% EC" },
    quantity: { en: "500 ml per acre", hi: "500 मिली प्रति एकड़", mr: "500 मिली प्रति एकर" },
    frequency: { en: "Apply once post-emergence", hi: "अंकुरण के बाद एक बार", mr: "उगवल्यानंतर एकदा" }
  },
  "Morningglory": {
    fertilizer: { en: "2,4-D Amine Salt", hi: "2,4-D अमाइन सॉल्ट", mr: "2,4-D अमाइन सॉल्ट" },
    quantity: { en: "0.5–0.7 liter per acre", hi: "0.5–0.7 लीटर प्रति एकड़", mr: "0.5–0.7 लिटर प्रति एकर" },
    frequency: { en: "Apply once after emergence", hi: "उगने के बाद एक बार", mr: "उगवल्यानंतर एकदा" }
  },
  "Nutsedge": {
    fertilizer: { en: "Halosulfuron", hi: "हेलोसल्फ्यूरॉन", mr: "हॅलोसल्फ्युरॉन" },
    quantity: { en: "67 g per acre", hi: "67 ग्राम प्रति एकड़", mr: "67 ग्रॅम प्रति एकर" },
    frequency: { en: "Repeat after 30 days if needed", hi: "जरूरत हो तो 30 दिन बाद दोहराएं", mr: "गरज असल्यास 30 दिवसांनी पुन्हा करा" }
  },
  "Ragweed": {
    fertilizer: { en: "Glyphosate 41% SL", hi: "ग्लाइफोसेट 41% SL", mr: "ग्लायफोसेट 41% SL" },
    quantity: { en: "1.2 liters per acre", hi: "1.2 लीटर प्रति एकड़", mr: "1.2 लिटर प्रति एकर" },
    frequency: { en: "Apply twice, 20 days apart", hi: "20 दिन के अंतर से दो बार", mr: "20 दिवसांच्या अंतराने दोनदा" }
  },
  "Purslane": {
    fertilizer: { en: "Paraquat dichloride 24% SL", hi: "पैराक्वाट डाइक्लोराइड 24% SL", mr: "पॅराक्वाट डायक्लोराइड 24% SL" },
    quantity: { en: "500 ml per acre", hi: "500 मिली प्रति एकड़", mr: "500 मिली प्रति एकर" },
    frequency: { en: "Spray once post-emergence", hi: "उगने के बाद एक बार स्प्रे", mr: "उगवल्यानंतर एकदा फवारणी" }
  },
  "Unknown_Weed": {
    fertilizer: { en: "General Glyphosate 41% SL", hi: "सामान्य ग्लाइफोसेट 41% SL", mr: "सामान्य ग्लायफोसेट 41% SL" },
    quantity: { en: "1 liter per acre", hi: "1 लीटर प्रति एकड़", mr: "1 लिटर प्रति एकर" },
    frequency: { en: "Broad spectrum spray once", hi: "एक बार व्यापक स्प्रे", mr: "एकदा व्यापक फवारणी" }
  }
};

/**
 * Get translated fertilizer data for a given label and language.
 * Falls back to English if no translation found, or returns the original values.
 */
export const getTranslatedFertilizer = (
  label: string,
  lang: string
): { name: string; quantity: string; frequency: string } | null => {
  // Try exact match first, then try normalized versions
  const key = Object.keys(fertilizerTranslations).find(
    k => k.toLowerCase() === label.toLowerCase() || 
         k.replace(/_/g, ' ').toLowerCase() === label.toLowerCase()
  );

  if (!key) return null;

  const data = fertilizerTranslations[key];
  const l = (lang === 'hi' || lang === 'mr') ? lang : 'en';

  return {
    name: data.fertilizer[l as keyof typeof data.fertilizer] || data.fertilizer.en,
    quantity: data.quantity[l as keyof typeof data.quantity] || data.quantity.en,
    frequency: data.frequency[l as keyof typeof data.frequency] || data.frequency.en,
  };
};