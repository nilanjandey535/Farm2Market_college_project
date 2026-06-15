// backend/routes/weather.js

const express = require("express");
const pool = require("../db");
const router = express.Router();
const axios = require("axios");

const WEATHER_API_BASE = "https://api.open-meteo.com/v1/forecast";

async function fetchDetailedWeatherAndSoil(latitude, longitude) {
  try {
    console.log(`\n[DATA-COLLECTION] Fetching detailed data for Lat: ${latitude}, Lon: ${longitude}`);

    const weatherUrl = `https://api.open-meteo.com/v1/forecast`;
    const weatherParams = {
      latitude: latitude,
      longitude: longitude,
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
      hourly: 'relative_humidity_2m,wind_speed_10m,soil_temperature_0cm,soil_moisture_0_to_1cm,shortwave_radiation',
      forecast_days: 16,
      timezone: 'auto'
    };

    let wData = null;
    try {
      console.log(`[DATA-COLLECTION] Calling Open-Meteo Forecast API...`);
      const weatherResponse = await axios.get(weatherUrl, { params: weatherParams, timeout: 10000 });
      wData = weatherResponse.data;
    } catch (wErr) {
      console.error(`[DATA-COLLECTION] Open-Meteo Error:`, wErr.message);
      throw new Error("Weather service is currently unavailable.");
    }

    if (!wData || !wData.daily || !wData.hourly) {
      throw new Error("Invalid response from weather service.");
    }

    let sData = null;
    try {
      const soilUrl = `https://rest.isric.org/soilgrids/v2.0/properties/query`;
      const soilParams = {
        lat: latitude,
        lon: longitude,
        property: ['phh2o', 'sand', 'clay', 'silt', 'soc'],
        depth: '0-5cm',
        value: 'mean'
      };

      console.log(`[DATA-COLLECTION] Calling ISRIC SoilGrids API...`);
      const soilResponse = await axios.get(soilUrl, { params: soilParams, timeout: 15000 });
      sData = soilResponse.data;
    } catch (sErr) {
      console.warn(`[DATA-COLLECTION] SoilGrids Error (Continuing without soil data):`, sErr.message);

    }

    const calcAvg = (arr) => arr && Array.isArray(arr) && arr.length ? arr.reduce((a, b) => (a || 0) + (b || 0), 0) / arr.length : 0;

    const avg_temp_max = calcAvg(wData.daily.temperature_2m_max);
    const avg_temp_min = calcAvg(wData.daily.temperature_2m_min);
    const avg_temp = (avg_temp_max + avg_temp_min) / 2;
    const avg_rainfall = calcAvg(wData.daily.precipitation_sum);

    const avg_humidity = calcAvg(wData.hourly.relative_humidity_2m);
    const avg_wind_speed = calcAvg(wData.hourly.wind_speed_10m);
    const avg_soil_temperature = calcAvg(wData.hourly.soil_temperature_0cm);
    const avg_soil_moisture = calcAvg(wData.hourly.soil_moisture_0_to_1cm);
    const avg_solar_radiation = calcAvg(wData.hourly.shortwave_radiation);

    const findSoilProp = (prop) => {
      if (!sData || !sData.properties || !sData.properties.layers) return null;
      const p = sData.properties.layers.find(l => l.name === prop);
      if (!p || !p.depths || p.depths.length === 0) return null;

      const values = p.depths[0].values;
      const val = values.mean !== undefined && values.mean !== null ? values.mean : values.q50;
      return val !== undefined && val !== null ? val / 10 : null;
    };

    const ph = findSoilProp('phh2o');
    const sand = findSoilProp('sand');
    const clay = findSoilProp('clay');
    const silt = findSoilProp('silt');
    const organic_carbon = findSoilProp('soc');

    const daily_dates = wData.daily.time || [];
    const daily_temp_max = wData.daily.temperature_2m_max || [];
    const daily_temp_min = wData.daily.temperature_2m_min || [];
    const daily_precip = wData.daily.precipitation_sum || [];

    console.log('=========================================================');
    console.log(`[RESULTS] 16-Day Forecast & Soil Data:`);
    console.log(`  - Avg Temperature:      ${avg_temp.toFixed(2)}°C`);
    console.log(`  - Avg Rainfall:         ${avg_rainfall.toFixed(2)} mm`);
    console.log(`  - Avg Humidity:         ${avg_humidity.toFixed(2)}%`);
    console.log(`  - Soil pH:              ${ph ? ph.toFixed(1) : 'N/A'}`);
    console.log('=========================================================');

    return {
      weather: {
        avg_temp,
        avg_rainfall,
        avg_humidity,
        avg_wind_speed,
        avg_soil_temperature,
        avg_soil_moisture,
        avg_solar_radiation,
        daily_raw: wData.daily,
        hourly_raw: wData.hourly
      },
      soil: {
        ph, sand, clay, silt, organic_carbon
      }
    };
  } catch (err) {
    console.error(`[DATA-COLLECTION] Fatal Error:`, err.message);
    return null;
  }
}

function calculateCropSuitability(crop, envData) {
  const { weather, soil } = envData;

  const WEIGHT_WEATHER = 0.4;
  const WEIGHT_SOIL = 0.3;
  const WEIGHT_PROFIT = 0.3;

  const estimated_monthly_rainfall = weather.avg_rainfall * 30;

  const soil_moisture_percent = weather.avg_soil_moisture * 100;

  const organic_carbon_percent = soil.organic_carbon ? soil.organic_carbon / 10 : null;

  let weatherScore = 0;
  let weatherPossible = 0;

  const checkFuzzyRange = (val, min, max, weight, label) => {

    if (min == null || max == null) return 0;

    weatherPossible += weight;
    const value = Number(val);
    const minVal = Number(min);
    const maxVal = Number(max);

    if (value >= minVal && value <= maxVal) {
      return weight;
    }

    const range = maxVal - minVal;
    const margin = Math.max(range * 0.25, 2);

    if (value >= (minVal - margin) && value <= (maxVal + margin)) {
      return weight * 0.5;
    }

    return 0;
  };

  weatherScore += checkFuzzyRange(weather.avg_temp, crop.min_temperature, crop.max_temperature, 30, 'Temp');
  weatherScore += checkFuzzyRange(estimated_monthly_rainfall, crop.min_rainfall, crop.max_rainfall, 25, 'Rain');
  weatherScore += checkFuzzyRange(weather.avg_humidity, crop.min_humidity, crop.max_humidity, 10, 'Humid');
  weatherScore += checkFuzzyRange(weather.avg_wind_speed, crop.min_wind_speed, crop.max_wind_speed, 5, 'Wind');
  weatherScore += checkFuzzyRange(weather.avg_solar_radiation, crop.min_solar_radiation, crop.max_solar_radiation, 5, 'Solar');

  const finalWeatherSuitability = weatherPossible > 0 ? (weatherScore / weatherPossible) * 100 : 100;

  let soilScore = 0;
  let soilPossible = 0;

  const checkSoil = (val, min, max, weight) => {
    if (min == null || max == null || val == null) return 0;
    soilPossible += weight;
    const value = Number(val);
    if (value >= Number(min) && value <= Number(max)) return weight;

    const range = Number(max) - Number(min);
    const margin = Math.max(range * 0.2, 0.5);
    if (value >= (Number(min) - margin) && value <= (Number(max) + margin)) return weight * 0.5;

    return 0;
  };

  soilScore += checkSoil(soil.ph, crop.min_ph, crop.max_ph, 20);
  soilScore += checkSoil(soil_moisture_percent, crop.min_soil_moisture, crop.max_soil_moisture, 15);
  soilScore += checkSoil(weather.avg_soil_temperature, crop.min_soil_temperature, crop.max_soil_temperature, 10);

  const checkComp = (val, min, max) => {
    if (min == null || max == null || val == null) return 0;
    soilPossible += 5;
    if (val >= Number(min) && val <= Number(max)) return 5;

    if (val >= (Number(min) - 5) && val <= (Number(max) + 5)) return 2.5;
    return 0;
  };

  soilScore += checkComp(soil.sand, crop.min_sand_percent, crop.max_sand_percent);
  soilScore += checkComp(soil.clay, crop.min_clay_percent, crop.max_clay_percent);
  soilScore += checkComp(soil.silt, crop.min_silt_percent, crop.max_silt_percent);
  soilScore += checkComp(organic_carbon_percent, crop.min_organic_carbon, crop.max_organic_carbon);

  const finalSoilSuitability = soilPossible > 0 ? (soilScore / soilPossible) * 100 : 100;

  const revenue = (Number(crop.expected_yield_per_acre) || 0) * (Number(crop.average_market_price) || 0);

  const profitabilityScore = revenue > 0 ? Math.min((revenue / 150000) * 100, 100) : 50;

  const finalScore = (finalWeatherSuitability * WEIGHT_WEATHER) +
                     (finalSoilSuitability * WEIGHT_SOIL) +
                     (profitabilityScore * WEIGHT_PROFIT);

  console.log(`[ANALYSIS] "${crop.crop_name}": ${finalScore.toFixed(1)}% | W:${finalWeatherSuitability.toFixed(0)} S:${finalSoilSuitability.toFixed(0)} P:${profitabilityScore.toFixed(0)}`);
  if (finalScore < 35) {

    if (finalScore > 20) {
      console.log(`  - Details: Rain:${estimated_monthly_rainfall.toFixed(0)}/${crop.min_rainfall}-${crop.max_rainfall}, Moist:${soil_moisture_percent.toFixed(0)}/${crop.min_soil_moisture}-${crop.max_soil_moisture}, OC:${organic_carbon_percent ? organic_carbon_percent.toFixed(2) : 'N/A'}/${crop.min_organic_carbon}-${crop.max_organic_carbon}`);
    }
  }

  return {
    crop_name: crop.crop_name,
    crop_details: crop.crop_details,
    final_score: finalScore,
    weather_suitability: finalWeatherSuitability,
    soil_suitability: finalSoilSuitability,
    profitability: profitabilityScore,
    expected_revenue: revenue,
    duration: crop.crop_duration_days,
    season: crop.growing_season,
    market_demand: crop.market_demand
  };
}

router.get("/detailed/:farmer_id", async (req, res) => {
  try {
    const farmerId = req.params.farmer_id;
    console.log(`[WEATHER-ROUTE] Fetching detailed weather for farmer: ${farmerId}`);

    const addrResult = await pool.query(
      `SELECT latitude, longitude, city, district, country
       FROM farmer_address
       WHERE farmer_id = $1 AND status = 'selected'
       LIMIT 1`,
      [farmerId]
    );

    if (addrResult.rows.length === 0 || !addrResult.rows[0].latitude) {
      console.warn(`[WEATHER-ROUTE] No selected address found for farmer ${farmerId}`);
      return res.json({
        no_address: true,
        message: "Please add your address/pincode to view weather-based crop suggestions."
      });
    }

    const { latitude, longitude } = addrResult.rows[0];
    console.log(`[WEATHER-ROUTE] Farmer ${farmerId} location: ${latitude}, ${longitude}`);

    const detailedData = await fetchDetailedWeatherAndSoil(latitude, longitude);

    if (!detailedData) {
      console.error(`[WEATHER-ROUTE] fetchDetailedWeatherAndSoil returned null for farmer ${farmerId}`);
      return res.status(500).json({ error: "Failed to fetch detailed environmental data. External weather services may be down." });
    }

    console.log(`[WEATHER-ROUTE] Fetching crop suggestions from DB...`);
    const cropsResult = await pool.query('SELECT * FROM crop_suggestion');
    const allCrops = cropsResult.rows;
    console.log(`[WEATHER-ROUTE] Scoring ${allCrops.length} crops...`);

    const suggestions = allCrops
      .map(crop => {
        try {
          return calculateCropSuitability(crop, detailedData);
        } catch (err) {
          console.error(`[WEATHER-ROUTE] Error scoring crop ${crop.crop_name}:`, err.message);
          return null;
        }
      })
      .filter(s => s !== null && s.final_score >= 35)
      .sort((a, b) => b.final_score - a.final_score);

    console.log(`[WEATHER-ROUTE] Found ${suggestions.length} suitable crops`);

    res.json({
      weather: detailedData.weather,
      soil: detailedData.soil,
      suggested_crops: suggestions
    });
  } catch (error) {
    console.error("Error in detailed weather route:", error);
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
});

module.exports = router;
