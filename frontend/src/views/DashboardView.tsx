import React, { useMemo } from 'react';
import UploadZone from '../components/UploadZone';
import GlassCard from '../components/GlassCard';

/** Propiedades del Dashboard */
interface DashboardProps {
  isDark?: boolean;
  showMockData?: boolean;
}

/**
 * Componente: DashboardView
 * Muestra las métricas principales y la zona de carga de archivos.
 */
const DashboardView: React.FC<DashboardProps> = ({ isDark = true, showMockData = true }) => {
  const textTitle = isDark ? 'text-white' : 'text-slate-900';
  const textSubtitle = isDark ? 'text-slate-400' : 'text-slate-500';
  const numberColor = isDark ? 'text-white' : 'text-slate-800';

  // Memorizamos las tarjetas para evitar recálculos si no cambian los datos
  const statsCards = useMemo(() => [
    { label: 'Facturas Procesadas', value: showMockData ? '1,432' : '0', color: numberColor },
    { label: 'Reconciliadas Auto.', value: showMockData ? '1,285' : '0', color: showMockData ? 'text-teal-500' : textSubtitle },
    { label: 'Discrepancias', value: showMockData ? '147' : '0', color: showMockData ? 'text-red-500' : textSubtitle },
    { label: 'Tendencia', value: '--', color: numberColor }
  ], [showMockData, numberColor, textSubtitle]);

  return (
    <div className="max-w-5xl mx-auto flex flex-col items-center space-y-10 mt-8">
      <header className="text-center w-full">
        <h1 className={`text-3xl font-bold tracking-wide ${textTitle}`}>Finanzas Inteligentes</h1>
        <p className={`mt-2 font-medium ${textSubtitle}`}>Panel de Control Unificado - ReconFlow</p>
      </header>

      <div className="w-full max-w-2xl">
        <UploadZone isDark={isDark} />
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <GlassCard key={index} isDark={isDark} className="p-5 flex flex-col items-center justify-center text-center">
            <p className={`text-sm font-medium ${textSubtitle}`}>{stat.label}</p>
            <h3 className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</h3>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default DashboardView;