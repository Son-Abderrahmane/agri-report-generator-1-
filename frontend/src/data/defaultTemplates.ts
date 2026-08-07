import { CropTemplate, Report } from '../types';

export const samplePhytoPhoto1 = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="#1b4332"/><circle cx="300" cy="200" r="140" fill="#2d6a4f"/><path d="M 220 220 C 260 140, 340 140, 380 220 C 340 300, 260 300, 220 220 Z" fill="#52b788"/><circle cx="280" cy="190" r="12" fill="#d8f3dc"/><circle cx="320" cy="210" r="8" fill="#ff4d6d"/><circle cx="260" cy="230" r="6" fill="#ff4d6d"/><circle cx="340" cy="180" r="10" fill="#ff4d6d"/><text x="300" y="350" font-family="sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">OBSERVATION TERRAIN: FOYER ACARIENS</text></svg>');

export const samplePhytoPhoto2 = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="#0f2b1d"/><rect x="50" y="50" width="500" height="300" rx="20" fill="#1e5128"/><path d="M 150 300 C 200 150, 400 150, 450 300 Z" fill="#4e9f3d"/><circle cx="300" cy="180" r="45" fill="#d8f3dc"/><text x="300" y="185" font-family="sans-serif" font-size="16" font-weight="bold" fill="#1e5128" text-anchor="middle">FLORAISON</text><text x="300" y="340" font-family="sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">CONTRÔLE SANITAIRE DES PÉDONCULES</text></svg>');

export const createNewReport = (templateId?: string): Report => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const refNum = `RVT-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`;

  if (templateId === 'tomate') {
    return {
      id: `rep_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: 'Rapport Inspection - Tomate Sous Serre',
      status: 'draft',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      headerBanner: {
        companyTitle: 'AGRI-EXPERT MAROC',
        subtitle: 'Bureau d\'Etudes & Expertise Phytosanitaire',
        docTitle: 'RAPPORT DE VISITE TECHNIQUE',
        frequencyTag: 'Visite Bimensuelle',
        cropType: 'Tomate Industrie (Sous Serre Multi-Chapelle)',
      },
      farmDetails: {
        clientName: 'Domaine Maraîcher du Souss',
        reportRef: refNum,
        location: 'Secteur Chtouka - Bloc T2',
        visitDate: dateStr,
        cropVariety: 'Tomate Round - Cherry Red',
        phenologicalStage: 'Grossissement des fruits & Récolte rangs 1-4',
        shelterType: 'Serre Canarienne Plastifiée',
        nextVisitDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      },
      diagnosticSummary: 'Vigueur satisfaisante. Surveillance étroite recommandée pour le Tuta absoluta. Légère apparition de mildiou sur le chenal Est suite à la condensation nocturne.',
      observations: [
        {
          id: 'obs_t1',
          url: samplePhytoPhoto1,
          caption: 'PHOTO 1: Piégeage sexuel Tuta Absoluta (Seuil d\'alerte dépassé)',
          pestName: 'Tuta Absoluta (Mineuse de la tomate)',
          alertLevel: 'Alerte Élevée',
          symptoms: 'Comptage des pièges à phéromones > 35 adultes/piège/semaine. Galeries observées sur 3% des foliolations.',
          timestamp: dateStr,
        }
      ],
      phytosanitaryTable: {
        title: 'Programme de Traitement Phytosanitaire',
        rows: [
          {
            id: 'phy_t1',
            target: 'Tuta Absoluta',
            activeIngredient: '',
            product: 'Chlorantraniliprole 200 g/L',
            doseHa: '175 mL/ha',
            darDays: '3',
            nbrApplication: '',
            fournisseur: '',
          },
          {
            id: 'phy_t2',
            target: 'Mildiou (Phytophthora)',
            activeIngredient: '',
            product: 'Fluopicolide + Propamocarbe',
            doseHa: '1.5 L/ha',
            darDays: '7',
            nbrApplication: '',
            fournisseur: '',
          }
        ]
      },
      optimizationResults: null,
      customTables: [],
      recommendations: [
        { id: 'rec_t1', text: 'Renforcer l\'étanchéité des filets anti-insectes sur les ouvrants latéraux.' },
        { id: 'rec_t2', text: 'Purger les rampes de goutte-à-goutte à l\'acide citrique en fin de semaine.' }
      ],
      footer: {
        consultantName: 'Loubna Rachadi',
        consultantTitle: 'Rachadi Nobilis Consulting',
        phone: '0669801918',
        email: 'rachadinobilisconsulting@gmail.com',
        farmSignerName: '',
      }
    };
  }

  // Default Framboisier report
  return {
    id: `rep_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    title: 'Rapport Inspection - Framboisier Sous Serre',
    status: 'draft',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    headerBanner: {
      companyTitle: 'CONSEIL & EXPERTISE AGRONOMIQUE',
      subtitle: 'Suivi Technique & Assistance à la Production Fruitière',
      docTitle: 'RAPPORT DE VISITE TECHNIQUE',
      frequencyTag: 'Suivi Hebdomadaire',
      cropType: 'Framboisier (Sous Serre)',
    },
    farmDetails: {
      clientName: 'Domaine Les Vergers du Souss',
      reportRef: refNum,
      location: 'Secteur Agadir - Parcelle 04-B',
      visitDate: dateStr,
      cropVariety: 'Framboisier - Adelita',
      phenologicalStage: 'Début Floraison & Nouaison',
      shelterType: 'Grand Abri Plastique (GAP)',
      nextVisitDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    },
    diagnosticSummary: 'Etat sanitaire globalement satisfaisant. Attaque localisée d\'acariens rouges sur bordures Sud. Développement végétatif vigoureux. Nécessité d\'ajuster le niveau d\'électroconductivité (EC) de l\'égouttage pour stabiliser la floraison.',
    observations: [
      {
        id: 'obs_1',
        url: samplePhytoPhoto1,
        caption: 'PHOTO 1: Bronzage foliaire causé par acariens',
        pestName: 'Acariens Rouges (Tetranychus urticae)',
        alertLevel: 'Alerte Modérée',
        symptoms: 'Foyers de dépigmentation foliaire constatés sur les feuilles basales du rang 3.',
        timestamp: dateStr,
      },
      {
        id: 'obs_2',
        url: samplePhytoPhoto2,
        caption: 'PHOTO 2: Contrôle sanitaire des pédoncules',
        pestName: 'Botrytis cinerea (Pourriture Grise)',
        alertLevel: 'Info',
        symptoms: 'Analyse préventive post-humidité du matin. Aucun signe de sporulation active sur fleurs.',
        timestamp: dateStr,
      }
    ],
    phytosanitaryTable: {
      title: 'Programme de Traitement Phytosanitaire',
      rows: [
        {
          id: 'phy_1',
          target: 'Acariens Rouges',
          activeIngredient: '',
          product: 'Abamectine 18 g/L (Acaricide)',
          doseHa: '0.5 L/ha',
          darDays: '3',
          nbrApplication: '',
          fournisseur: '',
        },
        {
          id: 'phy_2',
          target: 'Oïdum / Botrytis (Préventif)',
          activeIngredient: '',
          product: 'Bicarbonate de Potassium + Soufre',
          doseHa: '3.0 kg/ha',
          darDays: '1',
          nbrApplication: '',
          fournisseur: '',
        }
      ]
    },
    optimizationResults: null,
    customTables: [],
    recommendations: [
      { id: 'rec_1', text: 'Aérer les serres dès 08h00 du matin pour réduire le taux d\'hygrométrie relative à moins de 85%.' },
      { id: 'rec_2', text: 'Procéder au nettoyage à l\'acide nitrique des goutteurs bouchés sur le bloc B.' },
      { id: 'rec_3', text: 'Maintenir la fréquence de récolte à 2 jours d\'intervalle pour éviter la sur-maturité.' }
    ],
    footer: {
      consultantName: 'Loubna Rachadi',
      consultantTitle: 'Rachadi Nobilis Consulting',
      phone: '0669801918',
      email: 'rachadinobilisconsulting@gmail.com',
      farmSignerName: '',
    }
  };
};

export const CROP_TEMPLATES: CropTemplate[] = [
  {
    id: 'framboisier',
    name: 'Framboisier Sous Serre',
    cropType: 'Framboisier',
    iconName: 'Apple',
    description: 'Modèle d\'inspection complet pour framboisiers sous serre (Suivi Hebdomadaire)',
    defaultReport: {}
  },
  {
    id: 'tomate',
    name: 'Tomate Sous Serre / Plein Champ',
    cropType: 'Tomate',
    iconName: 'Cherry',
    description: 'Suivi phytosanitaire Tuta Absoluta, Mildiou et Fertigation potassique',
    defaultReport: {}
  },
  {
    id: 'agrumes',
    name: 'Agrumes (Clementines & Oranges)',
    cropType: 'Agrumes',
    iconName: 'Citrus',
    description: 'Inspections cochenilles, cératite, irrigation & apport en oligo-éléments',
    defaultReport: {}
  },
  {
    id: 'fraise',
    name: 'Fraise Sous Abri',
    cropType: 'Fraise',
    iconName: 'Strawberry',
    description: 'Modèle spécialisé pour la fraisiculture hors-sol / abri plastique',
    defaultReport: {}
  }
];
