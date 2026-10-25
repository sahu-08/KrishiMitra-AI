const FAQS = [
  {
    keys: ["water", "irrigation", "irrigate"],
    answer:
      "Water crops early morning or evening. Avoid flooding unless growing rice. Check soil moisture with your finger — if top soil is dry, water lightly.",
  },
  {
    keys: ["fertilizer", "urea", "manure", "compost", "npk"],
    answer:
      "Use compost or farmyard manure first. Add urea for leafy growth, phosphorus for roots/flowers, and potash for fruit strength. Do a soil test if possible.",
  },
  {
    keys: ["pest", "insect", "bug", "aphid"],
    answer:
      "Check plants weekly under leaves. Neem spray helps many soft pests. Remove heavily damaged leaves. Avoid spraying during flowering if bees are active.",
  },
  {
    keys: ["disease", "fungus", "blight", "rust", "spot"],
    answer:
      "Improve air flow between plants and avoid wetting leaves late in the day. Remove infected parts. Use recommended fungicide only if problem spreads.",
  },
  {
    keys: ["soil", "ph", "acid", "alkaline"],
    answer:
      "Most crops like pH 6 to 7.5. For acidic soil add lime; for alkaline soil add organic matter and gypsum if advised by local agri officers.",
  },
  {
    keys: ["seed", "sowing", "plant"],
    answer:
      "Use clean certified seeds. Sow at the right depth for each crop and keep soil moist until germination. Follow local season calendar for best results.",
  },
  {
    keys: ["weather", "rain", "drought", "heat"],
    answer:
      "Before heavy rain, clear drains. In heat, mulch soil and water more often in small amounts. Delay spraying if rain is expected within a few hours.",
  },
  {
    keys: ["rice", "paddy"],
    answer:
      "Rice needs warm weather and standing water in early stages. Keep nursery healthy and transplant young seedlings with proper spacing.",
  },
  {
    keys: ["wheat"],
    answer:
      "Wheat prefers cooler weather. Ensure timely irrigation at crown root, flowering, and grain filling stages for better yield.",
  },
  {
    keys: ["hello", "hi", "namaste", "help"],
    answer:
      "Namaste! Ask me about watering, fertilizer, pests, soil, seeds, or weather. I will reply in simple farming language.",
  },
];

export function getChatReply(message) {
  const text = String(message || "").toLowerCase().trim();

  if (!text) {
    return "Please type or speak your farming question.";
  }

  for (const faq of FAQS) {
    if (faq.keys.some((key) => text.includes(key))) {
      return faq.answer;
    }
  }

  return "I am a simple farming helper. Try asking about watering, fertilizer, pests, soil pH, seeds, weather, rice, or wheat.";
}
