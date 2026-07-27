export interface WeatherData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  currentTemp: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  weatherCode: number;
  weatherDescription: string;
  tempMax: number;
  tempMin: number;
  humidityMax: number;
  humidityMin: number;
}

export interface PathogenRisk {
  id: string;
  name: string;
  category: 'maladie' | 'ravageur' | 'physiologique';
  riskLevel: 'Élevé' | 'Modéré' | 'Faible';
  score: number; // 0 - 100
  conditionExplanation: string;
  preventiveAction: string;
  reportSentence: string;
}

// Map WMO weather codes to French descriptions
export const getWeatherDescription = (code: number): string => {
  switch (code) {
    case 0:
      return 'Ciel dégagé / Ensoleillé';
    case 1:
      return 'Principalement dégagé';
    case 2:
      return 'Partiellement nuageux';
    case 3:
      return 'Couvert';
    case 45:
    case 48:
      return 'Brouillard persistant';
    case 51:
    case 53:
    case 55:
      return 'Bruine légère à modérée';
    case 61:
    case 63:
    case 65:
      return 'Pluie continue';
    case 80:
    case 81:
    case 82:
      return 'Averses de pluie';
    case 95:
    case 96:
    case 99:
      return 'Orageux avec risque de grêle';
    default:
      return 'Conditions variables';
  }
};

// Search coordinates for city
export async function searchLocation(query: string): Promise<{ name: string; country: string; lat: number; lon: number }[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=fr`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results) return [];
    return data.results.map((r: any) => ({
      name: r.name,
      country: r.country || r.country_code || '',
      lat: r.latitude,
      lon: r.longitude,
    }));
  } catch (err) {
    console.error('Error fetching geocoding data:', err);
    return [];
  }
}

// Fetch current & daily weather from Open-Meteo
export async function fetchWeatherData(lat: number, lon: number, cityName: string = ''): Promise<WeatherData | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,relative_humidity_2m_min,precipitation_sum&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    const current = data.current || {};
    const daily = data.daily || {};

    return {
      city: cityName || 'Zone Agricole',
      country: '',
      latitude: lat,
      longitude: lon,
      currentTemp: Math.round(current.temperature_2m ?? 22),
      humidity: Math.round(current.relative_humidity_2m ?? 65),
      windSpeed: Math.round(current.wind_speed_10m ?? 12),
      precipitation: current.precipitation ?? 0,
      weatherCode: current.weather_code ?? 0,
      weatherDescription: getWeatherDescription(current.weather_code ?? 0),
      tempMax: Math.round(daily.temperature_2m_max?.[0] ?? current.temperature_2m ?? 25),
      tempMin: Math.round(daily.temperature_2m_min?.[0] ?? current.temperature_2m ?? 15),
      humidityMax: Math.round(daily.relative_humidity_2m_max?.[0] ?? current.relative_humidity_2m ?? 80),
      humidityMin: Math.round(daily.relative_humidity_2m_min?.[0] ?? current.relative_humidity_2m ?? 40),
    };
  } catch (err) {
    console.error('Error fetching weather data:', err);
    return null;
  }
}

// Analyze agronomic risks based on weather conditions and crop type
export function analyzeAgronomicRisks(weather: WeatherData, cropType?: string): PathogenRisk[] {
  const risks: PathogenRisk[] = [];
  const { currentTemp, humidity, precipitation, humidityMax, tempMax, tempMin, windSpeed } = weather;

  const cropLower = (cropType || '').toLowerCase();
  const isBerry = cropLower.includes('framboisier') || cropLower.includes('fraise') || cropLower.includes('myrtille');
  const isTomato = cropLower.includes('tomate') || cropLower.includes('poivron') || cropLower.includes('aubergine');
  const isCitrus = cropLower.includes('agrumes') || cropLower.includes('cémentine') || cropLower.includes('orange');

  // 1. Botrytis cinerea (Moisissure grise)
  // Conditions: High RH (> 75%) & mild temp (15°C - 24°C) or recent rain
  let botrytisScore = 20;
  if (humidityMax >= 80 || humidity >= 75) botrytisScore += 35;
  if (currentTemp >= 14 && currentTemp <= 24) botrytisScore += 25;
  if (precipitation > 0.5) botrytisScore += 20;
  if (isBerry) botrytisScore += 10; // Extra vulnerable

  risks.push({
    id: 'botrytis',
    name: 'Botrytis cinerea (Moisissure Grise)',
    category: 'maladie',
    score: Math.min(botrytisScore, 98),
    riskLevel: botrytisScore >= 70 ? 'Élevé' : botrytisScore >= 45 ? 'Modéré' : 'Faible',
    conditionExplanation: `Forte hygrométrie (${humidity}%) et températures douces (${currentTemp}°C) propices à la sporulation sur fleurs et fruits.`,
    preventiveAction: 'Aérer les serres en matinée pour réduire l\'humidité relative et appliquer un fongicide préventif bio/spécifique si floraison en cours.',
    reportSentence: `Conditions microclimatiques (${humidity}% d'humidité, ${currentTemp}°C) hautement favorables au risque de Botrytis cinerea. Une ventilation active des abris et une vigilance accrue sur les fruits mûrs sont vivement préconisées.`,
  });

  // 2. Oïdium (Erysiphe / Podosphaera)
  // Conditions: Warm (18°C - 28°C), moderate/high RH, low rainfall
  let oidiumScore = 20;
  if (currentTemp >= 18 && currentTemp <= 28) oidiumScore += 35;
  if (humidity >= 60 && humidity <= 85) oidiumScore += 30;
  if (precipitation === 0) oidiumScore += 15;

  risks.push({
    id: 'oidium',
    name: 'Oïdium / Blanc de la feuille',
    category: 'maladie',
    score: Math.min(oidiumScore, 95),
    riskLevel: oidiumScore >= 70 ? 'Élevé' : oidiumScore >= 45 ? 'Modéré' : 'Faible',
    conditionExplanation: `Amplitude thermique et humidité modérée sans pluie de lavage (${currentTemp}°C, HR ${humidity}%) favorisant le mycélium.`,
    preventiveAction: 'Appliquer un traitement à base de soufre ou d\'hydrogénocarbonate et surveiller la face inférieure des jeunes feuilles.',
    reportSentence: `Pression Oïdium en hausse sous l'effet des conditions thermiques douces (${currentTemp}°C) et de l'absence de précipitations. Traitement de couverture recommandé sur jeunes pousses.`,
  });

  // 3. Acariens Rouges (Tetranychus urticae)
  // Conditions: Hot (> 26°C) & dry (RH < 55%)
  let acarienScore = 15;
  if (tempMax >= 26 || currentTemp >= 26) acarienScore += 40;
  if (humidity <= 55) acarienScore += 35;
  if (windSpeed > 15) acarienScore += 10; // Spread by wind

  risks.push({
    id: 'acariens',
    name: 'Acariens Rouges (Tetranychus urticae)',
    category: 'ravageur',
    score: Math.min(acarienScore, 95),
    riskLevel: acarienScore >= 65 ? 'Élevé' : acarienScore >= 40 ? 'Modéré' : 'Faible',
    conditionExplanation: `Températures élevées (${tempMax}°C max) et air sec (${humidity}% HR) accélérant le cycle de reproduction des acariens.`,
    preventiveAction: 'Humidifier les allées, lâcher Phytoseiulus persimilis si auxiliaires utilisés, et contrôler les foyers en bordure de serre.',
    reportSentence: `Climat chaud et sec (${tempMax}°C, HR ${humidity}%) accélérant le développement des acariens rouges. Renforcer les comptages sur feuilles âgées et humidifier le sol des abris.`,
  });

  // 4. Mildiou (Phytophthora / Plasmopara)
  // Conditions: Precip > 0 or RH > 85%, temp 12°C - 23°C
  let mildiouScore = 10;
  if (precipitation > 0) mildiouScore += 45;
  if (humidityMax >= 85) mildiouScore += 30;
  if (currentTemp >= 12 && currentTemp <= 22) mildiouScore += 20;
  if (isTomato) mildiouScore += 10;

  risks.push({
    id: 'mildiou',
    name: 'Mildiou (Phytophthora / Plasmopara)',
    category: 'maladie',
    score: Math.min(mildiouScore, 95),
    riskLevel: mildiouScore >= 65 ? 'Élevé' : mildiouScore >= 40 ? 'Modéré' : 'Faible',
    conditionExplanation: `Humidité saturante ou présence de mouillure foliaire (${precipitation}mm pluie) déclenchant la germination des zoospores.`,
    preventiveAction: 'Protéger la végétation avec un cuivre ou fongicide systémique adapté dès la fin de l\'épisode pluvieux.',
    reportSentence: `Risque de Mildiou activé suite à la forte baisse du déficit de saturation (${humidity}% HR, précipitations). Application fongicide préventive recommandée dès ressuyage du feuillage.`,
  });

  // 5. Thrips & Pucerons (Vecteurs de virus)
  // Conditions: Temp 20 - 30°C, wind speed > 10 km/h (flight vector)
  let thripsScore = 20;
  if (currentTemp >= 20 && currentTemp <= 30) thripsScore += 35;
  if (windSpeed >= 10 && windSpeed <= 25) thripsScore += 25;
  if (isBerry || isTomato || isCitrus) thripsScore += 10;

  risks.push({
    id: 'thrips',
    name: 'Thrips & Pucerons (Pression de vol)',
    category: 'ravageur',
    score: Math.min(thripsScore, 90),
    riskLevel: thripsScore >= 65 ? 'Élevé' : thripsScore >= 40 ? 'Modéré' : 'Faible',
    conditionExplanation: `Activité de vol intense sous températures douces (${currentTemp}°C) favorisant l'infestation des fleurs et la transmission virale.`,
    preventiveAction: 'Installer/relever les panneaux pièges bleus/jaunes et surveiller les fleurs ouvertes.',
    reportSentence: `Températures printanières/estivales (${currentTemp}°C) favorables au vol des thrips et pucerons. Renouveler le suivi des plaques chromotropiques jaunes et bleues.`,
  });

  // Sort by highest risk score
  return risks.sort((a, b) => b.score - a.score);
}
