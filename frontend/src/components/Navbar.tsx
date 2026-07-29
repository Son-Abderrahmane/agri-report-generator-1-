import React from 'react';
import { 
  FileText, 
  Eye, 
  FolderOpen, 
  Sparkles, 
  Download, 
  Save, 
  CheckCircle2, 
  PlusCircle,
  FileCheck2,
  RefreshCw,
  Wifi,
  WifiOff,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'editor' | 'preview' | 'list' | 'templates';
  setActiveTab: (tab: 'editor' | 'preview' | 'list' | 'templates') => void;
  reportTitle: string;
  reportStatus: 'draft' | 'validated' | 'archived';
  onStatusChange: (status: 'draft' | 'validated' | 'archived') => void;
  onSave: () => void;
  onNewReport: () => void;
  onExportPDF: () => void;
  isSaving?: boolean;
  isOnline?: boolean;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  reportTitle,
  reportStatus,
  onStatusChange,
  onSave,
  onNewReport,
  onExportPDF,
  isSaving = false,
  isOnline = true,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#5A6352] text-white shadow-md border-b border-[#344E41]/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & App Name */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden sm:flex bg-[#A3B18A] p-2 rounded-xl text-[#344E41] font-black items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif italic font-bold tracking-wide text-lg sm:text-xl text-[#E9EDC9]">
                  AgriReport
                </span>
                <span className="hidden sm:inline-block bg-[#344E41] text-[#E9EDC9] text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border border-white/10">
                  v2.0 Expert
                </span>
                {isOnline ? (
                  <div className="flex items-center space-x-1 bg-green-500/20 text-green-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-green-500/30" title="Connecté - Sauvegarde Automatique">
                    <Wifi className="w-3 h-3" />
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 bg-red-500/20 text-red-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-red-500/30 animate-pulse" title="Hors-Ligne - Sauvegarde Locale">
                    <WifiOff className="w-3 h-3" />
                  </div>
                )}
              </div>
              <p className="text-xs text-white/70 line-clamp-1 max-w-[180px] sm:max-w-xs font-medium">
                {reportTitle || 'Rapport de Visite Technique'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-1 bg-[#344E41]/60 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'editor'
                  ? 'bg-[#A3B18A] text-[#344E41] shadow-sm font-bold'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Éditeur</span>
            </button>

            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'preview'
                  ? 'bg-[#A3B18A] text-[#344E41] shadow-sm font-bold'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Aperçu PDF</span>
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'list'
                  ? 'bg-[#A3B18A] text-[#344E41] shadow-sm font-bold'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>Mes Rapports</span>
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'templates'
                  ? 'bg-[#A3B18A] text-[#344E41] shadow-sm font-bold'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Modèles</span>
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Status Selector */}
            <select
              value={reportStatus}
              onChange={(e) => onStatusChange(e.target.value as any)}
              className={`text-xs font-bold px-2 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${
                reportStatus === 'validated'
                  ? 'bg-[#A3B18A]/30 text-[#E9EDC9] border-[#A3B18A]'
                  : reportStatus === 'archived'
                  ? 'bg-[#344E41] text-white/70 border-white/20'
                  : 'bg-[#D4A373]/30 text-[#F7F6F2] border-[#D4A373]'
              }`}
            >
              <option value="draft" className="bg-[#344E41] text-white">Brouillon</option>
              <option value="validated" className="bg-[#344E41] text-white">Validé</option>
              <option value="archived" className="bg-[#344E41] text-white">Archivé</option>
            </select>

            {/* Save Button */}
            <button
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center space-x-1 sm:space-x-1.5 bg-[#344E41] hover:bg-[#2A3F34] text-white text-xs font-medium px-2.5 sm:px-3.5 py-1.5 rounded-lg shadow-sm transition-all border border-white/20"
              title="Sauvegarder le rapport"
            >
              {isSaving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#E9EDC9]" />
              ) : (
                <Save className="w-3.5 h-3.5 text-[#E9EDC9]" />
              )}
              <span className="hidden sm:inline">Enregistrer</span>
            </button>

            {/* PDF Export Button */}
            <button
              onClick={onExportPDF}
              className="flex items-center space-x-1.5 bg-[#E9EDC9] hover:bg-[#CCD5AE] text-[#344E41] text-xs font-bold px-3 py-1.5 rounded-lg shadow-md transition-all"
              title="Générer & Télécharger le PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>

            {/* New Report Button */}
            <button
              onClick={onNewReport}
              className="hidden lg:flex items-center space-x-1 bg-[#344E41]/80 hover:bg-[#344E41] text-[#E9EDC9] text-xs px-2.5 py-1.5 rounded-lg border border-white/10 transition-all"
              title="Nouveau Rapport"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Nouveau</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center space-x-1 bg-red-500/20 hover:bg-red-500/30 text-red-100 text-xs px-2 py-1.5 rounded-lg border border-red-500/20 transition-all ml-2"
              title="Se déconnecter"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Navigation Sub-bar */}
        <div className="flex md:hidden justify-around py-2 border-t border-white/10 bg-[#344E41]/40 text-xs">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg ${
              activeTab === 'editor' ? 'text-[#E9EDC9] font-bold bg-[#344E41]/60' : 'text-white/70'
            }`}
          >
            <FileText className="w-4 h-4 mb-0.5" />
            <span>Éditeur</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg ${
              activeTab === 'preview' ? 'text-[#E9EDC9] font-bold bg-[#344E41]/60' : 'text-white/70'
            }`}
          >
            <Eye className="w-4 h-4 mb-0.5" />
            <span>Aperçu PDF</span>
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg ${
              activeTab === 'list' ? 'text-[#E9EDC9] font-bold bg-[#344E41]/60' : 'text-white/70'
            }`}
          >
            <FolderOpen className="w-4 h-4 mb-0.5" />
            <span>Mes Rapports</span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg ${
              activeTab === 'templates' ? 'text-[#E9EDC9] font-bold bg-[#344E41]/60' : 'text-white/70'
            }`}
          >
            <Sparkles className="w-4 h-4 mb-0.5" />
            <span>Modèles</span>
          </button>
        </div>
      </div>
    </header>
  );
};
