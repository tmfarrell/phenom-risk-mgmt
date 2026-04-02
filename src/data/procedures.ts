import { Procedure } from '@/types/procedure-readiness';

export const procedures: Procedure[] = [
  {
    id: 'tkr',
    name: 'Total Knee Replacement',
    category: 'Lower Extremity',
    baseRate: 0.0085,
    averageCost: 35000,
  },
  {
    id: 'thr',
    name: 'Total Hip Replacement',
    category: 'Lower Extremity',
    baseRate: 0.0072,
    averageCost: 38000,
  },
  {
    id: 'lss',
    name: 'Lumbar Spine Surgery (Fusion)',
    category: 'Spine',
    baseRate: 0.0045,
    averageCost: 62000,
  },
  {
    id: 'css',
    name: 'Cervical Spine Surgery (Fusion)',
    category: 'Spine',
    baseRate: 0.0032,
    averageCost: 55000,
  },
  {
    id: 'rcs',
    name: 'Rotator Cuff Surgery',
    category: 'Upper Extremity',
    baseRate: 0.0058,
    averageCost: 23000,
  },
  {
    id: 'tsr',
    name: 'Total Shoulder Replacement',
    category: 'Upper Extremity',
    baseRate: 0.0028,
    averageCost: 42000,
  },
  {
    id: 'acl',
    name: 'ACL Reconstruction',
    category: 'Lower Extremity',
    baseRate: 0.0041,
    averageCost: 28000,
  },
  {
    id: 'lam',
    name: 'Laminectomy',
    category: 'Spine',
    baseRate: 0.0038,
    averageCost: 45000,
  },
  {
    id: 'fall',
    name: 'Fall Risk Assessment',
    category: 'Preventive Care',
    baseRate: 0.0125,
    averageCost: 8500,
  },
];
