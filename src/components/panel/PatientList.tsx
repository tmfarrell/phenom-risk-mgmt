import { Person } from '@/types/population';
import { Card } from '@/components/ui/card';

interface PatientListProps {
  selectedPatientsData: Person[];
  onPatientClick: (patientId: number) => void;
}

export function PatientList({ selectedPatientsData, onPatientClick }: PatientListProps) {
  return (
    <Card className="p-4 glass-card">
      <h2 className="text-xl font-semibold mb-4">Selected Patients</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from(new Set(selectedPatientsData.map(p => p.patient_id))).map((patientId) => {
          const patient = selectedPatientsData.find(p => p.patient_id === patientId);
          if (!patient) return null;
          return (
            <div
              key={patientId}
              onClick={() => onPatientClick(patientId)}
              className="p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-100 shadow-sm transition-all hover:shadow-md cursor-pointer hover:bg-white/70"
            >
              <p className="font-semibold text-sm truncate">{patient.name}</p>
              <p className="text-gray-500 text-xs">ID: {patientId}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}