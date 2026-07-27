import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createNewReport, CROP_TEMPLATES } from './src/data/defaultTemplates';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // In-memory reports store initialized with a default report
  let reportsStore: Record<string, any> = {};
  const initialReport = createNewReport();
  reportsStore[initialReport.id] = initialReport;

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get crop templates
  app.get('/api/templates', (req, res) => {
    res.json(CROP_TEMPLATES);
  });

  // Get all reports
  app.get('/api/reports', (req, res) => {
    const list = Object.values(reportsStore).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    res.json(list);
  });

  // Get single report
  app.get('/api/reports/:id', (req, res) => {
    const report = reportsStore[req.params.id];
    if (!report) {
      return res.status(404).json({ error: 'Rapport introuvable' });
    }
    res.json(report);
  });

  // Create new report
  app.post('/api/reports', (req, res) => {
    const reportData = req.body;
    if (!reportData.id) {
      const newRep = createNewReport();
      Object.assign(newRep, reportData, {
        id: `rep_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      reportsStore[newRep.id] = newRep;
      return res.json(newRep);
    }
    
    reportData.updatedAt = new Date().toISOString();
    reportsStore[reportData.id] = reportData;
    res.json(reportData);
  });

  // Update existing report
  app.put('/api/reports/:id', (req, res) => {
    const { id } = req.params;
    if (!reportsStore[id]) {
      // create if missing
      req.body.id = id;
    }
    req.body.updatedAt = new Date().toISOString();
    reportsStore[id] = req.body;
    res.json(reportsStore[id]);
  });

  // Duplicate report
  app.post('/api/reports/:id/duplicate', (req, res) => {
    const source = reportsStore[req.params.id];
    if (!source) {
      return res.status(404).json({ error: 'Rapport source non trouvé' });
    }
    const newId = `rep_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const nowStr = new Date().toISOString();
    const duplicated = JSON.parse(JSON.stringify(source));
    duplicated.id = newId;
    duplicated.title = `${source.title} (Copie)`;
    duplicated.status = 'draft';
    duplicated.createdAt = nowStr;
    duplicated.updatedAt = nowStr;
    if (duplicated.farmDetails) {
      duplicated.farmDetails.reportRef = `RVT-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`;
      duplicated.farmDetails.visitDate = nowStr.split('T')[0];
    }
    reportsStore[newId] = duplicated;
    res.json(duplicated);
  });

  // Delete report
  app.delete('/api/reports/:id', (req, res) => {
    const { id } = req.params;
    delete reportsStore[id];
    res.json({ success: true, id });
  });

  // Simple image processing/upload route (returns data URL or processed response)
  app.post('/api/upload', (req, res) => {
    const { imageData, caption } = req.body;
    if (!imageData) {
      return res.status(400).json({ error: 'Aucune donnée d\'image reçue' });
    }
    res.json({
      success: true,
      url: imageData,
      caption: caption || 'Photo terrain importée',
      timestamp: new Date().toISOString().split('T')[0],
    });
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
