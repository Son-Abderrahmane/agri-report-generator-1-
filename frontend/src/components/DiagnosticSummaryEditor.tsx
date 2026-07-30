import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Sparkles,
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  MapPin,
  Search,
  AlertTriangle,
  Bug,
  Plus,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Check,
  ShieldAlert,
  Compass,
} from 'lucide-react';
import {
  WeatherData,
  PathogenRisk,
  fetchWeatherData,
  searchLocation,
  analyzeAgronomicRisks,
} from '../services/weatherService';

interface DiagnosticSummaryEditorProps {
  summary: string;
  onChange: (value: string) => void;
  farmLocation?: string;
  cropType?: string;
}

const QUICK_PHRASES = [
  'Etat sanitaire globalement satisfaisant.',
  'Développement végétatif très vigoureux.',
  'Attaque d\'acariens rouges localisée en bordure de serre.',
  'Pression oïdium en hausse due aux écarts de température.',
  'Ajustement recommandé du drainage & conductivité EC.',
  'Début de nouaison homogène sur les premiers bouquets.',
];

const PRESET_REGIONS = [
  { name: 'Agadir (Souss)', lat: 30.4278, lon: -9.5981 },
  { name: 'Larache (Loukkos)', lat: 35.1932, lon: -6.1557 },
  { name: 'Berkane (Moulouya)', lat: 34.92, lon: -2.32 },
  { name: 'Meknès (Saïss)', lat: 33.8935, lon: -5.5473 },
  { name: 'Dakhla', lat: 23.6848, lon: -15.9579 },
  { name: 'Marrakech', lat: 31.6295, lon: -7.9811 },
];

export const DiagnosticSummaryEditor: React.FC<DiagnosticSummaryEditorProps> = ({
  summary,
  onChange,
  farmLocation,
  cropType,
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [risks, setRisks] = useState<PathogenRisk[]>([]);
  const [dbFormulas, setDbFormulas] = useState<any[]>([]);
  const [dbEvaluations, setDbEvaluations] = useState<PathogenRisk[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(farmLocation || 'Agadir');
  const [searchResults, setSearchResults] = useState<{ name: string; country: string; lat: number; lon: number }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showWeatherPanel, setShowWeatherPanel] = useState(true);
  const [insertedAlerts, setInsertedAlerts] = useState<Record<string, boolean>>({});

  // Auto-fetch weather on mount or when location changes
  useEffect(() => {
    const defaultLoc = farmLocation && farmLocation.trim() !== '' ? farmLocation : 'Agadir';
    handleSearchAndFetch(defaultLoc);

    // Fetch master data
    // @ts-ignore
    const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
    const token = localStorage.getItem('agri_admin_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    fetch(`${API_BASE}/quick-formulas`, { headers })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setDbFormulas(d); })
      .catch(e => console.error(e));

    fetch(`${API_BASE}/evaluation-templates`, { headers })
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) {
          const formatted = d.map((ev: any) => ({
            id: `eval_${ev.id}`,
            name: ev.name,
            riskLevel: ev.risk_level,
            score: 100,
            conditionExplanation: ev.condition_explanation || '',
            preventiveAction: ev.preventive_action || '',
            reportSentence: ev.report_sentence || ''
          }));
          setDbEvaluations(formatted);
        }
      })
      .catch(e => console.error(e));

  }, [farmLocation]);

  const handleSearchAndFetch = async (query: string) => {
    setIsLoading(true);
    try {
      const results = await searchLocation(query);
      if (results.length > 0) {
        const first = results[0];
        const data = await fetchWeatherData(first.lat, first.lon, first.name);
        if (data) {
          setWeather(data);
          const analyzed = analyzeAgronomicRisks(data, cropType);
          setRisks(analyzed);
        }
      } else {
        // Fallback to Agadir coordinates
        const fallback = PRESET_REGIONS[0];
        const data = await fetchWeatherData(fallback.lat, fallback.lon, query || fallback.name);
        if (data) {
          setWeather(data);
          setRisks(analyzeAgronomicRisks(data, cropType));
        }
      }
    } catch (e) {
      console.error('Weather load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = async (preset: { name: string; lat: number; lon: number }) => {
    setSearchQuery(preset.name);
    setIsLoading(true);
    setSearchResults([]);
    try {
      const data = await fetchWeatherData(preset.lat, preset.lon, preset.name);
      if (data) {
        setWeather(data);
        setRisks(analyzeAgronomicRisks(data, cropType));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQueryInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length >= 2) {
      setIsSearching(true);
      const res = await searchLocation(val);
      setSearchResults(res);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectSearchResult = async (item: { name: string; country: string; lat: number; lon: number }) => {
    const displayName = `${item.name}${item.country ? `, ${item.country}` : ''}`;
    setSearchQuery(displayName);
    setSearchResults([]);
    setIsLoading(true);
    try {
      const data = await fetchWeatherData(item.lat, item.lon, displayName);
      if (data) {
        setWeather(data);
        setRisks(analyzeAgronomicRisks(data, cropType));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur.');
      return;
    }
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const data = await fetchWeatherData(latitude, longitude, 'Ma Position');
        if (data) {
          setSearchQuery('Ma Position GPS');
          setWeather(data);
          setRisks(analyzeAgronomicRisks(data, cropType));
        }
        setIsLoading(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        alert('Impossible de récupérer la position GPS actuelle.');
        setIsLoading(false);
      }
    );
  };

  const appendPhrase = (phrase: string) => {
    if (!summary) {
      onChange(phrase);
    } else {
      onChange(`${summary} ${phrase}`);
    }
  };

  const handleInsertFullWeatherAnalysis = () => {
    if (!weather) return;

    const highRisks = risks.filter((r) => r.riskLevel === 'Élevé');
    const modRisks = risks.filter((r) => r.riskLevel === 'Modéré');

    let paragraph = `[Analyse Météo Régionale - ${weather.city}] : Conditions actuelles (${weather.currentTemp}°C, humidité ${weather.humidity}%, vent ${weather.windSpeed} km/h, ${weather.weatherDescription}). `;

    if (highRisks.length > 0) {
      paragraph += `Alertes sanitaires prioritaires : ${highRisks.map((r) => r.name).join(', ')}. ${highRisks[0].reportSentence} `;
    }

    if (modRisks.length > 0) {
      paragraph += `Vigilance modérée : ${modRisks.map((r) => r.name).join(', ')}. `;
    }

    paragraph += `Actions préventives préconisées : aération contrôlée des serres, suivi de la dynamique du sol et contrôles ciblés sur parcelles à risque.`;

    appendPhrase(paragraph);
  };

  const handleInsertIndividualRisk = (risk: PathogenRisk) => {
    const sentence = risk.reportSentence;
    if (!sentence) return;

    if (insertedAlerts[risk.id]) {
      // Remove sentence
      const updated = summary.replace(sentence, '').replace('  ', ' ').trim();
      onChange(updated);
      setInsertedAlerts((prev) => ({ ...prev, [risk.id]: false }));
    } else {
      // Add sentence
      appendPhrase(sentence);
      setInsertedAlerts((prev) => ({ ...prev, [risk.id]: true }));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#EBE9E1] p-5 sm:p-6 mb-6 transition-all hover:shadow-md">
      {/* Title Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EBE9E1]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-[#E9EDC9] rounded-xl text-[#344E41]">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif italic font-bold text-[#344E41] text-base sm:text-lg">
              3. Bilan Diagnostic & Synthèse Hebdomadaire
            </h3>
            <p className="text-xs text-[#8C8F85]">
              Synthèse générale des observations agronomiques et sanitaires de la visite
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowWeatherPanel(!showWeatherPanel)}
          className="flex items-center space-x-1.5 text-xs font-bold text-[#344E41] bg-[#E9EDC9] hover:bg-[#CCD5AE] px-3 py-1.5 rounded-xl transition-all cursor-pointer border border-[#CCD5AE]"
        >
          <CloudSun className="w-4 h-4 text-[#344E41]" />
          <span className="hidden sm:inline">Module Climat & Pathogènes</span>
          {showWeatherPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Weather & Pathogen Risk Analysis Card */}
      {showWeatherPanel && (
        <div className="mb-5 bg-[#F9F8F5] border border-[#EBE9E1] rounded-2xl p-4 sm:p-5 transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#EBE9E1]">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-[#344E41]" />
              <span className="text-xs font-serif italic font-bold text-[#344E41]">
                Analyse Climatologique & Risques Sanitaires Régionaux
              </span>
            </div>

            {/* Location Selector & Search Input */}
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#8C8F85] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleQueryInputChange}
                  placeholder="Ville ou commune agricole..."
                  className="w-full text-xs bg-white text-[#3D3D3D] border border-[#CCD5AE] rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#344E41] transition-all"
                />

                {/* Auto-complete Search Dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#EBE9E1] rounded-xl shadow-lg z-20 overflow-hidden text-xs">
                    {searchResults.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectSearchResult(item)}
                        className="px-3 py-2 hover:bg-[#E9EDC9] text-[#344E41] cursor-pointer flex items-center justify-between border-b border-[#EBE9E1] last:border-none"
                      >
                        <span className="font-bold">{item.name}</span>
                        <span className="text-[10px] text-[#8C8F85]">{item.country}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleGeolocate}
                title="Utiliser ma position GPS"
                className="p-1.5 bg-white hover:bg-[#E9EDC9] text-[#344E41] border border-[#CCD5AE] rounded-xl transition-all cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleSearchAndFetch(searchQuery)}
                disabled={isLoading}
                className="p-1.5 bg-[#344E41] hover:bg-[#5A6352] text-[#E9EDC9] rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Presets Bar */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-[#8C8F85] mr-1">Régions clés :</span>
            {PRESET_REGIONS.map((pr, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(pr)}
                className={`text-[11px] px-2.5 py-0.5 rounded-lg border transition-all cursor-pointer ${
                  searchQuery.includes(pr.name.split(' ')[0])
                    ? 'bg-[#344E41] text-[#E9EDC9] border-[#344E41] font-bold'
                    : 'bg-white text-[#5A6352] border-[#EBE9E1] hover:bg-[#E9EDC9] hover:text-[#344E41]'
                }`}
              >
                {pr.name}
              </button>
            ))}
          </div>

          {/* Current Live Weather Summary Badge */}
          {isLoading ? (
            <div className="py-8 text-center text-xs text-[#8C8F85] flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#344E41]" />
              <span>Analyse des données station météo en cours...</span>
            </div>
          ) : weather ? (
            <div className="mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-4">
                <div className="bg-white p-3 rounded-xl border border-[#EBE9E1] flex items-center space-x-2.5">
                  <div className="p-2 bg-[#E9EDC9] text-[#344E41] rounded-lg">
                    <Thermometer className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8C8F85] block uppercase font-bold">Température</span>
                    <span className="text-sm font-extrabold text-[#344E41]">
                      {weather.currentTemp}°C
                    </span>
                    <span className="text-[10px] text-[#8C8F85] block">
                      {weather.tempMin}° / {weather.tempMax}°
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#EBE9E1] flex items-center space-x-2.5">
                  <div className="p-2 bg-[#E9EDC9] text-[#344E41] rounded-lg">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8C8F85] block uppercase font-bold">Hygrométrie (HR)</span>
                    <span className="text-sm font-extrabold text-[#344E41]">
                      {weather.humidity}%
                    </span>
                    <span className="text-[10px] text-[#8C8F85] block">
                      Max: {weather.humidityMax}%
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#EBE9E1] flex items-center space-x-2.5">
                  <div className="p-2 bg-[#E9EDC9] text-[#344E41] rounded-lg">
                    <Wind className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8C8F85] block uppercase font-bold">Vent</span>
                    <span className="text-sm font-extrabold text-[#344E41]">
                      {weather.windSpeed} km/h
                    </span>
                    <span className="text-[10px] text-[#8C8F85] block">Vitesse sol</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#EBE9E1] flex items-center space-x-2.5">
                  <div className="p-2 bg-[#E9EDC9] text-[#344E41] rounded-lg">
                    <CloudRain className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8C8F85] block uppercase font-bold">Précipitations</span>
                    <span className="text-sm font-extrabold text-[#344E41]">
                      {weather.precipitation} mm
                    </span>
                    <span className="text-[10px] text-[#8C8F85] block">Aujourd'hui</span>
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 bg-white p-3 rounded-xl border border-[#EBE9E1] flex items-center space-x-2.5">
                  <div className="p-2 bg-[#E9EDC9] text-[#344E41] rounded-lg">
                    <CloudSun className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8C8F85] block uppercase font-bold">Conditions</span>
                    <span className="text-xs font-bold text-[#344E41] line-clamp-2 leading-tight">
                      {weather.weatherDescription}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pathogen & Pest Risk Evaluation List */}
              <div className="bg-white rounded-xl border border-[#EBE9E1] p-3.5 sm:p-4">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#EBE9E1]">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-[#D4A373]" />
                    <h4 className="text-xs font-serif italic font-bold text-[#344E41]">
                      Évaluation des Pression Bio-Agresseurs (Modèle Agronomique)
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={handleInsertFullWeatherAnalysis}
                    className="flex items-center space-x-1 text-[11px] bg-[#344E41] hover:bg-[#5A6352] text-[#E9EDC9] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Insérer l'Analyse Météo Globale</span>
                  </button>
                </div>

                {/* Risk list items */}
                <div className="space-y-2.5">
                  {[...risks, ...dbEvaluations].map((risk) => {
                    const isHigh = risk.riskLevel === 'Élevé';
                    const isMod = risk.riskLevel === 'Modéré';
                    const isInserted = insertedAlerts[risk.id];

                    return (
                      <div
                        key={risk.id}
                        className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                          isHigh
                            ? 'bg-amber-50/50 border-[#D4A373]'
                            : isMod
                            ? 'bg-[#E9EDC9]/30 border-[#CCD5AE]'
                            : 'bg-[#F9F8F5] border-[#EBE9E1]'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                isHigh
                                  ? 'bg-[#D4A373] text-white'
                                  : isMod
                                  ? 'bg-[#CCD5AE] text-[#344E41]'
                                  : 'bg-[#EBE9E1] text-[#8C8F85]'
                              }`}
                            >
                              Risque {risk.riskLevel} ({risk.score}%)
                            </span>
                            <span className="font-bold text-xs text-[#344E41]">{risk.name}</span>
                          </div>

                          <p className="text-xs text-[#5A6352] leading-snug">
                            {risk.conditionExplanation}
                          </p>
                          <p className="text-[11px] text-[#8C8F85] italic mt-0.5">
                            💡 {risk.preventiveAction}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleInsertIndividualRisk(risk)}
                          className={`shrink-0 flex items-center space-x-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                            isInserted
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-white hover:bg-[#E9EDC9] text-[#344E41] border-[#CCD5AE]'
                          }`}
                        >
                          {isInserted ? (
                            <>
                              <Trash2 className="w-3.5 h-3.5 text-red-700" />
                              <span className="text-red-700">Supprimer</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Ajouter la remarque</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Main Textarea */}
      <div>
        <textarea
          rows={5}
          value={summary || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Rédigez ici la synthèse agronomique générale, l'état végétatif, l'évolution des parcelles et les points clés à surveiller..."
          className="w-full text-xs sm:text-sm text-[#3D3D3D] bg-[#F9F8F5] border border-[#EBE9E1] rounded-xl p-3.5 focus:bg-white focus:border-[#A3B18A] focus:outline-none transition-all resize-y leading-relaxed"
        />
      </div>

      {/* Quick Phrase Chips */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-bold text-[#5A6352] flex items-center space-x-1 mr-1">
          <Sparkles className="w-3 h-3 text-[#D4A373]" />
          <span>Formules rapides :</span>
        </span>
        {(dbFormulas.length > 0 ? dbFormulas.map(f => f.content) : QUICK_PHRASES).map((phrase, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => appendPhrase(phrase)}
            className="text-[11px] bg-[#F9F8F5] hover:bg-[#E9EDC9] text-[#344E41] font-medium px-3 py-1 rounded-full border border-[#EBE9E1] hover:border-[#CCD5AE] transition-all cursor-pointer"
          >
            + {phrase}
          </button>
        ))}
      </div>
    </div>
  );
};
