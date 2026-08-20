import React from 'react';
import { Database, Inbox } from 'lucide-react';
import GlassCard from '../components/GlassCard';

/** Datos estáticos fuera del ciclo de renderizado para mejor rendimiento */
const MOCK_FACTURAS = [
  { id: '31563', fecha: '02/25/2026', proveedor: 'Proveedor Prozeau', diferencia: '+147', estado: 'Discrepancia Detectada' },
  { id: '37006', fecha: '02/24/2026', proveedor: 'GainJo Gemini', diferencia: '+130', estado: 'Procesado' },
  { id: '48101', fecha: '01/26/2026', proveedor: 'Critvca', diferencia: '-700', estado: 'Pendiente' },
];

/** Función utilitaria para los colores de estado */
const getBadgeStyle = (estado: string, isDark: boolean): string => {
  if (estado === 'Procesado') return isDark ? 'bg-teal-500/20 text-teal-300' : 'bg-teal-50 text-teal-600 border border-teal-100';
  if (estado === 'Discrepancia Detectada') return isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-50 text-red-600 border border-red-100';
  return isDark ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-50 text-yellow-600 border border-yellow-100';
};

interface HistoryViewProps {
  isDark?: boolean;
  showMockData?: boolean;
  setShowMockData?: (val: boolean) => void;
}

/**
 * Componente: HistoryView
 * Despliega la tabla de auditoría y el historial lateral.
 */
const HistoryView: React.FC<HistoryViewProps> = ({ isDark = true, showMockData = true, setShowMockData }) => {
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const textMain = isDark ? 'text-white' : 'text-slate-900';

  return (
    <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-10 mt-4 pb-12 w-full">
      <div className="w-full lg:w-3/4 flex flex-col">
        
        <header className="mb-6 flex flex-col space-y-6">
          <div className="text-center w-full">
            <h1 className={`text-3xl font-bold tracking-wide ${textMain}`}>
              Auditoría de Reconciliación
            </h1>
            <p className={`mt-2 font-medium ${textMuted}`}>Tabla de Reconciliación de Facturas</p>
          </div>
          
          <div className="flex justify-end w-full">
            <div className={`flex items-center space-x-3 px-4 py-2 rounded-xl border shadow-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/50 border-black/10'}`}>
              <Database className={`w-4 h-4 ${isDark ? 'text-white/70' : 'text-slate-600'}`} />
              <span className={`text-sm font-semibold ${textMain}`}>Datos de Prueba</span>
              <button
                onClick={() => setShowMockData && setShowMockData(!showMockData)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${showMockData ? 'bg-teal-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${showMockData ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </header>

        <GlassCard isDark={isDark} className="p-0 overflow-hidden flex flex-col flex-grow">
          <div className="overflow-x-auto">
            <table className={`w-full text-left text-sm ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
              <thead className={`font-semibold uppercase text-xs ${isDark ? 'bg-white/10 text-white' : 'bg-slate-700/10 backdrop-blur-md text-slate-900 shadow-sm'}`}>
                <tr>
                  <th className="px-6 py-5">ID Factura</th>
                  <th className="px-6 py-5">Fecha</th>
                  <th className="px-6 py-5">Proveedor</th>
                  <th className="px-6 py-5">Diferencia</th>
                  <th className="px-6 py-5 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-white/10' : 'divide-black/5'}`}>
                {showMockData ? (
                  MOCK_FACTURAS.map((factura) => (
                    <tr key={factura.id} className={`transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
                      <td className="px-6 py-4 font-medium">{factura.id}</td>
                      <td className="px-6 py-4">{factura.fecha}</td>
                      <td className="px-6 py-4">{factura.proveedor}</td>
                      <td className="px-6 py-4 font-mono font-semibold">{factura.diferencia}</td>
                      <td className="px-6 py-4 flex justify-center">
                        <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold leading-tight text-center min-w-[110px] ${getBadgeStyle(factura.estado, isDark)}`}>
                          {factura.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className={`px-4 py-20 text-center ${textMuted}`}>
                      <Inbox className="w-12 h-12 mx-auto mb-4 opacity-40" />
                      <p className="text-lg font-semibold">Aún no hay datos</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      <div className="w-full lg:w-1/4 flex flex-col space-y-4 lg:mt-32">
        <GlassCard isDark={isDark} className="p-6">
          <h3 className={`font-bold mb-5 border-b pb-3 ${isDark ? 'border-white/20' : 'border-black/10'} ${textMain}`}>Historial</h3>
          {showMockData ? (
            <ul className="space-y-4">
              <li className="flex items-center justify-between text-sm">
                <span className={`font-medium ${isDark ? 'text-white/80' : 'text-slate-700'}`}>📄 Factura #31563</span>
                <span className={`text-xs px-2 py-1 rounded-md font-semibold ${isDark ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-50 text-yellow-600 border border-yellow-100'}`}>En proceso</span>
              </li>
            </ul>
          ) : (
            <div className={`py-10 text-center text-sm font-medium ${textMuted}`}>Sin actividad</div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default HistoryView;