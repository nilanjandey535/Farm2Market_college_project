// backend/utils/zoneBasedCropSuggestions.js

const ZONE_BASED_CROP_DATA = {

  "north": {
    region_keywords: ["delhi", "punjab", "haryana", "uttar pradesh", "chandigarh", "lucknow", "kanpur", "amritsar", "patiala"],
    climate_type: "subtropical",
    crops: [
      {
        crop_name: "Wheat",
        category: "grains",
        season: "Rabi",
        temperature_min: 20,
        temperature_max: 28,
        humidity_min: 50,
        humidity_max: 75,
        water_requirement_mm: 400,
        growth_period_days: 120,
        expected_yield_kg_per_acre: 2000,
        market_price_rs_per_kg: 22,
        profit_margin_percent: 35,
        description: "Major Rabi crop, suitable for north Indian climate"
      },
      {
        crop_name: "Rice",
        category: "grains",
        season: "Kharif",
        temperature_min: 22,
        temperature_max: 35,
        humidity_min: 60,
        humidity_max: 85,
        water_requirement_mm: 1200,
        growth_period_days: 140,
        expected_yield_kg_per_acre: 2500,
        market_price_rs_per_kg: 20,
        profit_margin_percent: 30,
        description: "Water-intensive Kharif crop, high yield potential"
      },
      {
        crop_name: "Mustard",
        category: "oilseeds",
        season: "Rabi",
        temperature_min: 18,
        temperature_max: 28,
        humidity_min: 45,
        humidity_max: 70,
        water_requirement_mm: 300,
        growth_period_days: 110,
        expected_yield_kg_per_acre: 800,
        market_price_rs_per_kg: 55,
        profit_margin_percent: 45,
        description: "High-value oilseed crop for winter season"
      },
      {
        crop_name: "Sugarcane",
        category: "cash_crops",
        season: "Annual",
        temperature_min: 25,
        temperature_max: 35,
        humidity_min: 55,
        humidity_max: 80,
        water_requirement_mm: 1800,
        growth_period_days: 365,
        expected_yield_kg_per_acre: 45000,
        market_price_rs_per_kg: 3.5,
        profit_margin_percent: 40,
        description: "Long-duration cash crop with guaranteed procurement"
      },
      {
        crop_name: "Potato",
        category: "vegetables",
        season: "Rabi",
        temperature_min: 15,
        temperature_max: 25,
        humidity_min: 50,
        humidity_max: 70,
        water_requirement_mm: 400,
        growth_period_days: 90,
        expected_yield_kg_per_acre: 12000,
        market_price_rs_per_kg: 18,
        profit_margin_percent: 50,
        description: "Short duration vegetable crop with high demand"
      },
      {
        crop_name: "Maize",
        category: "grains",
        season: "Kharif",
        temperature_min: 20,
        temperature_max: 32,
        humidity_min: 55,
        humidity_max: 75,
        water_requirement_mm: 500,
        growth_period_days: 100,
        expected_yield_kg_per_acre: 2200,
        market_price_rs_per_kg: 18,
        profit_margin_percent: 38,
        description: "Versatile grain crop with multiple uses"
      }
    ]
  },

  "south": {
    region_keywords: ["tamil nadu", "karnataka", "kerala", "andhra pradesh", "telangana", "chennai", "bangalore", "hyderabad", "coimbatore", "madurai"],
    climate_type: "tropical",
    crops: [
      {
        crop_name: "Coconut",
        category: "plantation",
        season: "Annual",
        temperature_min: 25,
        temperature_max: 35,
        humidity_min: 70,
        humidity_max: 90,
        water_requirement_mm: 1500,
        growth_period_days: 365,
        expected_yield_kg_per_acre: 8000,
        market_price_rs_per_kg: 25,
        profit_margin_percent: 55,
        description: "Traditional plantation crop with year-round income"
      },
      {
        crop_name: "Coffee",
        category: "plantation",
        season: "Annual",
        temperature_min: 20,
        temperature_max: 30,
        humidity_min: 65,
        humidity_max: 85,
        water_requirement_mm: 1200,
        growth_period_days: 365,
        expected_yield_kg_per_acre: 600,
        market_price_rs_per_kg: 350,
        profit_margin_percent: 60,
        description: "High-value plantation crop for hilly regions"
      },
      {
        crop_name: "Rice",
        category: "grains",
        season: "Kharif",
        temperature_min: 24,
        temperature_max: 35,
        humidity_min: 65,
        humidity_max: 85,
        water_requirement_mm: 1400,
        growth_period_days: 130,
        expected_yield_kg_per_acre: 3000,
        market_price_rs_per_kg: 22,
        profit_margin_percent: 35,
        description: "Staple food crop, multiple harvests per year"
      },
      {
        crop_name: "Banana",
        category: "fruits",
        season: "Annual",
        temperature_min: 25,
        temperature_max: 35,
        humidity_min: 60,
        humidity_max: 80,
        water_requirement_mm: 1800,
        growth_period_days: 365,
        expected_yield_kg_per_acre: 40000,
        market_price_rs_per_kg: 20,
        profit_margin_percent: 50,
        description: "High-yield fruit crop with continuous demand"
      },
      {
        crop_name: "Turmeric",
        category: "spices",
        season: "Kharif",
        temperature_min: 22,
        temperature_max: 32,
        humidity_min: 60,
        humidity_max: 80,
        water_requirement_mm: 1000,
        growth_period_days: 240,
        expected_yield_kg_per_acre: 2500,
        market_price_rs_per_kg: 90,
        profit_margin_percent: 65,
        description: "Valuable spice crop with export potential"
      },
      {
        crop_name: "Groundnut",
        category: "oilseeds",
        season: "Kharif",
        temperature_min: 25,
        temperature_max: 35,
        humidity_min: 50,
        humidity_max: 70,
        water_requirement_mm: 500,
        growth_period_days: 110,
        expected_yield_kg_per_acre: 1200,
        market_price_rs_per_kg: 55,
        profit_margin_percent: 42,
        description: "Important oilseed crop for dry regions"
      }
    ]
  },

  "east": {
    region_keywords: ["west bengal", "odisha", "bihar", "jharkhand", "assam", "kolkata", "patna", "ranchi", "bhubaneswar", "guwahati"],
    climate_type: "humid_subtropical",
    crops: [
      {
        crop_name: "Jute",
        category: "fiber",
        season: "Kharif",
        temperature_min: 25,
        temperature_max: 35,
        humidity_min: 70,
        humidity_max: 90,
        water_requirement_mm: 1500,
        growth_period_days: 150,
        expected_yield_kg_per_acre: 4000,
        market_price_rs_per_kg: 35,
        profit_margin_percent: 45,
        description: "Golden fiber, traditional crop of eastern India"
      },
      {
        crop_name: "Rice",
        category: "grains",
        season: "Kharif",
        temperature_min: 24,
        temperature_max: 35,
        humidity_min: 70,
        humidity_max: 90,
        water_requirement_mm: 1500,
        growth_period_days: 140,
        expected_yield_kg_per_acre: 2800,
        market_price_rs_per_kg: 21,
        profit_margin_percent: 32,
        description: "Primary Kharif crop with high rainfall requirement"
      },
      {
        crop_name: "Tea",
        category: "plantation",
        season: "Annual",
        temperature_min: 20,
        temperature_max: 30,
        humidity_min: 70,
        humidity_max: 90,
        water_requirement_mm: 2000,
        growth_period_days: 365,
        expected_yield_kg_per_acre: 1500,
        market_price_rs_per_kg: 250,
        profit_margin_percent: 55,
        description: "Premium plantation crop for hilly areas"
      },
      {
        crop_name: "Maize",
        category: "grains",
        season: "Rabi",
        temperature_min: 18,
        temperature_max: 28,
        humidity_min: 55,
        humidity_max: 75,
        water_requirement_mm: 450,
        growth_period_days: 100,
        expected_yield_kg_per_acre: 2000,
        market_price_rs_per_kg: 17,
        profit_margin_percent: 36,
        description: "Winter maize suitable for eastern climate"
      },
      {
        crop_name: "Vegetables (Mixed)",
        category: "vegetables",
        season: "Rabi",
        temperature_min: 18,
        temperature_max: 30,
        humidity_min: 60,
        humidity_max: 80,
        water_requirement_mm: 500,
        growth_period_days: 60,
        expected_yield_kg_per_acre: 8000,
        market_price_rs_per_kg: 25,
        profit_margin_percent: 55,
        description: "Short-duration vegetables for quick returns"
      },
      {
        crop_name: "Litchi",
        category: "fruits",
        season: "Annual",
        temperature_min: 20,
        temperature_max: 32,
        humidity_min: 65,
        humidity_max: 85,
        water_requirement_mm: 1200,
        growth_period_days: 365,
        expected_yield_kg_per_acre: 5000,
        market_price_rs_per_kg: 80,
        profit_margin_percent: 60,
        description: "Seasonal fruit with high market demand"
      }
    ]
  },

  "west": {
    region_keywords: ["maharashtra", "gujarat", "rajasthan", "goa", "mumbai", "pune", "ahmedabad", "jaipur", "surat", "nagpur"],
    climate_type: "arid_semi_arid",
    crops: [
      {
        crop_name: "Cotton",
        category: "cash_crops",
        season: "Kharif",
        temperature_min: 25,
        temperature_max: 38,
        humidity_min: 40,
        humidity_max: 70,
        water_requirement_mm: 600,
        growth_period_days: 180,
        expected_yield_kg_per_acre: 1500,
        market_price_rs_per_kg: 75,
        profit_margin_percent: 48,
        description: "White gold, major cash crop for western India"
      },
      {
        crop_name: "Soybean",
        category: "oilseeds",
        season: "Kharif",
        temperature_min: 25,
        temperature_max: 35,
        humidity_min: 50,
        humidity_max: 75,
        water_requirement_mm: 450,
        growth_period_days: 100,
        expected_yield_kg_per_acre: 1000,
        market_price_rs_per_kg: 45,
        profit_margin_percent: 40,
        description: "Protein-rich oilseed with growing demand"
      },
      {
        crop_name: "Groundnut",
        category: "oilseeds",
        season: "Kharif",
        temperature_min: 25,
        temperature_max: 38,
        humidity_min: 45,
        humidity_max: 70,
        water_requirement_mm: 500,
        growth_period_days: 110,
        expected_yield_kg_per_acre: 1300,
        market_price_rs_per_kg: 55,
        profit_margin_percent: 44,
        description: "Drought-tolerant oilseed crop"
      },
      {
        crop_name: "Grapes",
        category: "fruits",
        season: "Annual",
        temperature_min: 20,
        temperature_max: 35,
        humidity_min: 40,
        humidity_max: 65,
        water_requirement_mm: 800,
        growth_period_days: 365,
        expected_yield_kg_per_acre: 10000,
        market_price_rs_per_kg: 60,
        profit_margin_percent: 65,
        description: "High-value fruit crop for wine and table use"
      },
      {
        crop_name: "Onion",
        category: "vegetables",
        season: "Rabi",
        temperature_min: 20,
        temperature_max: 30,
        humidity_min: 45,
        humidity_max: 70,
        water_requirement_mm: 400,
        growth_period_days: 120,
        expected_yield_kg_per_acre: 15000,
        market_price_rs_per_kg: 25,
        profit_margin_percent: 50,
        description: "Essential vegetable with year-round demand"
      },
      {
        crop_name: "Bajra (Pearl Millet)",
        category: "grains",
        season: "Kharif",
        temperature_min: 25,
        temperature_max: 40,
        humidity_min: 35,
        humidity_max: 65,
        water_requirement_mm: 300,
        growth_period_days: 85,
        expected_yield_kg_per_acre: 1200,
        market_price_rs_per_kg: 22,
        profit_margin_percent: 35,
        description: "Drought-resistant grain for arid regions"
      }
    ]
  },

  "central": {
    region_keywords: ["madhya pradesh", "chhattisgarh", "bhopal", "indore", "raipur", "jabalpur", "gwalior"],
    climate_type: "subtropical",
    crops: [
      {
        crop_name: "Wheat",
        category: "grains",
        season: "Rabi",
        temperature_min: 20,
        temperature_max: 28,
        humidity_min: 50,
        humidity_max: 75,
        water_requirement_mm: 400,
        growth_period_days: 120,
        expected_yield_kg_per_acre: 2200,
        market_price_rs_per_kg: 22,
        profit_margin_percent: 38,
        description: "Major Rabi cereal crop"
      },
      {
        crop_name: "Gram (Chickpea)",
        category: "pulses",
        season: "Rabi",
        temperature_min: 18,
        temperature_max: 28,
        humidity_min: 45,
        humidity_max: 70,
        water_requirement_mm: 300,
        growth_period_days: 110,
        expected_yield_kg_per_acre: 1000,
        market_price_rs_per_kg: 60,
        profit_margin_percent: 50,
        description: "Important pulse crop for protein"
      },
      {
        crop_name: "Soybean",
        category: "oilseeds",
        season: "Kharif",
        temperature_min: 25,
        temperature_max: 35,
        humidity_min: 50,
        humidity_max: 75,
        water_requirement_mm: 450,
        growth_period_days: 100,
        expected_yield_kg_per_acre: 1100,
        market_price_rs_per_kg: 45,
        profit_margin_percent: 42,
        description: "Major oilseed crop of central India"
      },
      {
        crop_name: "Maize",
        category: "grains",
        season: "Kharif",
        temperature_min: 22,
        temperature_max: 32,
        humidity_min: 55,
        humidity_max: 75,
        water_requirement_mm: 500,
        growth_period_days: 100,
        expected_yield_kg_per_acre: 2300,
        market_price_rs_per_kg: 18,
        profit_margin_percent: 40,
        description: "Versatile Kharif crop"
      },
      {
        crop_name: "Garlic",
        category: "vegetables",
        season: "Rabi",
        temperature_min: 15,
        temperature_max: 25,
        humidity_min: 50,
        humidity_max: 70,
        water_requirement_mm: 350,
        growth_period_days: 120,
        expected_yield_kg_per_acre: 4000,
        market_price_rs_per_kg: 40,
        profit_margin_percent: 60,
        description: "High-value spice vegetable"
      },
      {
        crop_name: "Coriander",
        category: "spices",
        season: "Rabi",
        temperature_min: 18,
        temperature_max: 28,
        humidity_min: 45,
        humidity_max: 65,
        water_requirement_mm: 300,
        growth_period_days: 100,
        expected_yield_kg_per_acre: 600,
        market_price_rs_per_kg: 120,
        profit_margin_percent: 70,
        description: "Aromatic spice with high market value"
      }
    ]
  },

  "northeast": {
    region_keywords: ["assam", "meghalaya", "manipur", "tripura", "mizoram", "nagaland", "arunachal pradesh", "shillong", "imphal", "agartala"],
    climate_type: "humid_subtropical_highland",
    crops: [
      {
        crop_name: "Tea",
        category: "plantation",
        season: "Annual",
        temperature_min: 18,
        temperature_max: 28,
        humidity_min: 75,
        humidity_max: 95,
        water_requirement_mm: 2500,
        growth_period_days: 365,
        expected_yield_kg_per_acre: 1800,
        market_price_rs_per_kg: 300,
        profit_margin_percent: 60,
        description: "World-famous Assam tea, premium quality"
      },
      {
        crop_name: "Areca Nut",
        category: "plantation",
        season: "Annual",
        temperature_min: 22,
        temperature_max: 32,
        humidity_min: 70,
        humidity_max: 90,
        water_requirement_mm: 2000,
        growth_period_days: 365,
        expected_yield_kg_per_acre: 2000,
        market_price_rs_per_kg: 180,
        profit_margin_percent: 55,
        description: "Traditional plantation crop of NE India"
      },
      {
        crop_name: "Rice",
        category: "grains",
        season: "Kharif",
        temperature_min: 22,
        temperature_max: 32,
        humidity_min: 70,
        humidity_max: 90,
        water_requirement_mm: 1600,
        growth_period_days: 140,
        expected_yield_kg_per_acre: 2500,
        market_price_rs_per_kg: 25,
        profit_margin_percent: 35,
        description: "Staple food crop, various indigenous varieties"
      },
      {
        crop_name: "Ginger",
        category: "spices",
        season: "Kharif",
        temperature_min: 20,
        temperature_max: 30,
        humidity_min: 70,
        humidity_max: 90,
        water_requirement_mm: 1500,
        growth_period_days: 240,
        expected_yield_kg_per_acre: 8000,
        market_price_rs_per_kg: 50,
        profit_margin_percent: 65,
        description: "High-quality organic ginger production"
      },
      {
        crop_name: "Turmeric",
        category: "spices",
        season: "Kharif",
        temperature_min: 20,
        temperature_max: 30,
        humidity_min: 65,
        humidity_max: 85,
        water_requirement_mm: 1200,
        growth_period_days: 240,
        expected_yield_kg_per_acre: 2800,
        market_price_rs_per_kg: 95,
        profit_margin_percent: 68,
        description: "Lakadong turmeric, world's highest curcumin content"
      },
      {
        crop_name: "Pineapple",
        category: "fruits",
        season: "Annual",
        temperature_min: 22,
        temperature_max: 32,
        humidity_min: 65,
        humidity_max: 85,
        water_requirement_mm: 1200,
        growth_period_days: 540,
        expected_yield_kg_per_acre: 30000,
        market_price_rs_per_kg: 30,
        profit_margin_percent: 55,
        description: "Sweet variety, high demand in mainland India"
      }
    ]
  }
};

function determineZone(regionName) {
  if (!regionName) return null;

  const normalizedRegion = regionName.toLowerCase();

  for (const [zone, data] of Object.entries(ZONE_BASED_CROP_DATA)) {
    for (const keyword of data.region_keywords) {
      if (normalizedRegion.includes(keyword)) {
        return zone;
      }
    }
  }

  return 'north';
}

function getCropsForZone(regionName, weatherData = null) {
  const zone = determineZone(regionName);

  if (!zone || !ZONE_BASED_CROP_DATA[zone]) {
    console.warn(`No crop data found for zone: ${zone}, using default`);
    return ZONE_BASED_CROP_DATA["north"].crops;
  }

  const zoneData = ZONE_BASED_CROP_DATA[zone];
  let crops = [...zoneData.crops];

  if (weatherData) {
    const { temperature, humidity, rainfall } = weatherData;

    crops = crops.map(crop => {
      let suitabilityScore = 100;

      if (temperature < crop.temperature_min || temperature > crop.temperature_max) {
        suitabilityScore -= 40;
      } else {
        const tempRange = crop.temperature_max - crop.temperature_min || 1;
        const tempOptimal = (crop.temperature_min + crop.temperature_max) / 2;
        const tempDeviation = Math.abs(temperature - tempOptimal);
        suitabilityScore -= (tempDeviation / tempRange) * 20;
      }

      if (humidity < crop.humidity_min || humidity > crop.humidity_max) {
        suitabilityScore -= 30;
      } else {
        const humidityRange = crop.humidity_max - crop.humidity_min || 1;
        const humidityOptimal = (crop.humidity_min + crop.humidity_max) / 2;
        const humidityDeviation = Math.abs(humidity - humidityOptimal);
        suitabilityScore -= (humidityDeviation / humidityRange) * 15;
      }

      const waterDeviation = Math.abs(rainfall - crop.water_requirement_mm);
      const waterScore = Math.max(0, 30 - (waterDeviation / 100));
      suitabilityScore -= (30 - waterScore);

      return {
        ...crop,
        suitability_score: Math.round(suitabilityScore),
        zone: zone,
        climate_type: zoneData.climate_type
      };
    });

    crops.sort((a, b) => b.suitability_score - a.suitability_score);
  } else {

    crops = crops.map(crop => ({
      ...crop,
      zone: zone,
      climate_type: zoneData.climate_type,
      suitability_score: null
    }));
  }

  return crops;
}

function getAvailableZones() {
  return Object.keys(ZONE_BASED_CROP_DATA);
}

function getRegionKeywordsForZone(zone) {
  return ZONE_BASED_CROP_DATA[zone]?.region_keywords || [];
}

module.exports = {
  ZONE_BASED_CROP_DATA,
  determineZone,
  getCropsForZone,
  getAvailableZones,
  getRegionKeywordsForZone
};
