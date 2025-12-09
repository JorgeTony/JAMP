import React, { useState, useEffect } from 'react';
import { getWithAuth } from '../../utils/api';

interface User {
  nombre: string;
  rol: string;
}

interface HomeStats {
  totalProductos: number;
  valorTotalInventario: number;
  productosCriticos: number;
  transaccionesHoy: number;
}

const HomePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<HomeStats>({
    totalProductos: 0,
    valorTotalInventario: 0,
    productosCriticos: 0,
    transaccionesHoy: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backendConnected, setBackendConnected] = useState(false);

  useEffect(() => {
    // Cargar datos del usuario desde localStorage
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser({
          nombre: parsedUser.name || parsedUser.nombre || 'Usuario',
          rol: parsedUser.role || parsedUser.rol || 'Operador'
        });
      }
    } catch (e) {
      console.error('Error parsing user data from localStorage:', e);
      setUser(null);
    }
    
    loadHomeStats();
  }, []);

  const loadHomeStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar productos usando getWithAuth con JWT
      const productos = await getWithAuth('/productos/api');
      
      setBackendConnected(true);
      
      // Calcular estadísticas
      const totalProductos = productos.length;
      const valorTotalInventario = productos.reduce((total: number, producto: any) => 
        total + (producto.precio * producto.stock), 0
      );
      const productosCriticos = productos.filter((producto: any) => 
        producto.stock <= producto.stockMinimo
      ).length;
      
      setStats({
        totalProductos,
        valorTotalInventario,
        productosCriticos,
        transaccionesHoy: 0 // Por ahora 0, se puede implementar después
      });
      
    } catch (error) {
      console.error('Error loading home stats:', error);
      setBackendConnected(false);
      setError(error instanceof Error ? error.message : 'Error desconocido al cargar estadísticas');
      
      // Establecer valores por defecto cuando hay error
      setStats({
        totalProductos: 0,
        valorTotalInventario: 0,
        productosCriticos: 0,
        transaccionesHoy: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bienvenido{user ? `, ${user.nombre}` : ''}
              </h1>
              <p className="text-gray-600 mt-1">
                {user ? `Rol: ${user.rol}` : 'Inventarios JAMP'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                backendConnected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  backendConnected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span>{backendConnected ? 'Conectado' : 'Desconectado'}</span>
              </div>
              <button
                onClick={loadHomeStats}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="ri-refresh-line mr-2"></i>
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <i className="ri-error-warning-line text-red-500 text-xl mr-3 mt-0.5"></i>
              <div>
                <h3 className="text-red-800 font-medium">Error de Conexión</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <div className="mt-3 text-sm text-red-600">
                  <p><strong>Para solucionar:</strong></p>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Asegúrate de que PostgreSQL esté ejecutándose</li>
                    <li>Ejecuta el backend: <code className="bg-red-100 px-1 rounded">cd backend && mvn spring-boot:run</code></li>
                    <li>Verifica que el puerto 8080 esté disponible</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Productos</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProductos}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <i className="ri-box-3-line text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Inventario</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(stats.valorTotalInventario)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <i className="ri-money-dollar-circle-line text-green-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Productos Críticos</p>
                <p className="text-3xl font-bold text-red-600">{stats.productosCriticos}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <i className="ri-alert-line text-red-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transacciones Hoy</p>
                <p className="text-3xl font-bold text-gray-900">{stats.transaccionesHoy}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <i className="ri-exchange-line text-purple-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Acciones Rápidas */}
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              <i className="ri-lightning-line mr-2"></i>
              Acciones Rápidas
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/productos"
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <i className="ri-add-box-line text-blue-600 text-2xl mr-3"></i>
                <div>
                  <p className="font-medium text-gray-900">Nuevo Producto</p>
                  <p className="text-sm text-gray-600">Agregar al inventario</p>
                </div>
              </a>

              <a
                href="/transacciones"
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <i className="ri-exchange-box-line text-green-600 text-2xl mr-3"></i>
                <div>
                  <p className="font-medium text-gray-900">Nueva Transacción</p>
                  <p className="text-sm text-gray-600">Entrada/Salida</p>
                </div>
              </a>

              <a
                href="/almacenes"
                className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <i className="ri-building-line text-purple-600 text-2xl mr-3"></i>
                <div>
                  <p className="font-medium text-gray-900">Gestionar Almacenes</p>
                  <p className="text-sm text-gray-600">Ver ubicaciones</p>
                </div>
              </a>

              <a
                href="/reportes"
                className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <i className="ri-file-chart-line text-orange-600 text-2xl mr-3"></i>
                <div>
                  <p className="font-medium text-gray-900">Ver Reportes</p>
                  <p className="text-sm text-gray-600">Análisis y métricas</p>
                </div>
              </a>
            </div>
          </div>

          {/* Estado del Sistema */}
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              <i className="ri-dashboard-line mr-2"></i>
              Estado del Sistema
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <i className="ri-database-2-line text-gray-600 mr-3"></i>
                  <span className="text-gray-900">Base de Datos</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  backendConnected 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {backendConnected ? 'Conectada' : 'Desconectada'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <i className="ri-server-line text-gray-600 mr-3"></i>
                  <span className="text-gray-900">Servidor Backend</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  backendConnected 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {backendConnected ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <i className="ri-shield-check-line text-gray-600 mr-3"></i>
                  <span className="text-gray-900">Seguridad</span>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Activa
                </span>
              </div>
            </div>

            {!backendConnected && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <i className="ri-information-line mr-1"></i>
                  Para conectar el backend, ejecuta:
                </p>
                <code className="block mt-2 p-2 bg-yellow-100 rounded text-xs">
                  cd backend && mvn spring-boot:run
                </code>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
