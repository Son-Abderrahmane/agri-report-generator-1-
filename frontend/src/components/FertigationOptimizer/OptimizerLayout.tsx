import React, { useState } from 'react';
import { Beaker, Sprout, Droplets, LineChart, CheckCircle } from 'lucide-react';
import { FertilizersManager } from './FertilizersManager';
import { WaterAnalysisManager } from './WaterAnalysisManager';
import { SoilAnalysisManager } from './SoilAnalysisManager';
import { GrowthStagesManager } from './GrowthStagesManager';
import { OptimizationEngine } from './OptimizationEngine';

interface OptimizerLayoutProps {
  apiBase: string;
  token: string;
}

export const OptimizerLayout: React.FC<OptimizerLayoutProps> = ({ apiBase, token }) => {
  const [activeTab, setActiveTab] = useState<'fertilizers' | 'stages' | 'water' | 'soil' | 'reports'>('fertilizers');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#EBE9E1] p-5 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-[#EBE9E1] mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#E9EDC9] rounded-xl text-[#344E41]">
            <Beaker className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif italic font-bold text-[#344E41] text-xl">
              Moteur d'Optimisation HydroBuddy
            </h3>
            <p className="text-xs text-[#8C8F85]">
              Formulation et calcul des solutions nutritives & Bacs A/B
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto space-x-2 pb-2 mb-6 scrollbar-hide">
        {[
          { id: 'fertilizers', label: 'Engrais & Acides', icon: <Beaker className="w-4 h-4" /> },
          { id: 'stages', label: 'Stades Végétatifs', icon: <Sprout className="w-4 h-4" /> },
          { id: 'water', label: 'Analyse d\'Eau', icon: <Droplets className="w-4 h-4" /> },
          { id: 'soil', label: 'Analyse de Sol', icon: <Sprout className="w-4 h-4" /> },
          { id: 'reports', label: 'Rapports', icon: <CheckCircle className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#344E41] text-white shadow-md'
                : 'bg-[#F9F8F5] text-[#8C8F85] hover:bg-[#E9EDC9] hover:text-[#344E41]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeTab === 'fertilizers' && (
          <FertilizersManager apiBase={apiBase} token={token} />
        )}
        {activeTab === 'stages' && (
          <GrowthStagesManager apiBase={apiBase} token={token} />
        )}
        {activeTab === 'water' && (
          <WaterAnalysisManager apiBase={apiBase} token={token} />
        )}
        {activeTab === 'soil' && (
          <SoilAnalysisManager apiBase={apiBase} token={token} />
        )}
        {activeTab === 'reports' && (
          <div className="text-center py-10 text-gray-500">Rapports d'optimisation en construction...</div>
        )}
      </div>
    </div>
  );
};
