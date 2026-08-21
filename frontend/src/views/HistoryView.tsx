import React, { useEffect, useState, useMemo } from 'react';
import { Database, Inbox, Loader2, ChevronLeft, ChevronRight, Filter, ArrowDown, ArrowUp, Wrench } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const getBadgeStyle = (estado: string, isDark: boolean): string => {
  const st = estado.toLowerCase();
  if (st.includes('conciliado') || st.includes('procesado')) return isDark ? 'bg-teal-500/20 text-teal-300' : 'bg-teal-50 text-teal-600 border border-teal-100';
  if (st.includes('discrepancia')) return isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-50 text-red-600 border border-red-100';
  return isDark ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-50 text-yellow-600 border border-yellow-100';
};

interface FacturaAPI {
  numero_factura: string;
  fecha_emision: string;
  entidad_razon_social: string;
  total_factura_cop: number;
  estado_reconciliacion: string;
}

interface FilterState {
  id: string;
  proveedor: string;
  estado: string;
  fechaDesde: string;
  fechaHasta: string;
  precioMin: string;
  precioMax: string;
}

const defaultFilters: FilterState = { id: '', proveedor: '', estado: 'Todos', fechaDesde: '', fechaHasta: '', precioMin: '', precioMax: '' };

interface HistoryViewProps {
  isDark?: boolean;
  showMockData?: boolean;
  setShowMockData?: (val: boolean) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ isDark = true, showMockData = true, setShowMockData }) => {
  const [facturas, setFacturas] = useState<FacturaAPI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [itemsPerPage, setItemsPerPage] = useState<number | 'ALL'>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtros, setFiltros] = useState<FilterState>(defaultFilters);
  const [sortConfig, setSortConfig] = useState<{ key: keyof FacturaAPI, direction: 'asc' | 'desc' } | null>(null);

  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const textMain = isDark ? 'text-white' : 'text-slate-900';

  useEffect(() => {
    if (showMockData) {
      setIsLoading(true);
      fetch('http://127.0.0.1:8000/api/facturas')
        .then(res => res.json())
        .then(data => { setFacturas(data); setIsLoading(false); })
        .catch(err => { console.error("Error:", err); setIsLoading(false); });
    } else {
      setFacturas([]);
    }
  }, [showMockData]);

  useEffect(() => { setCurrentPage(1); }, [filtros, itemsPerPage]);

  const processedFacturas = useMemo(() => {
    let result = facturas.filter(f => {
      const matchId = f.numero_factura.toLowerCase().includes(filtros.id.toLowerCase());
      const matchProv = f.entidad_razon_social.toLowerCase().includes(filtros.proveedor.toLowerCase());
      const matchEstado = filtros.estado === 'Todos' || f.estado_reconciliacion.toLowerCase() === filtros.estado.toLowerCase();
      const matchFechaDesde = filtros.fechaDesde ? f.fecha_emision >= filtros.fechaDesde : true;
      const matchFechaHasta = filtros.fechaHasta ? f.fecha_emision <= filtros.fechaHasta : true;
      const matchPrecioMin = filtros.precioMin ? f.total_factura_cop >= Number(filtros.precioMin) : true;
      const matchPrecioMax = filtros.precioMax ? f.total_factura_cop <= Number(filtros.precioMax) : true;
      
      return matchId && matchProv && matchEstado && matchFechaDesde && matchFechaHasta && matchPrecioMin && matchPrecioMax;
    });

    if (sortConfig) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [facturas, filtros, sortConfig]);

  const currentFacturas = useMemo(() => {
    if (itemsPerPage === 'ALL') return processedFacturas;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedFacturas.slice(startIndex, startIndex + itemsPerPage);
  }, [processedFacturas, currentPage, itemsPerPage]);

  const totalPages = itemsPerPage === 'ALL' ? 1 : Math.ceil(processedFacturas.length / itemsPerPage);

  const handleSort = (key: keyof FacturaAPI) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
  };

  // 🔥 NUEVO: Función para manejar el clic en "Resolver"
  const handleResolver = (id: string) => {
    alert(`⚙️ Iniciando flujo de resolución manual para la factura ${id}...\n\n(En producción, esto abriría un panel para ajustar montos o notificar al proveedor).`);
  };

  const isHeavyLoad = itemsPerPage === 'ALL' || itemsPerPage > 10;
  const staticGlassClasses = `p-0 overflow-hidden flex flex-col flex-grow min-h-[400px] rounded-[24px] border backdrop-blur-md shadow-xl transition-colors ${isDark ? 'bg-white/5 border-white/15' : 'bg-white/40 border-black/10'}`;
  const TableContainer = isHeavyLoad ? 'div' : GlassCard;
  const containerProps = isHeavyLoad ? { className: staticGlassClasses } : { isDark, className: "p-0 overflow-hidden flex flex-col flex-grow min-h-[400px]" };

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 mt-4 pb-12 w-full">
      
      {/* =============================== */}
      {/* IZQUIERDA: TABLA (Ancho Fijo)   */}
      {/* =============================== */}
      <div className="w-full lg:w-3/4 flex flex-col">
        <header className="mb-6 flex flex-col sm:flex-row justify-between items-end w-full gap-4">
          <div>
            <h1 className={`text-3xl font-bold tracking-wide ${textMain}`}>Auditoría Financiera</h1>
            <p className={`mt-1 font-medium ${textMuted}`}>{processedFacturas.length} registros encontrados</p>
          </div>
          
          <div className={`flex items-center space-x-3 px-4 py-2 rounded-xl border shadow-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/10'}`}>
            <Database className={`w-4 h-4 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
            <span className={`text-sm font-semibold ${textMain}`}>Conexión BD</span>
            <button onClick={() => setShowMockData && setShowMockData(!showMockData)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${showMockData ? 'bg-teal-500' : 'bg-slate-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${showMockData ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </header>

        {/* @ts-ignore */}
        <TableContainer {...containerProps}>
          <div className="overflow-x-auto relative">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/10 backdrop-blur-sm">
                <Loader2 className="w-10 h-10 animate-spin text-teal-500 mb-2" />
                <span className="font-semibold text-teal-500">Sincronizando...</span>
              </div>
            )}

            {/* Ajuste de anchos para sumar 100% exacto con la nueva columna */}
            <table className={`w-full table-fixed text-left text-sm ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
              <thead className={`font-semibold uppercase text-xs sticky top-0 z-0 ${isDark ? 'bg-white/10 text-white' : 'bg-slate-100/80 backdrop-blur-md text-slate-700 shadow-sm'}`}>
                <tr>
                  <th className="w-[12%] px-4 py-5 cursor-pointer hover:bg-black/5" onClick={() => handleSort('numero_factura')}>
                    <div className="flex items-center truncate">ID {sortConfig?.key === 'numero_factura' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />)}</div>
                  </th>
                  <th className="w-[12%] px-4 py-5 cursor-pointer hover:bg-black/5" onClick={() => handleSort('fecha_emision')}>
                    <div className="flex items-center truncate">Fecha {sortConfig?.key === 'fecha_emision' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />)}</div>
                  </th>
                  <th className="w-[28%] px-4 py-5 cursor-pointer hover:bg-black/5" onClick={() => handleSort('entidad_razon_social')}>
                    <div className="flex items-center truncate">Proveedor {sortConfig?.key === 'entidad_razon_social' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />)}</div>
                  </th>
                  <th className="w-[16%] px-4 py-5 cursor-pointer hover:bg-black/5" onClick={() => handleSort('total_factura_cop')}>
                    <div className="flex items-center truncate">Total {sortConfig?.key === 'total_factura_cop' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />)}</div>
                  </th>
                  <th className="w-[20%] px-4 py-5 cursor-pointer hover:bg-black/5 text-center" onClick={() => handleSort('estado_reconciliacion')}>
                    <div className="flex items-center justify-center truncate">Estado {sortConfig?.key === 'estado_reconciliacion' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />)}</div>
                  </th>
                  <th className="w-[12%] px-4 py-5 text-center">
                    <div className="flex items-center justify-center truncate">Acción</div>
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-white/10' : 'divide-black/5'}`}>
                {currentFacturas.length > 0 ? (
                  currentFacturas.map((factura) => {
                    const isOk = factura.estado_reconciliacion.toLowerCase().includes('conciliado');
                    return (
                      <tr key={factura.numero_factura} className={`transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
                        <td className="px-4 py-4 font-medium truncate">{factura.numero_factura}</td>
                        <td className="px-4 py-4 truncate">{factura.fecha_emision}</td>
                        <td className="px-4 py-4 truncate" title={factura.entidad_razon_social}>{factura.entidad_razon_social}</td>
                        <td className="px-4 py-4 font-mono font-semibold truncate">{formatCurrency(factura.total_factura_cop)}</td>
                        <td className="px-4 py-4">
                          <span className={`block w-full py-1.5 rounded-lg text-xs font-bold text-center truncate px-1 shadow-sm ${getBadgeStyle(factura.estado_reconciliacion, isDark)}`} title={factura.estado_reconciliacion.toUpperCase()}>
                            {factura.estado_reconciliacion.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-4 flex justify-center">
                          {/* Renderizado condicional del botón de Acción */}
                          {!isOk ? (
                            <button 
                              onClick={() => handleResolver(factura.numero_factura)}
                              className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-transform hover:scale-105 active:scale-95 shadow-md ${isDark ? 'bg-indigo-500 hover:bg-indigo-400 text-white' : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'}`}
                            >
                              <Wrench className="w-3 h-3" /> Resolver
                            </button>
                          ) : (
                            <span className={`opacity-40 font-bold ${textMain}`}>-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className={`px-4 py-20 text-center ${textMuted}`}>
                      {!isLoading && (
                        <>
                          <Inbox className="w-12 h-12 mx-auto mb-4 opacity-40" />
                          <p className="text-lg font-semibold">No hay resultados</p>
                        </>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-slate-50'}`}>
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-semibold ${textMain}`}>Mostrar:</span>
              <select value={itemsPerPage} onChange={(e) => setItemsPerPage(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))} className={`text-xs bg-transparent border rounded p-1 outline-none ${isDark ? 'border-white/20 text-white' : 'border-black/20 text-black'}`}>
                <option value={10} className="text-black">10</option>
                <option value={20} className="text-black">20</option>
                <option value={50} className="text-black">50</option>
                <option value="ALL" className="text-black">Todos</option>
              </select>
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center space-x-4">
                <span className={`text-xs font-medium ${textMuted}`}>Pág {currentPage} de {totalPages}</span>
                <div className="flex space-x-2">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className={`p-1.5 rounded-lg transition-colors ${currentPage === 1 ? 'opacity-50' : (isDark ? 'hover:bg-white/20' : 'hover:bg-black/10')}`}><ChevronLeft className="w-5 h-5" /></button>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className={`p-1.5 rounded-lg transition-colors ${currentPage === totalPages ? 'opacity-50' : (isDark ? 'hover:bg-white/20' : 'hover:bg-black/10')}`}><ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            )}
          </div>
        </TableContainer>
      </div>

      {/* =============================== */}
      {/* DERECHA: FILTROS (Sidebar)      */}
      {/* =============================== */}
      <div className="w-full lg:w-1/4 flex flex-col lg:mt-16">
        <GlassCard isDark={isDark} className="p-6 sticky top-8 max-h-[85vh] overflow-y-auto overflow-x-hidden scrollbar-hide">
          <h3 className={`font-bold mb-4 border-b pb-3 flex items-center gap-2 ${isDark ? 'border-white/20' : 'border-black/10'} ${textMain}`}>
            <Filter className="w-4 h-4"/> Búsqueda Avanzada
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className={`text-[11px] uppercase tracking-wider font-bold opacity-70 ${textMain}`}>ID Factura</label>
              <input type="text" value={filtros.id} onChange={(e) => setFiltros({...filtros, id: e.target.value})} placeholder="Ej: FE-123" className={`w-full p-2 rounded-lg border text-sm outline-none transition-colors ${isDark ? 'bg-black/20 border-white/10 focus:border-teal-400 text-white placeholder-white/30' : 'bg-white/50 border-black/10 focus:border-teal-500 text-black placeholder-black/40'}`} />
            </div>

            <div className="space-y-1.5">
              <label className={`text-[11px] uppercase tracking-wider font-bold opacity-70 ${textMain}`}>Proveedor</label>
              <input type="text" value={filtros.proveedor} onChange={(e) => setFiltros({...filtros, proveedor: e.target.value})} placeholder="Ej: Novaventa" className={`w-full p-2 rounded-lg border text-sm outline-none transition-colors ${isDark ? 'bg-black/20 border-white/10 focus:border-teal-400 text-white placeholder-white/30' : 'bg-white/50 border-black/10 focus:border-teal-500 text-black placeholder-black/40'}`} />
            </div>

            <div className="space-y-1.5">
              <label className={`text-[11px] uppercase tracking-wider font-bold opacity-70 ${textMain}`}>Estado</label>
              <select value={filtros.estado} onChange={(e) => setFiltros({...filtros, estado: e.target.value})} className={`w-full p-2 rounded-lg border text-sm outline-none transition-colors ${isDark ? 'bg-slate-800 border-white/10 focus:border-teal-400 text-white' : 'bg-white/80 border-black/10 focus:border-teal-500 text-black'}`}>
                <option value="Todos">Todos los estados</option>
                <option value="Conciliado">Conciliado (Éxito)</option>
                <option value="Discrepancia detectada">Discrepancia (Error)</option>
                <option value="Sin registro contable">Sin Registro</option>
              </select>
            </div>

            <div className={`space-y-2 border-t pt-3 ${isDark ? 'border-white/10' : 'border-black/10'}`}>
              <label className={`text-[11px] uppercase tracking-wider font-bold opacity-70 ${textMain}`}>Fechas</label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs w-10 ${textMuted}`}>Desde</span>
                  <input type="date" value={filtros.fechaDesde} onChange={(e) => setFiltros({...filtros, fechaDesde: e.target.value})} className={`flex-1 p-1.5 rounded-md border text-xs outline-none ${isDark ? 'bg-black/20 border-white/10 text-white' : 'bg-white/50 border-black/10 text-black'}`} />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs w-10 ${textMuted}`}>Hasta</span>
                  <input type="date" value={filtros.fechaHasta} onChange={(e) => setFiltros({...filtros, fechaHasta: e.target.value})} className={`flex-1 p-1.5 rounded-md border text-xs outline-none ${isDark ? 'bg-black/20 border-white/10 text-white' : 'bg-white/50 border-black/10 text-black'}`} />
                </div>
              </div>
            </div>

            <div className={`space-y-2 border-t pt-3 ${isDark ? 'border-white/10' : 'border-black/10'}`}>
              <label className={`text-[11px] uppercase tracking-wider font-bold opacity-70 ${textMain}`}>Monto (COP)</label>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Mínimo" value={filtros.precioMin} onChange={(e) => setFiltros({...filtros, precioMin: e.target.value})} className={`w-full p-2 rounded-lg border text-sm outline-none ${isDark ? 'bg-black/20 border-white/10 text-white placeholder-white/30' : 'bg-white/50 border-black/10 text-black placeholder-black/40'}`} />
                <span className={textMuted}>-</span>
                <input type="number" placeholder="Máximo" value={filtros.precioMax} onChange={(e) => setFiltros({...filtros, precioMax: e.target.value})} className={`w-full p-2 rounded-lg border text-sm outline-none ${isDark ? 'bg-black/20 border-white/10 text-white placeholder-white/30' : 'bg-white/50 border-black/10 text-black placeholder-black/40'}`} />
              </div>
            </div>

            {(filtros.id || filtros.proveedor || filtros.estado !== 'Todos' || filtros.fechaDesde || filtros.fechaHasta || filtros.precioMin || filtros.precioMax) && (
              <button onClick={() => setFiltros(defaultFilters)} className={`w-full mt-2 py-2 rounded-lg font-semibold text-xs transition-colors border ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 border-black/10 text-slate-700'}`}>
                Limpiar Filtros
              </button>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default HistoryView;