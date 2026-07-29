import React, { useState } from 'react';
import { Report } from '../types';
import { 
  FolderOpen, 
  Search, 
  Plus, 
  Copy, 
  Trash2, 
  Eye, 
  Edit3, 
  Calendar, 
  MapPin, 
  FileText,
  Sparkles,
  Download
} from 'lucide-react';

interface ReportsListProps {
  reports: Report[];
  onSelectReport: (report: Report) => void;
  onDuplicateReport: (reportId: string) => void;
  onDeleteReport: (reportId: string) => void;
  onNewReport: () => void;
}

export const ReportsList: React.FC<ReportsListProps> = ({
  reports,
  onSelectReport,
  onDuplicateReport,
  onDeleteReport,
  onNewReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      (r.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.farmDetails?.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.farmDetails?.reportRef || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.headerBanner?.cropType || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search & Header Control Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-[#EBE9E1] mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif italic font-bold text-[#344E41] text-lg sm:text-xl flex items-center space-x-2">
              <FolderOpen className="w-5 h-5 text-[#344E41]" />
              <span>Gestionnaire des Rapports de Visite</span>
            </h2>
            <p className="text-xs text-[#8C8F85]">
              {reports.length} rapport(s) enregistré(s) localement et sur le serveur
            </p>
          </div>

          <button
            onClick={onNewReport}
            className="flex items-center justify-center space-x-1.5 bg-[#5A6352] hover:bg-[#344E41] text-[#E9EDC9] text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Créer un Nouveau Rapport</span>
          </button>
        </div>

        {/* Filters */}
        <div className="mt-4 pt-4 border-t border-[#EBE9E1] grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative col-span-2">
            <Search className="w-4 h-4 text-[#8C8F85] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par client, référence, culture, localisation..."
              className="w-full text-xs bg-[#F9F8F5] border border-[#EBE9E1] rounded-xl pl-9 pr-3 py-2.5 focus:bg-white focus:border-[#A3B18A] focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-[#F9F8F5] border border-[#EBE9E1] rounded-xl px-3 py-2.5 font-bold text-[#344E41] focus:outline-none"
          >
            <option value="all">Tous les Statuts</option>
            <option value="draft">Brouillons uniquement</option>
            <option value="validated">Rapports Validés</option>
            <option value="archived">Archivés</option>
          </select>
        </div>
      </div>

      {/* Reports Cards Grid */}
      {filteredReports.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#EBE9E1] p-6">
          <FolderOpen className="w-12 h-12 mx-auto text-[#CCD5AE] mb-3" />
          <h3 className="font-bold text-[#344E41] text-sm mb-1">Aucun rapport trouvé</h3>
          <p className="text-xs text-[#8C8F85] mb-4">
            Essayez de modifier vos termes de recherche ou créez un nouveau rapport de visite.
          </p>
          <button
            onClick={onNewReport}
            className="inline-flex items-center space-x-1.5 bg-[#5A6352] hover:bg-[#344E41] text-[#E9EDC9] text-xs font-bold px-4 py-2 rounded-xl"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Rapport</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredReports.map((rep) => (
            <div
              key={rep.id}
              className="bg-white rounded-2xl border border-[#EBE9E1] hover:border-[#A3B18A] shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-extrabold text-[#344E41] bg-[#E9EDC9] px-2.5 py-1 rounded-lg border border-[#CCD5AE]">
                    {rep.farmDetails?.reportRef || 'RVT-2026'}
                  </span>

                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                      rep.status === 'validated'
                        ? 'bg-[#E9EDC9] text-[#344E41] border-[#CCD5AE]'
                        : rep.status === 'archived'
                        ? 'bg-[#EBE9E1] text-[#5A6352] border-[#EBE9E1]'
                        : 'bg-[#D4A373]/20 text-[#D4A373] border-[#D4A373]/40'
                    }`}
                  >
                    {rep.status === 'validated' ? 'Validé' : rep.status === 'archived' ? 'Archivé' : 'Brouillon'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-serif italic font-bold text-[#344E41] text-base sm:text-lg line-clamp-1 mb-1 group-hover:text-[#5A6352] transition-colors">
                  {rep.title || 'Rapport de Visite Technique'}
                </h3>

                <p className="text-xs font-bold text-[#5A6352] mb-3 flex items-center space-x-1">
                  <span>Client : {rep.farmDetails?.clientName || 'Domaine Agricole'}</span>
                </p>

                {/* Details List */}
                <div className="space-y-1.5 text-xs text-[#3D3D3D] bg-[#F9F8F5] p-3 rounded-xl border border-[#EBE9E1] mb-4">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#5A6352] shrink-0" />
                    <span>Visite : <strong>{rep.farmDetails?.visitDate || '-'}</strong></span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#5A6352] shrink-0" />
                    <span className="line-clamp-1">{rep.farmDetails?.location || '-'}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#5A6352] shrink-0" />
                    <span className="line-clamp-1">{rep.headerBanner?.cropType || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="pt-3 border-t border-[#EBE9E1] flex items-center justify-between">
                <button
                  onClick={() => onSelectReport(rep)}
                  className="flex items-center space-x-1 bg-[#5A6352] hover:bg-[#344E41] text-[#E9EDC9] font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Ouvrir</span>
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onDuplicateReport(rep.id)}
                    className="p-2 text-[#5A6352] hover:text-[#344E41] bg-[#F9F8F5] hover:bg-[#E9EDC9] rounded-xl transition-all"
                    title="Dupliquer le rapport"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteReport(rep.id)}
                    className="p-2 text-amber-800/60 hover:text-red-700 bg-[#F9F8F5] hover:bg-amber-100 rounded-xl transition-all"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
