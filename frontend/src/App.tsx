import React, { useState, useEffect } from 'react';
import { Report } from './types';
import { createNewReport } from './data/defaultTemplates';
import { Navbar } from './components/Navbar';
import { HeaderBannerEditor } from './components/HeaderBannerEditor';
import { FarmDetailsEditor } from './components/FarmDetailsEditor';
import { DiagnosticSummaryEditor } from './components/DiagnosticSummaryEditor';
import { ObservationsSection } from './components/ObservationsSection';
import { PhytosanitaryTableEditor } from './components/PhytosanitaryTableEditor';
import { FertigationTableEditor } from './components/FertigationTableEditor';
import { CustomTablesSection } from './components/CustomTablesSection';
import { RecommendationsEditor } from './components/RecommendationsEditor';
import { FooterSignoffEditor } from './components/FooterSignoffEditor';
import { ReportPDFView } from './components/ReportPDFView';
import { ReportsList } from './components/ReportsList';
import { TemplateSelector } from './components/TemplateSelector';
import { CheckCircle, AlertCircle, Save, FileText, Download } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'list' | 'templates'>('editor');
  const [report, setReport] = useState<Report>(() => createNewReport());
  const [reportsList, setReportsList] = useState<Report[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineReports();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (navigator.onLine) {
      syncOfflineReports();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncOfflineReports = async () => {
    const queueStr = localStorage.getItem('agri_offline_queue');
    if (!queueStr) return;
    
    try {
      const queue: string[] = JSON.parse(queueStr);
      if (queue.length === 0) return;

      showToast(`Synchronisation de ${queue.length} rapport(s)...`);
      
      const localReportsStr = localStorage.getItem('agri_reports_v2');
      if (!localReportsStr) return;
      
      const localReports: Report[] = JSON.parse(localReportsStr);
      let successCount = 0;
      let remainingQueue = [...queue];

      for (const id of queue) {
        const reportToSync = localReports.find(r => r.id === id);
        if (reportToSync) {
          try {
            await fetch(`${API_BASE}/reports/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(reportToSync),
            });
            successCount++;
            remainingQueue = remainingQueue.filter(qId => qId !== id);
          } catch (e) {
            console.error('Sync failed for report', id);
          }
        } else {
          remainingQueue = remainingQueue.filter(qId => qId !== id);
        }
      }

      localStorage.setItem('agri_offline_queue', JSON.stringify(remainingQueue));
      
      if (successCount > 0) {
        showToast(`${successCount} rapport(s) synchronisé(s) avec succès`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load reports from server or localStorage on mount
  useEffect(() => {
    fetchReports();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_BASE}/reports`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setReportsList(data);
          setReport(data[0]);
          return;
        }
      }
    } catch (err) {
      console.warn('API fetch failed, reading from localStorage fallback');
    }

    // Local storage fallback
    const local = localStorage.getItem('agri_reports_v2');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReportsList(parsed);
          setReport(parsed[0]);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Default initial report
    const initial = createNewReport();
    setReportsList([initial]);
    setReport(initial);
  };

  const saveCurrentReport = async (reportToSave: Report = report) => {
    setIsSaving(true);
    const updatedWithTimestamp = {
      ...reportToSave,
      updatedAt: new Date().toISOString(),
    };

    setReport(updatedWithTimestamp);

    // Update local list
    const updatedList = reportsList.some((r) => r.id === updatedWithTimestamp.id)
      ? reportsList.map((r) => (r.id === updatedWithTimestamp.id ? updatedWithTimestamp : r))
      : [updatedWithTimestamp, ...reportsList];

    setReportsList(updatedList);
    localStorage.setItem('agri_reports_v2', JSON.stringify(updatedList));

    if (!isOnline) {
      const queueStr = localStorage.getItem('agri_offline_queue');
      const queue = queueStr ? JSON.parse(queueStr) : [];
      if (!queue.includes(updatedWithTimestamp.id)) {
        queue.push(updatedWithTimestamp.id);
        localStorage.setItem('agri_offline_queue', JSON.stringify(queue));
      }
      showToast('Hors ligne : Rapport sauvegardé localement');
      setIsSaving(false);
      return;
    }

    // Persist to server API
    try {
      await fetch(`${API_BASE}/reports/${updatedWithTimestamp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedWithTimestamp),
      });
      showToast('Rapport sauvegardé avec succès');
    } catch (err) {
      console.warn('Server save failed, report saved in browser storage');
      const queueStr = localStorage.getItem('agri_offline_queue');
      const queue = queueStr ? JSON.parse(queueStr) : [];
      if (!queue.includes(updatedWithTimestamp.id)) {
        queue.push(updatedWithTimestamp.id);
        localStorage.setItem('agri_offline_queue', JSON.stringify(queue));
      }
      showToast('Serveur injoignable : Sauvegarde locale');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = (status: 'draft' | 'validated' | 'archived') => {
    const updated = { ...report, status };
    setReport(updated);
    saveCurrentReport(updated);
  };

  const handleNewReport = (templateId?: string) => {
    const newRep = createNewReport(templateId);
    setReport(newRep);
    saveCurrentReport(newRep);
    setActiveTab('editor');
    showToast('Nouveau rapport créé');
  };

  const handleDuplicateReport = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/reports/${id}/duplicate`, { method: 'POST' });
      if (res.ok) {
        const dup = await res.json();
        setReportsList([dup, ...reportsList]);
        setReport(dup);
        setActiveTab('editor');
        showToast('Rapport dupliqué avec succès');
        return;
      }
    } catch (e) {
      console.warn('Backend duplicate fallback');
    }

    // Fallback duplication
    const source = reportsList.find((r) => r.id === id);
    if (source) {
      const dup = JSON.parse(JSON.stringify(source));
      dup.id = `rep_${Date.now()}`;
      dup.title = `${source.title} (Copie)`;
      dup.status = 'draft';
      dup.createdAt = new Date().toISOString();
      dup.updatedAt = new Date().toISOString();
      setReportsList([dup, ...reportsList]);
      setReport(dup);
      setActiveTab('editor');
      showToast('Rapport dupliqué');
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) return;

    try {
      await fetch(`${API_BASE}/reports/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Delete server failed');
    }

    const filtered = reportsList.filter((r) => r.id !== id);
    setReportsList(filtered);
    localStorage.setItem('agri_reports_v2', JSON.stringify(filtered));

    if (report.id === id) {
      if (filtered.length > 0) {
        setReport(filtered[0]);
      } else {
        const fresh = createNewReport();
        setReport(fresh);
        setReportsList([fresh]);
      }
    }
    showToast('Rapport supprimé');
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#3D3D3D] font-sans flex flex-col antialiased">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#344E41] text-[#E9EDC9] text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-[#A3B18A]/40 flex items-center space-x-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-[#A3B18A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        reportTitle={report.title}
        reportStatus={report.status}
        onStatusChange={handleStatusChange}
        onSave={() => saveCurrentReport()}
        onNewReport={() => setActiveTab('templates')}
        onExportPDF={() => setActiveTab('preview')}
        isSaving={isSaving}
        isOnline={isOnline}
      />

      {/* View Router */}
      <main className="flex-1 pb-16">
        {activeTab === 'editor' && (
          <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6">
            {/* Quick Title & Reference Editor */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-[#EBE9E1] mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-[#8C8F85] uppercase tracking-wider mb-0.5">
                  Nom du projet / Fichier Rapport
                </label>
                <input
                  type="text"
                  value={report.title || ''}
                  onChange={(e) => setReport({ ...report, title: e.target.value })}
                  placeholder="ex: Rapport Inspection - Framboisier Sous Serre"
                  className="w-full text-base sm:text-lg font-serif italic font-bold text-[#344E41] bg-transparent border-b border-dashed border-[#CCD5AE] focus:border-[#5A6352] focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => saveCurrentReport()}
                  className="bg-[#5A6352] hover:bg-[#344E41] text-[#E9EDC9] font-bold text-xs px-4 py-2 rounded-xl shadow-sm flex items-center space-x-1.5 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer</span>
                </button>
              </div>
            </div>

            {/* 1. Header & Banner */}
            <HeaderBannerEditor
              banner={report.headerBanner}
              onChange={(headerBanner) => setReport({ ...report, headerBanner })}
            />

            {/* 2. Farm Details */}
            <FarmDetailsEditor
              details={report.farmDetails}
              onChange={(farmDetails) => setReport({ ...report, farmDetails })}
            />

            {/* 3. Diagnostic Summary */}
            <DiagnosticSummaryEditor
              summary={report.diagnosticSummary}
              farmLocation={report.farmDetails?.location}
              cropType={report.headerBanner?.cropType || report.farmDetails?.cropVariety}
              onChange={(diagnosticSummary) => setReport({ ...report, diagnosticSummary })}
            />

            {/* 4. Observations & Field Photos */}
            <ObservationsSection
              observations={report.observations}
              onChange={(observations) => setReport({ ...report, observations })}
            />

            {/* 5. Phytosanitary Treatment Program */}
            <PhytosanitaryTableEditor
              table={report.phytosanitaryTable}
              onChange={(phytosanitaryTable) => setReport({ ...report, phytosanitaryTable })}
            />

            {/* 6. Weekly Fertigation Program */}
            <FertigationTableEditor
              table={report.fertigationTable}
              onChange={(fertigationTable) => setReport({ ...report, fertigationTable })}
            />

            {/* 7. Dynamic Custom Tables */}
            <CustomTablesSection
              tables={report.customTables || []}
              onChange={(customTables) => setReport({ ...report, customTables })}
            />

            {/* 8. Recommendations & Immediate Actions */}
            <RecommendationsEditor
              recommendations={report.recommendations}
              onChange={(recommendations) => setReport({ ...report, recommendations })}
            />

            {/* 9. Footer & Consultant Sign-off */}
            <FooterSignoffEditor
              footer={report.footer}
              onChange={(footer) => setReport({ ...report, footer })}
            />
          </div>
        )}

        {activeTab === 'preview' && (
          <ReportPDFView
            report={report}
            onEditRequest={() => setActiveTab('editor')}
          />
        )}

        {activeTab === 'list' && (
          <ReportsList
            reports={reportsList}
            onSelectReport={(selected) => {
              setReport(selected);
              setActiveTab('editor');
            }}
            onDuplicateReport={handleDuplicateReport}
            onDeleteReport={handleDeleteReport}
            onNewReport={() => setActiveTab('templates')}
          />
        )}

        {activeTab === 'templates' && (
          <TemplateSelector
            onSelectTemplate={(templateId) => handleNewReport(templateId)}
          />
        )}
      </main>
    </div>
  );
}
