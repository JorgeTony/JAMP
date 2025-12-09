import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWithAuth, postWithAuth } from '../../utils/api';

type User = {
  name?: string;
  role?: string;
};

type StockItem = {
  product: string;
  code?: string;
  category: string;
  ubicacion: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reserved: number;
  available: number;
  lastMovement: string;
  status: 'normal' | 'bajo' | 'crítico';
};

type MovimientoInventario = {
  id: number | null;
  date: string;
  time: string;
  product: string;
  warehouse: string;
  type: string;
  quantity: number;
  user: string;
  reference: string;
};

type Alerta = {
  id: number;
  type: string;
  product: string;
  message: string;
  severity: 'crítica' | 'alta' | 'media' | 'baja';
  warehouse: string;
  date: string;
};

export default function Inventario() {
  const navigate = useNavigate();

  const [selectedView, setSelectedView] = useState<'stock' | 'movimientos' | 'ubicaciones' | 'alertas'>('stock');
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [movementType, setMovementType] = useState('entrada');
  const [movementProduct, setMovementProduct] = useState('');
  const [movementWarehouse, setMovementWarehouse] = useState('');
  const [movementQuantity, setMovementQuantity] = useState<number | ''>('');
  const [movementNotes, setMovementNotes] = useState('');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<MovimientoInventario[]>([]);
  const [alerts, setAlerts] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        setUser(null);
      }
    }
    loadStock();
    loadMovements();
  }, []);

  // ===================== CARGA DE STOCK =====================
  const loadStock = async () => {
    try {
      setLoading(true);
      const data = await getWithAuth('/productos/api');

      const productos = Array.isArray(data) ? data : [];

      const formatted: StockItem[] = productos.map((p: any) => {
        const min = p.stock_minimo ?? p.stockMinimo ?? 10;
        const status: StockItem['status'] =
          p.stock <= min ? 'crítico' : p.stock <= min * 2 ? 'bajo' : 'normal';

        return {
          product: p.nombre ?? 'Producto',
          code: p.codigo,
          category: p.categoria || 'Sin categoría',
          ubicacion: p.ubicacion || 'Almacén',
          currentStock: p.stock ?? 0,
          minStock: min,
          maxStock: p.stockMaximo ?? 1000,
          reserved: 0,
          available: p.stock ?? 0,
          lastMovement: new Date().toISOString().split('T')[0],
          status
        };
      });

      setStockData(formatted);

      // Generar alertas
      const generatedAlerts: Alerta[] = formatted
        .filter((item) => item.status !== 'normal')
        .map((item, index) => ({
          id: index + 1,
          type: item.status === 'crítico' ? 'stock_crítico' : 'stock_bajo',
          product: item.product,
          message:
            item.status === 'crítico'
              ? 'Stock crítico o agotado - Reposición urgente'
              : 'Stock por debajo del mínimo recomendado',
          severity: item.status === 'crítico' ? 'crítica' : 'alta',
          warehouse: item.ubicacion || 'Almacén',
          date: new Date().toISOString().split('T')[0]
        }));

      setAlerts(generatedAlerts);
    } catch (err) {
      console.error('Error al cargar inventario:', err);
      setStockData([]);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };


  // ===================== CARGA DE MOVIMIENTOS (KARDEX SIMPLE) =====================

  const loadMovements = async () => {
    try {
      // Traemos las transacciones del backend
      const data = await getWithAuth('/transacciones/api');
      const txs = Array.isArray(data) ? data : [];

      console.log('Transacciones recibidas para Kardex (Inventario):', txs);

      const mapped: MovimientoInventario[] = txs.map((t: any, index: number) => {
        // -------- FECHA / HORA --------
        let fechaStr = '';
        let horaStr = '';

        if (t.fecha) {
          if (typeof t.fecha === 'string') {
            const parts = t.fecha.includes('T')
              ? t.fecha.split('T')
              : t.fecha.split(' ');
            fechaStr = (parts[0] || '').slice(0, 10);
            horaStr = (parts[1] || '').slice(0, 5);
          } else {
            const d = new Date(t.fecha);
            fechaStr = d.toISOString().slice(0, 10);
            horaStr = d.toTimeString().slice(0, 5);
          }
        }

        // -------- PRODUCTO / ALMACÉN (forma ACTUAL de tu backend) --------
        const productoNombre = t.producto || 'Producto';
        const almacNombre = t.almacen || 'Almacén';

        // -------- TIPO DE MOVIMIENTO --------
        const tipo = t.tipo || 'OTROS';

        // -------- CANTIDAD --------
        const quantity = t.cantidad ?? 0;

        // -------- RESPONSABLE / USUARIO --------
        const responsable = t.usuario || 'N/A';

        // -------- DOCUMENTO / REFERENCIA --------
        const referencia = t.codigo || '';

        return {
          id: t.id ?? index,
          date: fechaStr,
          time: horaStr,
          product: productoNombre,
          warehouse: almacNombre,
          type: tipo,
          quantity,
          user: responsable,
          reference: referencia,
        };
      });

      console.log('Movimientos MAPEADOS para Inventario:', mapped);
      setMovements(mapped);
    } catch (err) {
      console.error('Error al cargar movimientos de inventario:', err);
      setMovements([]);
    }
  };

  // ===================== REGISTRO NUEVO MOVIMIENTO =====================
  const handleMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!movementProduct || !movementWarehouse || !movementQuantity) {
      alert('Producto, almacén y cantidad son obligatorios');
      return;
    }

    try {
      // usuario desde localStorage
      let usuario = 'Sistema';
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const u = JSON.parse(userStr);
          usuario = u.name || u.username || 'Sistema';
        }
      } catch {
        // ignorar
      }

      const nowIso = new Date().toISOString();
      const cantidadNumber = Number(movementQuantity) || 0;

      // Regla: salidas/ajustes en negativo, entradas/transferencias en positivo
      const signedCantidad =
        movementType === 'salida' || movementType === 'ajuste'
          ? -Math.abs(cantidadNumber)
          : Math.abs(cantidadNumber);

      const nuevaTransaccion = {
        producto: movementProduct,
        almacen: movementWarehouse,
        cantidad: signedCantidad,
        codigo: null,
        estado: 'ACTIVO',
        fecha: nowIso,
        observaciones: movementNotes || null,
        tipo: movementType.toUpperCase(), // ENTRADA / SALIDA / TRANSFERENCIA / AJUSTE
        usuario,
      };

      await postWithAuth('/transacciones/api', nuevaTransaccion);
      await loadMovements(); // refresca tabla de kardex

      // limpiar formulario
      setMovementProduct('');
      setMovementWarehouse('');
      setMovementQuantity('');
      setMovementNotes('');
      setMovementType('entrada');
      setShowMovementModal(false);
    } catch (err) {
      console.error('Error registrando movimiento:', err);
      alert('No se pudo registrar el movimiento. Revisa la consola/servidor.');
    }
  };




  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getUserIcon = (role?: string) => {
    const userRole = role || user?.role || 'Operador';
    switch (userRole) {
      case 'Administrador':
      case 'Administrador de Inventario':
      case 'administrador':
        return 'https://readdy.ai/api/search-image?query=professional%20executive%20business%20leader%20corporate%20management%20icon%20dark%20blue%20background%20minimalist%20clean%20design%20administrative%20authority&width=32&height=32&seq=admin1&orientation=squarish';
      case 'Supervisor':
      case 'supervisor':
        return 'https://readdy.ai/api/search-image?query=professional%20team%20leader%20supervisor%20management%20icon%20green%20background%20minimalist%20clean%20design%20quality%20control%20oversight&width=32&height=32&seq=super1&orientation=squarish';
      case 'Operador':
      case 'operador':
      default:
        return 'https://readdy.ai/api/search-image?query=professional%20technical%20worker%20operator%20specialist%20icon%20orange%20background%20minimalist%20clean%20design%20inventory%20operations&width=32&height=32&seq=oper1&orientation=squarish';
    }
  };

 

  const views = [
    { id: 'stock', label: 'Estado de Stock', icon: 'ri-archive-line' },
    { id: 'movimientos', label: 'Kardex', icon: 'ri-exchange-line' },
    { id: 'ubicaciones', label: 'Ubicaciones', icon: 'ri-map-pin-line' },
    { id: 'alertas', label: 'Alertas', icon: 'ri-alert-line' }
  ] as const;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-700';
      case 'bajo':
        return 'bg-yellow-100 text-yellow-700';
      case 'crítico':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getMovementTypeColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('entrada')) return 'bg-green-100 text-green-700';
    if (t.includes('salida')) return 'bg-red-100 text-red-700';
    if (t.includes('transfer')) return 'bg-blue-100 text-blue-700';
    if (t.includes('ajuste')) return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'crítica':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'alta':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'media':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  

  // ===================== CONTENIDO POR PESTAÑA =====================
  const renderContent = () => {
    switch (selectedView) {
      case 'stock':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Estado Actual del Stock</h3>
              <p className="text-sm text-gray-600">
                Información detallada del inventario por almacén
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Disponible
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stockData.map((item, index) => (
                    <tr key={`${item.code || item.product || 'row'}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.product}</div>
                          <div className="text-sm text-gray-500">
                            {item.code} • {item.category}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.ubicacion}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">{item.currentStock}</div>
                          <div className="text-xs text-gray-500">
                            Min: {item.minStock} | Max: {item.maxStock}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">{item.available}</div>
                          <div className="text-xs text-gray-500">
                            Reservado: {item.reserved}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status === 'normal'
                            ? 'Normal'
                            : item.status === 'bajo'
                              ? 'Stock Bajo'
                              : 'Crítico'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {stockData.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-6 text-center text-sm text-gray-500"
                      >
                        No hay productos cargados en el inventario.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'movimientos':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Kardex de Inventario</h3>
                  <p className="text-sm text-gray-600">
                    Registro histórico de entradas y salidas por producto
                  </p>
                </div>
                <button
                  onClick={() => setShowMovementModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 whitespace-nowrap"
                >
                  <i className="ri-add-line"></i>
                  <span>Nuevo Movimiento</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referencia
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {movements.map((movement, index) => (
                    <tr
                      key={movement.id ?? `${movement.reference || 'mov'}-${index}`}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">{movement.date}</div>
                          <div className="text-gray-500">{movement.time}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">{movement.product}</div>
                          <div className="text-gray-500">{movement.warehouse}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getMovementTypeColor(
                            movement.type
                          )}`}
                        >
                          {movement.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm font-medium ${movement.type.toLowerCase().includes('entrada')
                            ? 'text-green-600'
                            : movement.type.toLowerCase().includes('salida')
                              ? 'text-red-600'
                              : 'text-blue-600'
                            }`}
                        >
                          {movement.type.toLowerCase().includes('entrada')
                            ? '+'
                            : movement.type.toLowerCase().includes('salida')
                              ? '-'
                              : ''}
                          {movement.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {movement.user}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {movement.reference || '-'}
                      </td>
                    </tr>
                  ))}
                  {movements.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-6 text-center text-sm text-gray-500"
                      >
                        No hay movimientos registrados para mostrar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'alertas':
        return (
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="bg-white border rounded-xl p-6 text-center">
                <h4 className="font-semibold text-lg mb-2">Sin alertas activas</h4>
                <p className="text-sm text-gray-600">
                  Actualmente no se detectan productos con stock bajo o crítico.
                </p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border rounded-xl p-6 ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <i
                          className={`${alert.type === 'stock_bajo'
                            ? 'ri-arrow-down-line'
                            : alert.type === 'stock_crítico'
                              ? 'ri-alert-line'
                              : 'ri-error-warning-line'
                            } text-2xl`}
                        ></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">
                          {alert.product}
                        </h4>
                        <p className="text-sm mb-2">{alert.message}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span>📍 {alert.warehouse}</span>
                          <span>📅 {alert.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <i className="ri-map-pin-line text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Gestión de Ubicaciones
            </h3>
            <p className="text-gray-600">
              Funcionalidad de ubicaciones en desarrollo
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header className="bg-slate-700 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <img
                  src={getUserIcon()}
                  alt="Sistema"
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <button
                  onClick={() => navigate('/')}
                  className="text-lg lg:text-xl font-bold text-white hover:text-blue-200 transition-colors cursor-pointer"
                >
                  Inventarios JAMP
                </button>
              </div>

              {/* Navigation Menu */}
              <nav className="hidden lg:flex items-center space-x-8">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-blue-200 hover:text-white font-medium transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/productos')}
                  className="text-blue-200 hover:text-white font-medium transition-colors"
                >
                  Productos
                </button>
                <button className="text-white bg-blue-600 px-3 py-1 rounded-md font-medium">
                  Inventario
                </button>
                <button
                  onClick={() => navigate('/reportes')}
                  className="text-blue-200 hover:text-white font-medium transition-colors"
                >
                  Reportes
                </button>
                <button
                  onClick={() => navigate('/configuracion')}
                  className="text-blue-200 hover:text-white font-medium transition-colors"
                >
                  Configuración
                </button>
              </nav>
            </div>

            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-white hover:text-blue-200"
              >
                <i
                  className={`${mobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'
                    } text-xl`}
                ></i>
              </button>

              
              

              <div className="hidden lg:flex items-center space-x-3">
                <img
                  src={getUserIcon(user?.role)}
                  alt={user?.name || 'Usuario'}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="text-sm">
                  <p className="font-medium text-white">
                    {user?.name || 'Usuario'}
                  </p>
                  <p className="text-blue-200">{user?.role || 'Rol'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-white hover:text-blue-200"
                  title="Cerrar sesión"
                >
                  <i className="ri-logout-box-line text-lg"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-slate-600">
              <nav className="flex flex-col space-y-2 mt-4">
                <button
                  onClick={() => {
                    navigate('/dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="text-blue-200 hover:text-white font-medium transition-colors text-left py-2"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    navigate('/productos');
                    setMobileMenuOpen(false);
                  }}
                  className="text-blue-200 hover:text-white font-medium transition-colors text-left py-2"
                >
                  Productos
                </button>
                <button className="text-white bg-blue-600 px-3 py-2 rounded-md font-medium text-left">
                  Inventario
                </button>
                <button
                  onClick={() => {
                    navigate('/reportes');
                    setMobileMenuOpen(false);
                  }}
                  className="text-blue-200 hover:text-white font-medium transition-colors text-left py-2"
                >
                  Reportes
                </button>
                <button
                  onClick={() => {
                    navigate('/configuracion');
                    setMobileMenuOpen(false);
                  }}
                  className="text-blue-200 hover:text-white font-medium transition-colors text-left py-2"
                >
                  Configuración
                </button>
              </nav>

              <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-slate-600">
                <img
                  src={getUserIcon(user?.role)}
                  alt={user?.name || 'Usuario'}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="text-sm">
                  <p className="font-medium text-white">
                    {user?.name || 'Usuario'}
                  </p>
                  <p className="text-blue-200">{user?.role || 'Rol'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-white hover:text-blue-200"
                  title="Cerrar sesión"
                >
                  <i className="ri-logout-box-line text-lg"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Control de Inventario
          </h2>
          <p className="text-gray-600">
            Monitorea y gestiona el stock en tiempo real
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() =>
                  setSelectedView(view.id as typeof selectedView)
                }
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${selectedView === view.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <i className={`${view.icon} text-lg`}></i>
                <span>{view.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading && selectedView === 'stock' ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando inventario...</p>
          </div>
        ) : (
          renderContent()
        )}
      </div>

      {/* Movement Modal */}
      {showMovementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Registrar Movimiento
                </h2>
                <button
                  onClick={() => setShowMovementModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6">
              <form className="space-y-6" onSubmit={handleMovementSubmit}>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Movimiento
                    </label>
                    <select
                      value={movementType}
                      onChange={(e) =>
                        setMovementType(
                          e.target.value as 'entrada' | 'salida' | 'transferencia' | 'ajuste'
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
                    >
                      <option value="entrada">Entrada</option>
                      <option value="salida">Salida</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="ajuste">Ajuste</option>
                    </select>

                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Producto
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
                      value={movementProduct}
                      onChange={(e) => setMovementProduct(e.target.value)}
                    >
                      <option value="">Seleccionar producto</option>
                      {stockData.map((item, idx) => (
                        <option
                          key={`prod-${item.code || item.product || idx}`}
                          value={item.product}
                        >
                          {item.product}
                        </option>
                      ))}
                    </select>

                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      value={movementQuantity}
                      onChange={(e) =>
                        setMovementQuantity(
                          e.target.value === '' ? '' : Number(e.target.value)
                        )
                      }
                    />

                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Almacén
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej. ALM001-A1"
                      value={movementWarehouse}
                      onChange={(e) => setMovementWarehouse(e.target.value)}
                    />

                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describir el motivo del movimiento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Observaciones adicionales (opcional)"
                    value={movementNotes}
                    onChange={(e) => setMovementNotes(e.target.value)}
                  />

                </div>

                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowMovementModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
                  >
                    Registrar Movimiento
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
}
