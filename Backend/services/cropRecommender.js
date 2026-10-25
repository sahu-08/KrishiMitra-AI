// Simple rule-based crop scoring (no external ML needed)

const CROPS = [
  {
    name: "Rice",
    n: [70, 120],
    p: [35, 60],
    k: [35, 50],
    temp: [20, 30],
    humidity: [70, 95],
    ph: [5.5, 7.0],
    rainfall: [150, 300],
    tip: "Needs standing water and warm, humid weather.",
  },
  {
    name: "Wheat",
    n: [40, 90],
    p: [30, 60],
    k: [30, 50],
    temp: [12, 25],
    humidity: [50, 70],
    ph: [6.0, 7.5],
    rainfall: [50, 100],
    tip: "Grows well in cooler seasons with moderate rain.",
  },
  {
    name: "Maize",
    n: [60, 100],
    p: [35, 60],
    k: [20, 40],
    temp: [18, 27],
    humidity: [55, 75],
    ph: [5.5, 7.0],
    rainfall: [60, 110],
    tip: "Needs good nitrogen and well-drained soil.",
  },
  {
    name: "Cotton",
    n: [100, 140],
    p: [40, 70],
    k: [40, 70],
    temp: [21, 30],
    humidity: [50, 70],
    ph: [5.8, 8.0],
    rainfall: [60, 120],
    tip: "Prefers warm climate and longer sunny days.",
  },
  {
    name: "Sugarcane",
    n: [80, 130],
    p: [40, 80],
    k: [40, 80],
    temp: [20, 35],
    humidity: [70, 90],
    ph: [6.0, 7.5],
    rainfall: [120, 250],
    tip: "Needs high water and warm temperatures.",
  },
  {
    name: "Chickpea",
    n: [20, 50],
    p: [40, 70],
    k: [20, 40],
    temp: [15, 25],
    humidity: [20, 50],
    ph: [6.0, 7.5],
    rainfall: [40, 80],
    tip: "Good for drier soils with lower nitrogen.",
  },
  {
    name: "Mustard",
    n: [30, 60],
    p: [30, 55],
    k: [20, 40],
    temp: [10, 25],
    humidity: [40, 65],
    ph: [6.0, 7.5],
    rainfall: [40, 90],
    tip: "Cool-season oilseed crop for moderate soils.",
  },
  {
    name: "Groundnut",
    n: [20, 50],
    p: [40, 70],
    k: [20, 40],
    temp: [20, 30],
    humidity: [50, 70],
    ph: [5.5, 7.0],
    rainfall: [50, 100],
    tip: "Likes sandy-loam soil and warm weather.",
  },
  {
    name: "Potato",
    n: [80, 120],
    p: [40, 70],
    k: [80, 120],
    temp: [15, 22],
    humidity: [60, 80],
    ph: [5.0, 6.5],
    rainfall: [50, 100],
    tip: "Needs cool nights and good potassium.",
  },
  {
    name: "Tomato",
    n: [60, 100],
    p: [40, 70],
    k: [50, 90],
    temp: [18, 28],
    humidity: [50, 70],
    ph: [6.0, 7.0],
    rainfall: [40, 90],
    tip: "Grows well with balanced nutrients and mild heat.",
  },
];

function scoreRange(value, [min, max]) {
  if (value >= min && value <= max) return 1;
  const mid = (min + max) / 2;
  const half = (max - min) / 2 || 1;
  const distance = Math.abs(value - mid) / half;
  return Math.max(0, 1 - distance * 0.45);
}

export function recommendCrops(params) {
  const { nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall } =
    params;

  const scored = CROPS.map((crop) => {
    const modelScore =
      scoreRange(nitrogen, crop.n) * 0.18 +
      scoreRange(phosphorus, crop.p) * 0.14 +
      scoreRange(potassium, crop.k) * 0.14 +
      scoreRange(temperature, crop.temp) * 0.16 +
      scoreRange(humidity, crop.humidity) * 0.12 +
      scoreRange(ph, crop.ph) * 0.14 +
      scoreRange(rainfall, crop.rainfall) * 0.12;

    return {
      crop: crop.name,
      modelScore: Math.round(modelScore * 1000) / 10,
      tip: crop.tip,
    };
  });

  scored.sort((a, b) => b.modelScore - a.modelScore);

  const top = scored.slice(0, 3);

  return {
    recommendedCrop: top[0].crop,
    topRecommendations: top,
  };
}
