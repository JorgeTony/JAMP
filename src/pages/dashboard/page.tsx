import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWithAuth } from '../../utils/api';

interface DashboardStats {
  totalProductos: number;
  valorTotalInventario: number;
  productosStockBajo: number;
  productosVencimiento: number;
}

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  stock: number;
  stockMinimo: number;
  precio: number;
  fechaVencimiento?: string; // 👈 nuevo campo
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalProductos: 0,
    valorTotalInventario: 0,
    productosStockBajo: 0,
    productosVencimiento: 0
  });
  const [topProducts, setTopProducts] = useState<Producto[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Producto[]>([]);
  const [proximosAVencer, setProximosAVencer] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // Fallback de usuario por defecto si no hay sesión
      setUser({
        name: 'María González',
        role: 'Administrador de Inventario',
        avatar:
          'https://readdy.ai/api/search-image?query=professional%20administrator%20icon%20business%20management%20executive%20leader%20corporate%20symbol%20clean%20minimalist%20design%20dark%20blue%20background&width=40&height=40&seq=1&orientation=squarish'
      });
    }
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar productos usando la función con autenticación
      const productos = await getWithAuth<Producto[]>('/productos/api');

      // Calcular estadísticas
      const totalProductos = productos.length;
      const valorTotalInventario = productos.reduce(
        (total, producto) => total + producto.stock * producto.precio,
        0
      );
      const productosStockBajo = productos.filter(
        (producto) => producto.stock <= producto.stockMinimo
      ).length;

      // Productos con mayor stock (simulando rotación)
      const productosOrdenados = [...productos].sort((a, b) => b.stock - a.stock);
      const topProductsData = productosOrdenados.slice(0, 5);

      // Productos con stock bajo
      const lowStockData = productos
        .filter((producto) => producto.stock <= producto.stockMinimo)
        .sort(
          (a, b) =>
            a.stock / (a.stockMinimo || 1) - b.stock / (b.stockMinimo || 1)
        )
        .slice(0, 4);

      // Cargar productos próximos a vencer desde el backend
      // Espera que el endpoint devuelva: { total: number; productos: Producto[] }
      const vencimientos = await getWithAuth<{
        total: number;
        productos: Producto[];
      }>('/reportes/api/vencimientos?dias=30');

      setStats({
        totalProductos,
        valorTotalInventario,
        productosStockBajo,
        productosVencimiento: vencimientos?.total ?? 0
      });

      setTopProducts(topProductsData);
      setLowStockProducts(lowStockData);
      setProximosAVencer(vencimientos?.productos ?? []);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      setError(
        'Error al cargar los datos. Verifica que el servidor esté funcionando y que hayas iniciado sesión.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Función para obtener el icono según el rol
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

 

  const getStatusColor = (stock: number, stockMinimo: number) => {
    if (stock <= stockMinimo * 0.5) return 'bg-red-100 text-red-700';
    if (stock <= stockMinimo) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  const getStatusText = (stock: number, stockMinimo: number) => {
    if (stock <= stockMinimo * 0.5) return 'Crítico';
    if (stock <= stockMinimo) return 'Bajo';
    return 'Normal';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header className="bg-slate-700 shadow-sm">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 lg:space-x-6">
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

              {/* Desktop Navigation Menu */}
              <nav className="hidden lg:flex items-center space-x-8">
                <button className="text-white bg-blue-600 px-3 py-1 rounded-md font-medium whitespace-nowrap">
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/productos')}
                  className="text-blue-200 hover:text-white font-medium transition-colors whitespace-nowrap"
                >
                  Productos
                </button>
                <button
                  onClick={() => navigate('/inventario')}
                  className="text-blue-200 hover:text-white font-medium transition-colors whitespace-nowrap"
                >
                  Inventario
                </button>
                <button
                  onClick={() => navigate('/reportes')}
                  className="text-blue-200 hover:text-white font-medium transition-colors whitespace-nowrap"
                >
                  Reportes
                </button>
                <button
                  onClick={() => navigate('/configuracion')}
                  className="text-blue-200 hover:text-white font-medium transition-colors whitespace-nowrap"
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
                  className={`${
                    mobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'
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
                <button className="text-white bg-blue-600 px-3 py-2 rounded-md font-medium text-left">
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
                <button
                  onClick={() => {
                    navigate('/inventario');
                    setMobileMenuOpen(false);
                  }}
                  className="text-blue-200 hover:text-white font-medium transition-colors text-left py-2"
                >
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

              {/* Mobile User Info */}
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

      <div className="px-4 lg:px-6 py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h2>
          <p className="text-gray-600">
            Panel de control con métricas principales del inventario
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <i className="ri-error-warning-line text-red-500 text-xl mr-3"></i>
              <div>
                <h3 className="text-red-800 font-medium">Error de Conexión</h3>
                <p className="text-red-700 text-sm">{error}</p>
                <button
                  onClick={loadDashboardData}
                  className="text-red-600 hover:text-red-800 text-sm font-medium mt-2"
                >
                  Intentar nuevamente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <div className="flex items-center space-x-4">
            {/* Aquí antes estaba el filtro de rango de fechas y exportar reporte, ya eliminados */}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadDashboardData}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2 whitespace-nowrap"
            >
              <i className="ri-refresh-line"></i>
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {[
            {
              title: 'Total de Productos',
              value: stats.totalProductos.toString(),
              items: 'productos registrados',
              change: '+15.2%',
              trend: 'up',
              icon: 'ri-archive-line',
              color: 'text-blue-600',
              bgColor: 'bg-blue-50'
            },
            {
              title: 'Valor Total Inventario',
              value: `S/ ${stats.valorTotalInventario.toLocaleString('es-ES', {
                minimumFractionDigits: 2
              })}`,
              items: 'valor total',
              change: '+8.4%',
              trend: 'up',
              icon: 'ri-money-dollar-circle-line',
              color: 'text-green-600',
              bgColor: 'bg-green-50'
            },
            {
              title: 'Productos Stock Bajo',
              value: stats.productosStockBajo.toString(),
              items: 'requieren atención',
              change: stats.productosStockBajo > 0 ? '+5.1%' : '0%',
              trend: stats.productosStockBajo > 0 ? 'up' : 'neutral',
              icon: 'ri-alert-line',
              color: 'text-red-600',
              bgColor: 'bg-red-50'
            },
            {
              title: 'Próximos a Vencer',
              value: stats.productosVencimiento.toString(),
              items: 'en 30 días',
              change: '-12.3%',
              trend: 'down',
              icon: 'ri-time-line',
              color: 'text-orange-600',
              bgColor: 'bg-orange-50'
            }
          ].map((metric, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-10 h-10 lg:w-12 lg:h-12 ${metric.bgColor} rounded-lg flex items-center justify-center`}
                >
                  <i
                    className={`${metric.icon} ${metric.color} text-lg lg:text-xl`}
                  ></i>
                </div>
                <div
                  className={`flex items-center space-x-1 text-sm ${
                    metric.trend === 'up'
                      ? 'text-green-600'
                      : metric.trend === 'down'
                      ? 'text-red-600'
                      : 'text-gray-500'
                  }`}
                >
                  {metric.trend === 'up' && (
                    <i className="ri-arrow-up-line"></i>
                  )}
                  {metric.trend === 'down' && (
                    <i className="ri-arrow-down-line"></i>
                  )}
                  <span>{metric.change}</span>
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                {metric.title}
              </h3>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">
                {metric.value}
              </p>
              <p className="text-sm text-gray-500">{metric.items}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 lg:p-6 border-b border-gray-100">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                Productos con Mayor Stock
              </h3>
              <p className="text-sm text-gray-600">
                Productos con mayor cantidad en inventario
              </p>
            </div>
            <div className="p-4 lg:p-6">
              {topProducts.length === 0 ? (
                <div className="text-center py-8">
                  <i className="ri-archive-line text-3xl text-gray-400 mb-2"></i>
                  <p className="text-gray-600">No hay productos registrados</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm lg:text-base truncate">
                          {product.nombre}
                        </h4>
                        <p className="text-xs lg:text-sm text-gray-600">
                          {product.categoria}
                        </p>
                      </div>
                      <div className="text-right mr-2 lg:mr-4">
                        <p className="font-semibold text-gray-900 text-sm lg:text-base">
                          {product.stock}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-600">
                          unidades
                        </p>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
                            product.stock,
                            product.stockMinimo
                          )}`}
                        >
                          {getStatusText(
                            product.stock,
                            product.stockMinimo
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 lg:p-6 border-b border-gray-100">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                Productos con Stock Bajo
              </h3>
              <p className="text-sm text-gray-600">
                Productos que necesitan reposición
              </p>
            </div>
            <div className="p-4 lg:p-6">
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-8">
                  <i className="ri-check-line text-3xl text-green-400 mb-2"></i>
                  <p className="text-gray-600">
                    Todos los productos tienen stock adecuado
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lowStockProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 lg:p-4 bg-red-50 rounded-lg border border-red-100"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm lg:text-base truncate">
                          {product.nombre}
                        </h4>
                        <p className="text-xs lg:text-sm text-gray-600">
                          {product.categoria}
                        </p>
                      </div>
                      <div className="text-right mr-2 lg:mr-4">
                        <p className="font-medium text-gray-900 text-sm lg:text-base">
                          {product.stock}/{product.stockMinimo}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-600">
                          actual/mínimo
                        </p>
                      </div>
                      <span className="px-2 lg:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-red-100 text-red-700">
                        Urgente
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Productos Próximos a Vencer */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 lg:p-6 border-b border-gray-100">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                Productos Próximos a Vencer
              </h3>
              <p className="text-sm text-gray-600">
                Productos con vencimiento en los próximos 30 días
              </p>
            </div>
            <div className="p-4 lg:p-6">
              {proximosAVencer.length === 0 ? (
                <div className="text-center py-8">
                  <i className="ri-time-line text-3xl text-gray-400 mb-2"></i>
                  <p className="text-gray-600">
                    No hay productos próximos a vencer
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {proximosAVencer.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 lg:p-4 bg-orange-50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm lg:text-base truncate">
                          {p.nombre}
                        </h4>
                        <p className="text-xs lg:text-sm text-gray-600">
                          Código: {p.codigo}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-600">
                          Stock actual: {p.stock}
                        </p>
                      </div>
                      <div className="text-right mr-2 lg:mr-4">
                        <p className="font-semibold text-gray-900 text-sm lg:text-base">
                          {p.fechaVencimiento
                            ? new Date(p.fechaVencimiento).toLocaleDateString(
                                'es-PE'
                              )
                            : 'Sin fecha'}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-600">
                          Fecha de vencimiento
                        </p>
                      </div>
                      <span className="px-2 lg:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-orange-100 text-orange-700">
                        Atención
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cost Analysis Chart Placeholder */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 lg:p-6 border-b border-gray-100">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                Análisis de Costos por Categoría
              </h3>
              <p className="text-sm text-gray-600">
                Distribución del valor del inventario
              </p>
            </div>
            <div className="p-4 lg:p-6">
              <div className="space-y-4">
                {/* Calcular distribución por categoría */}
                {(() => {
                  const categorias = topProducts.reduce(
                    (acc, product) => {
                      const categoria = product.categoria || 'Sin categoría';
                      const valor = product.stock * product.precio;
                      acc[categoria] = (acc[categoria] || 0) + valor;
                      return acc;
                    },
                    {} as Record<string, number>
                  );

                  const total = Object.values(categorias).reduce(
                    (sum, val) => sum + val,
                    0
                  );
                  const colors = [
                    'bg-blue-500',
                    'bg-green-500',
                    'bg-yellow-500',
                    'bg-purple-500',
                    'bg-red-500'
                  ];

                  if (topProducts.length === 0 || total === 0) {
                    return (
                      <div className="text-center py-4">
                        <p className="text-gray-600">No hay datos para mostrar</p>
                      </div>
                    );
                  }

                  return Object.entries(categorias).map(
                    ([categoria, valor], index) => (
                      <div
                        key={categoria}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-3 h-3 lg:w-4 lg:h-4 ${
                              colors[index % colors.length]
                            } rounded`}
                          ></div>
                          <span className="text-sm font-medium">{categoria}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-sm lg:text-base">
                            S{' '}
                            {valor.toLocaleString('es-ES', {
                              minimumFractionDigits: 2
                            })}
                          </span>
                          <span className="text-xs lg:text-sm text-gray-600 ml-2">
                            (
                            {total > 0
                              ? ((valor / total) * 100).toFixed(1)
                              : 0}
                            %)
                          </span>
                        </div>
                      </div>
                    )
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
}
