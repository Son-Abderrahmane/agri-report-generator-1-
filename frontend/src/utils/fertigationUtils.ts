export const calculateUFAchieved = (doses: any[], fertilizers: any[]) => {
  const achieved: Record<string, number> = {
    n: 0, p2o5: 0, k2o: 0, cao: 0, mgo: 0, so3: 0, fe: 0,
    zn: 0, mn: 0, cu: 0, b: 0, mo: 0
  };

  doses.forEach(dose => {
    const fert = fertilizers.find(f => f.id === dose.id);
    if (!fert) return;
    
    // total_amount is in kg (or L, but we treat it as kg for UF math as density is handled)
    const amountKg = dose.total_amount || dose.amount || 0;

    Object.keys(achieved).forEach(nutrient => {
      const perc = Number(fert[nutrient] || 0);
      if (perc > 0) {
        achieved[nutrient] += amountKg * (perc / 100);
      }
    });
  });

  return achieved;
};

export const calculateCost = (doses: any[], fertilizers: any[]) => {
  let totalCost = 0;
  doses.forEach(dose => {
    const fert = fertilizers.find(f => f.id === dose.id);
    if (!fert) return;
    
    const amount = dose.total_amount || dose.amount || 0;
    const price = Number(fert.price_per_unit || 0);
    totalCost += amount * price;
  });
  return totalCost;
};

const isCompatibleWithTank = (fertId: number, tankDoses: any[], rules: any[]) => {
  for (const tankDose of tankDoses) {
    const existingFertId = tankDose.id;
    if (existingFertId === fertId) continue; // Same fertilizer is compatible with itself

    // Find if there's a rule making them incompatible
    const rule = rules.find(r => 
      (r.fertilizer_id_a === fertId && r.fertilizer_id_b === existingFertId) ||
      (r.fertilizer_id_b === fertId && r.fertilizer_id_a === existingFertId)
    );

    if (rule && !rule.is_compatible) {
      return false; // Incompatible
    }
  }
  return true;
};

export const generateTanks = (doses: any[], rules: any[]) => {
  const tanks: Record<string, any[]> = {
    'Tank A': [],
    'Tank B': [],
    'Tank C': []
  };

  doses.forEach(dose => {
    const fertId = dose.id;
    let placed = false;

    for (const tankName of ['Tank A', 'Tank B', 'Tank C']) {
      if (isCompatibleWithTank(fertId, tanks[tankName], rules)) {
        tanks[tankName].push(dose);
        placed = true;
        break;
      }
    }

    if (!placed) {
      // Force into Tank C if no other choice, with a warning (in real app)
      tanks['Tank C'].push(dose);
    }
  });

  // Filter out empty tanks
  const result: Record<string, any[]> = {};
  Object.entries(tanks).forEach(([name, contents]) => {
    if (contents.length > 0) {
      result[name] = contents;
    }
  });

  return result;
};

export const formatDoses = (doses: any[], areaHa: number, durationDays: number, fertilizers: any[]) => {
  return doses.map(dose => {
    const fert = fertilizers.find(f => f.id === dose.id);
    const amount = dose.total_amount || dose.amount || 0;
    const unit = fert?.unit || 'kg';
    const name = fert?.name || 'Inconnu';
    
    return {
      ...dose,
      name,
      unit,
      total_amount: amount,
      per_ha_day: amount / areaHa / durationDays,
      per_ha_week: (amount / areaHa / durationDays) * 7,
      per_ha_month: (amount / areaHa / durationDays) * 30,
    };
  });
};
