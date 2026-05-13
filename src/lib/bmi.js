export function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

export function getBMICategory(bmi) {
  if (bmi < 18.5) return { category: 'Kurus', key: 'kurus', color: '#3b82f6' };
  if (bmi < 25) return { category: 'Normal', key: 'normal', color: '#22c55e' };
  if (bmi < 30) return { category: 'Gemuk', key: 'gemuk', color: '#eab308' };
  return { category: 'Obesitas', key: 'obesitas', color: '#ef4444' };
}

export function getBloodPressureCategory(systolic, diastolic) {
  if (systolic < 120 && diastolic < 80)
    return { category: 'Normal', key: 'normal', color: '#22c55e' };
  if (systolic >= 120 && systolic <= 129 && diastolic < 80)
    return { category: 'Elevasi', key: 'elevasi', color: '#eab308' };
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89))
    return { category: 'Hipertensi Stage 1', key: 'hipertensi-1', color: '#f97316' };
  if (systolic >= 140 || diastolic >= 90)
    return { category: 'Hipertensi Stage 2', key: 'hipertensi-2', color: '#ef4444' };
  if (systolic > 180 || diastolic > 120)
    return { category: 'Krisis Hipertensi', key: 'krisis', color: '#ff0000' };
  return { category: 'Normal', key: 'normal', color: '#22c55e' };
}

export function getBMIGaugeAngle(bmi) {
  const clampedBmi = Math.max(10, Math.min(45, bmi));
  return ((clampedBmi - 10) / 35) * 180;
}
