import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWithAuth } from '../../utils/api';

export default function Reportes() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('ventas');
  const [dateRange, setDateRange] = useState('6m');
  const [currency, setCurrency] = useState('USD');
  const [exchangeRate] = useState(3.75);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [reportData, setReportData] = useState<any>(null);         // /reportes/api
  const [inventoryReport, setInventoryReport] = useState<any>(null); // /reportes/api/productos
  const [loading, setLoading] = useState(true);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [stockMovements, setStockMovements] = useState<any[]>([]);
  const [ventas, setVentas] = useState<any[]>([]);                 // ventas (SALIDA/VENTA)

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchReportData();
  }, [selectedTab]);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      const [resumen, transacciones, alertasStock, reporteProductos] =
        await Promise.all([
          getWithAuth('/reportes/api'),
          getWithAuth('/transacciones/api'),
          getWithAuth('/reportes/api/stock-bajo'),
          getWithAuth('/reportes/api/productos'),
        ]);

      setReportData(resumen || null);
      setStockMovements(Array.isArray(transacciones) ? transacciones : []);
      setLowStockProducts(Array.isArray(alertasStock) ? alertasStock : []);
      setInventoryReport(reporteProductos || null);

      // 👉 Ventas = SALIDA o VENTA (por si luego agregas VENTA)
      const ventasFiltradas = (Array.isArray(transacciones) ? transacciones : []).filter(
        (t: any) => {
          const tipo = (t.tipo || '').toUpperCase();
          return tipo === 'SALIDA' || tipo === 'VENTA';
        }
      );
      setVentas(ventasFiltradas);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    } finally {
      setLoading(false);
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

  const convertCurrency = (amount: number) => {
    if (currency === 'PEN') {
      return amount * exchangeRate;
    }
    return amount;
  };

  const formatCurrency = (amount: number) => {
    const convertedAmount = convertCurrency(amount);
    if (currency === 'PEN') {
      return `S/ ${convertedAmount.toLocaleString('es-PE', {
        minimumFractionDigits: 2,
      })}`;
    }
    return `$${convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  // 👉 Construye ventas por mes a partir de las transacciones de ventas
  const buildSalesData = (ventasData: any[]) => {
    if (!Array.isArray(ventasData) || ventasData.length === 0) return [];

    const porMes: Record<string, number> = {};

    ventasData.forEach((t: any) => {
      if (!t.fecha || t.cantidad == null) return;
      const fecha = new Date(t.fecha);
      const mes = fecha.toLocaleDateString('es-PE', { month: 'short' }); // ene, feb, mar…
      porMes[mes] = (porMes[mes] || 0) + Number(t.cantidad);
    });

    return Object.entries(porMes).map(([month, value]) => ({ month, value }));
  };

  // 👉 Métricas de ventas (usa precioUnitario / total / producto.precio)
  const computeSalesMetrics = (ventasData: any[]) => {
    let totalImporte = 0;
    let totalUnidades = 0;

    if (!Array.isArray(ventasData)) {
      return { totalImporte: 0, totalUnidades: 0, ticketPromedio: 0 };
    }

    ventasData.forEach((v: any) => {
      const cantidad = Number(v.cantidad) || 0;
      totalUnidades += cantidad;

      const precioUnitario =
        Number(
          v.precioUnitario ??
          v.precio ??
          v.montoUnitario ??
          v.producto?.precioVenta ??
          v.producto?.precio
        ) || 0;

      const totalLinea =
        Number(v.total ?? v.monto) || precioUnitario * cantidad;

      totalImporte += totalLinea;
    });

    const ticketPromedio =
      ventasData.length > 0 ? totalImporte / ventasData.length : 0;

    return { totalImporte, totalUnidades, ticketPromedio };
  };

  // 👉 Métricas de movimientos (resumen + tarjetas)
  const computeMovementStats = (movs: any[]) => {
    const stats = {
      entradas: { movimientos: 0, unidades: 0 },
      salidas: { movimientos: 0, unidades: 0 },
      transferencias: { movimientos: 0, unidades: 0 },
      ajustes: { movimientos: 0, unidades: 0 },
    };

    if (!Array.isArray(movs)) return stats;

    movs.forEach((m) => {
      const tipo = (m.tipo || '').toUpperCase();
      const cant = Number(m.cantidad) || 0;

      if (tipo === 'ENTRADA') {
        stats.entradas.movimientos++;
        stats.entradas.unidades += cant;
      } else if (tipo === 'SALIDA') {
        stats.salidas.movimientos++;
        stats.salidas.unidades += cant;
      } else if (tipo === 'TRANSFERENCIA') {
        stats.transferencias.movimientos++;
        stats.transferencias.unidades += cant;
      } else if (tipo === 'AJUSTE') {
        stats.ajustes.movimientos++;
        stats.ajustes.unidades += cant;
      }
    });

    return stats;
  };

  

  const tabs = [
    { id: 'ventas', label: 'Reporte de Ventas', icon: 'ri-line-chart-line' },
    { id: 'inventario', label: 'Estado de Inventario', icon: 'ri-archive-line' },
    { id: 'movimientos', label: 'Movimientos de Stock', icon: 'ri-exchange-line' },
    { id: 'financiero', label: 'Reporte Financiero', icon: 'ri-money-dollar-circle-line' },
  ];

  const categoryData = [
    { name: 'Medicamentos', value: 65, color: 'bg-blue-500' },
    { name: 'Material Médico', value: 20, color: 'bg-green-500' },
    { name: 'EPP', value: 10, color: 'bg-orange-500' },
    { name: 'Equipos', value: 5, color: 'bg-purple-500' },
  ];

  const getTabData = () => {
    const baseValue = reportData?.valorTotalInventario || 348750;
    const movementStats = computeMovementStats(stockMovements);

    switch (selectedTab) {
      case 'inventario':
        return {
          metrics: [
            {
              title: 'Total de Productos',
              value: reportData?.totalProductos || '3,245',
              subtitle: 'En inventario',
              change: '+5.2%',
              icon: 'ri-archive-line',
              color: 'bg-blue-500',
            },
            {
              title: 'Valor Total',
              value: formatCurrency(baseValue),
              subtitle: 'Costo del inventario',
              change: '+12.8%',
              icon: 'ri-money-dollar-circle-line',
              color: 'bg-green-500',
            },
            {
              title: 'Stock Bajo',
              value: reportData?.productosStockBajo || '23',
              subtitle: 'Requieren reposición',
              change: '-8.1%',
              icon: 'ri-alert-line',
              color: 'bg-red-500',
            },
            {
              title: 'Próximos a Vencer',
              value: '18',
              subtitle: 'En 30 días',
              change: '+3.4%',
              icon: 'ri-time-line',
              color: 'bg-orange-500',
            },
          ],
          chartTitle: 'Distribución de Stock por Categoría',
          tableTitle: 'Estado Actual del Inventario',
        };

      case 'movimientos':
        return {
          metrics: [
            {
              title: 'Entradas',
              value: movementStats.entradas.movimientos.toString(),
              subtitle: 'Movimientos de entrada',
              change: '+18.5%',
              icon: 'ri-arrow-down-line',
              color: 'bg-green-500',
            },
            {
              title: 'Salidas',
              value: movementStats.salidas.movimientos.toString(),
              subtitle: 'Movimientos de salida',
              change: '-5.2%',
              icon: 'ri-arrow-up-line',
              color: 'bg-red-500',
            },
            {
              title: 'Transferencias',
              value: movementStats.transferencias.movimientos.toString(),
              subtitle: 'Entre almacenes',
              change: '+12.1%',
              icon: 'ri-exchange-line',
              color: 'bg-purple-500',
            },
            {
              title: 'Ajustes',
              value: movementStats.ajustes.movimientos.toString(),
              subtitle: 'Correcciones',
              change: '-15.3%',
              icon: 'ri-settings-line',
              color: 'bg-orange-500',
            },
          ],
          chartTitle: 'Movimientos de Stock por Mes',
          tableTitle: 'Últimos Movimientos',
        };

      case 'financiero': {
        let costoTotal = 248500;

        if (inventoryReport?.valorPorCategoria) {
          if (Array.isArray(inventoryReport.valorPorCategoria)) {
            costoTotal = inventoryReport.valorPorCategoria.reduce(
              (sum: number, item: any) =>
                sum + Number(item.valorTotal ?? item.valor ?? item.monto ?? 0),
              0
            );
          } else if (typeof inventoryReport.valorPorCategoria === 'object') {
            costoTotal = Object.values(inventoryReport.valorPorCategoria).reduce(
              (sum: number, cost: any) => sum + Number(cost || 0),
              0
            );
          }
        }

        const totalProductos = reportData?.totalProductos || 0;
        const costoPromedio =
          totalProductos > 0 ? costoTotal / totalProductos : 0;

        return {
          metrics: [
            {
              title: 'Costo Total',
              value: formatCurrency(costoTotal),
              subtitle: 'Valor del inventario',
              change: '+8.7%',
              icon: 'ri-money-dollar-circle-line',
              color: 'bg-green-500',
            },
            {
              title: 'Costo Promedio',
              value: formatCurrency(costoPromedio),
              subtitle: 'Por producto',
              change: '+3.2%',
              icon: 'ri-calculator-line',
              color: 'bg-blue-500',
            },
            {
              title: 'Rotación',
              value: '4.2x',
              subtitle: 'Veces por año',
              change: '+15.8%',
              icon: 'ri-refresh-line',
              color: 'bg-purple-500',
            },
            {
              title: 'Días de Stock',
              value: '87',
              subtitle: 'Días promedio',
              change: '-12.5%',
              icon: 'ri-calendar-line',
              color: 'bg-orange-500',
            },
          ],
          chartTitle: 'Análisis Financiero por Categoría',
          tableTitle: 'Métricas Financieras',
        };
      }

      default: {
        const { totalImporte, totalUnidades, ticketPromedio } =
          computeSalesMetrics(ventas);

        return {
          metrics: [
            {
              title: 'Ventas Totales',
              value: formatCurrency(totalImporte),
              subtitle: 'Ventas del período',
              change: '+12.5%',
              icon: 'ri-money-dollar-circle-line',
              color: 'bg-blue-500',
            },
            {
              title: 'Productos Vendidos',
              value: totalUnidades.toString(),
              subtitle: 'Unidades vendidas',
              change: '+8.2%',
              icon: 'ri-shopping-cart-line',
              color: 'bg-green-500',
            },
            {
              title: 'Ticket Promedio',
              value: formatCurrency(ticketPromedio),
              subtitle: 'Por transacción',
              change: '+3.1%',
              icon: 'ri-receipt-line',
              color: 'bg-purple-500',
            },
            {
              title: 'Margen Bruto',
              value: reportData?.margenBruto
                ? `${reportData.margenBruto}%`
                : '32.5%',
              subtitle: 'Margen estimado',
              change: '+1.8%',
              icon: 'ri-percent-line',
              color: 'bg-orange-500',
            },
          ],
          chartTitle: 'Tendencia de Ventas',
          tableTitle: 'Productos Más Vendidos',
        };
      }
    }
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'inventario':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
            {/* PRODUCTOS POR CATEGORÍA (conectado a BD) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 lg:p-6 border-b border-gray-100">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                  Productos por Categoría
                </h3>
                <p className="text-sm text-gray-600">Estado actual del inventario</p>
              </div>
              <div className="p-4 lg:p-6">
                <div className="space-y-4">
                  {(() => {
                    // /reportes/api -> productosPorCategoria (map)
                    // /reportes/api/productos -> estadisticasPorCategoria (map)
                    const productosPorCategoria: any =
                      reportData?.productosPorCategoria ||
                      inventoryReport?.estadisticasPorCategoria ||
                      null;

                    const valorPorCategoria: any =
                      inventoryReport?.valorPorCategoria || {};

                    if (
                      !productosPorCategoria ||
                      Object.keys(productosPorCategoria).length === 0
                    ) {
                      return (
                        <p className="text-sm text-gray-500">
                          No hay datos de categorías disponibles.
                        </p>
                      );
                    }

                    return Object.entries(productosPorCategoria).map(
                      ([categoria, cantidad]: any, index: number) => {
                        const stock = Number(cantidad) || 0;
                        const value =
                          Number(valorPorCategoria[categoria] ?? 0) || 0;
                        const status = stock < 50 ? 'bajo' : 'normal';

                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <h4 className="font-medium text-gray-900 text-sm lg:text-base">
                                {categoria || 'Sin categoría'}
                              </h4>
                              <p className="text-xs lg:text-sm text-gray-600">
                                {stock} productos
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 text-sm lg:text-base">
                                {formatCurrency(value)}
                              </p>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  status === 'normal'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {status === 'normal' ? 'Normal' : 'Bajo Stock'}
                              </span>
                            </div>
                          </div>
                        );
                      }
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* ALERTAS DE INVENTARIO (conectado a BD) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 lg:p-6 border-b border-gray-100">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                  Alertas de Inventario
                </h3>
                <p className="text-sm text-gray-600">Productos que requieren atención</p>
              </div>
              <div className="p-4 lg:p-6">
                <div className="space-y-4">
                  {lowStockProducts && lowStockProducts.length > 0 ? (
                    lowStockProducts.map((producto: any) => {
                      const stockActual = producto.stock ?? producto.cantidad ?? 0;
                      const stockMinimo =
                        producto.stockMinimo ?? producto.stock_minimo;
                      const critico =
                        typeof stockMinimo === 'number' &&
                        stockActual <= stockMinimo;

                      return (
                        <div
                          key={producto.id}
                          className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm lg:text-base truncate">
                              {producto.nombre ||
                                producto.descripcion ||
                                'Producto'}
                            </h4>
                            <p className="text-xs lg:text-sm text-gray-600">
                              Stock actual: {stockActual}{' '}
                              {stockMinimo != null && ` (mínimo ${stockMinimo})`}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                critico
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {critico ? 'Reabastecer' : 'Revisar'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500">
                      No hay productos con stock bajo en este momento.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'movimientos': {
        const stats = computeMovementStats(stockMovements);

        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
            {/* ÚLTIMOS MOVIMIENTOS (conectado a BD) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 lg:p-6 border-b border-gray-100">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                  Últimos Movimientos
                </h3>
                <p className="text-sm text-gray-600">
                  Transacciones recientes de inventario
                </p>
              </div>
              <div className="p-4 lg:p-6">
                <div className="space-y-4">
                  {stockMovements && stockMovements.length > 0 ? (
                    stockMovements.slice(0, 10).map((movement: any, index: number) => {
                      const tipo = (movement.tipo || movement.estado || 'Movimiento').toUpperCase();
                      const fecha = movement.fecha
                        ? new Date(movement.fecha).toLocaleString('es-PE')
                        : 'Sin fecha';

                      const nombreProducto =
                        movement.productoNombre ||
                        movement.producto?.nombre ||
                        movement.producto ||
                        'Producto';

                      const usuario =
                        movement.usuarioNombre || movement.usuario || 'Sistema';

                      let badgeClass =
                        'bg-gray-100 text-gray-700';
                      if (tipo === 'ENTRADA') badgeClass = 'bg-green-100 text-green-700';
                      else if (tipo === 'SALIDA') badgeClass = 'bg-red-100 text-red-700';
                      else if (tipo === 'TRANSFERENCIA') badgeClass = 'bg-blue-100 text-blue-700';

                      return (
                        <div
                          key={movement.id ?? index}
                          className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm lg:text-base truncate">
                              {nombreProducto}
                            </h4>
                            <p className="text-xs lg:text-sm text-gray-600">
                              {fecha} - {usuario}
                            </p>
                          </div>
                          <div className="text-right ml-2">
                            <span
                              className={`px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium whitespace-nowrap ${badgeClass}`}
                            >
                              {tipo}
                            </span>
                            <p className="text-xs lg:text-sm font-semibold text-gray-900 mt-1">
                              {movement.cantidad}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500">
                      No hay movimientos de stock registrados.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* RESUMEN DE MOVIMIENTOS (conectado a BD) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 lg:p-6 border-b border-gray-100">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                  Resumen de Movimientos
                </h3>
                <p className="text-sm text-gray-600">
                  Estadísticas del período seleccionado
                </p>
              </div>
              <div className="p-4 lg:p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 lg:p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <i className="ri-arrow-down-line text-white text-sm lg:text-base"></i>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm lg:text-base">
                          Entradas
                        </h4>
                        <p className="text-xs lg:text-sm text-gray-600">
                          {stats.entradas.movimientos} movimientos
                        </p>
                      </div>
                    </div>
                    <span className="text-sm lg:text-lg font-bold text-green-600">
                      {stats.entradas.unidades} unidades
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 lg:p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-red-500 rounded-lg flex items-center justify-center">
                        <i className="ri-arrow-up-line text-white text-sm lg:text-base"></i>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm lg:text-base">
                          Salidas
                        </h4>
                        <p className="text-xs lg:text-sm text-gray-600">
                          {stats.salidas.movimientos} movimientos
                        </p>
                      </div>
                    </div>
                    <span className="text-sm lg:text-lg font-bold text-red-600">
                      {stats.salidas.unidades} unidades
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 lg:p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <i className="ri-exchange-line text-white text-sm lg:text-base"></i>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm lg:text-base">
                          Transferencias
                        </h4>
                        <p className="text-xs lg:text-sm text-gray-600">
                          {stats.transferencias.movimientos} movimientos
                        </p>
                      </div>
                    </div>
                    <span className="text-sm lg:text-lg font-bold text-blue-600">
                      {stats.transferencias.unidades} unidades
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'financiero':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
            {/* ANÁLISIS DE COSTOS (usa valorPorCategoria) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 lg:p-6 border-b border-gray-100">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                  Análisis de Costos
                </h3>
                <p className="text-sm text-gray-600">
                  Distribución financiera por categoría
                </p>
              </div>
              <div className="p-4 lg:p-6">
                <div className="space-y-4">
                  {(() => {
                    let costos: { category: string; cost: number }[] = [];

                    if (Array.isArray(inventoryReport?.valorPorCategoria)) {
                      costos = inventoryReport.valorPorCategoria.map((item: any) => ({
                        category:
                          item.categoria ||
                          item.nombreCategoria ||
                          item.nombre ||
                          'Sin categoría',
                        cost:
                          Number(
                            item.valorTotal ?? item.valor ?? item.monto ?? 0
                          ),
                      }));
                    } else if (
                      inventoryReport?.valorPorCategoria &&
                      typeof inventoryReport.valorPorCategoria === 'object'
                    ) {
                      costos = Object.entries(
                        inventoryReport.valorPorCategoria
                      ).map(([category, cost]: any) => ({
                        category: category || 'Sin categoría',
                        cost: Number(cost) || 0,
                      }));
                    }

                    const totalCost = costos.reduce(
                      (sum, item) => sum + item.cost,
                      0
                    );

                    if (!costos.length) {
                      return (
                        <p className="text-sm text-gray-500">
                          No hay datos financieros disponibles.
                        </p>
                      );
                    }

                    return costos.map((item, index) => {
                      const percentage =
                        totalCost > 0
                          ? `${Math.round((item.cost / totalCost) * 100)}%`
                          : '0%';

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div
                              className={`w-3 h-3 lg:w-4 lg:h-4 rounded ${
                                index === 0
                                  ? 'bg-blue-500'
                                  : index === 1
                                  ? 'bg-green-500'
                                  : index === 2
                                  ? 'bg-yellow-500'
                                  : index === 3
                                  ? 'bg-purple-500'
                                  : 'bg-red-500'
                              }`}
                            ></div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-sm lg:text-base truncate">
                                {item.category}
                              </h4>
                              <p className="text-xs lg:text-sm text-gray-600">
                                {percentage} del total
                              </p>
                            </div>
                          </div>
                          <div className="text-right ml-2">
                            <p className="font-semibold text-gray-900 text-sm lg:text-base">
                              {formatCurrency(item.cost)}
                            </p>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>

            {/* Métricas de rentabilidad (por ahora siguen siendo más decorativas) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 lg:p-6 border-b border-gray-100">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                  Métricas de Rentabilidad
                </h3>
                <p className="text-sm text-gray-600">Indicadores financieros clave</p>
              </div>
              <div className="p-4 lg:p-6">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                      4.2x
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      Rotación de Inventario
                    </div>
                    <div className="text-sm text-green-600">
                      +15.8% vs período anterior
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 lg:p-4 bg-blue-50 rounded-lg">
                      <div className="text-lg lg:text-xl font-bold text-blue-600">
                        87
                      </div>
                      <div className="text-xs lg:text-sm text-gray-600">
                        Días de Stock
                      </div>
                    </div>
                    <div className="text-center p-3 lg:p-4 bg-green-50 rounded-lg">
                      <div className="text-lg lg:text-xl font-bold text-green-600">
                        {formatCurrency(76.52)}
                      </div>
                      <div className="text-xs lg:text-sm text-gray-600">
                        Costo Promedio
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Margen Bruto</span>
                      <span className="text-sm font-semibold text-gray-900">
                        32.5%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">ROI Inventario</span>
                      <span className="text-sm font-semibold text-gray-900">
                        18.7%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Productos Activos
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        2,847
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default: {
        const salesData = buildSalesData(ventas);

        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
            <LineChart data={salesData} title={getTabData().chartTitle} />
            <PieChartComponent data={categoryData} title="Ventas por Categoría" />
          </div>
        );
      }
    }
  };

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
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-blue-200 hover:text-white font-medium transition-colors whitespace-nowrap"
                >
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
                <button className="text-white bg-blue-600 px-3 py-1 rounded-md font-medium whitespace-nowrap">
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
                <button
                  onClick={() => {
                    navigate('/inventario');
                    setMobileMenuOpen(false);
                  }}
                  className="text-blue-200 hover:text-white font-medium transition-colors text-left py-2"
                >
                  Inventario
                </button>
                <button className="text-white bg-blue-600 px-3 py-2 rounded-md font-medium text-left">
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
            Reportes y Análisis
          </h2>
          <p className="text-gray-600">
            Visualiza el rendimiento de tu inventario con reportes detallados
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap text-sm lg:text-base ${
                  selectedTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <i className={`${tab.icon} text-lg`}></i>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 lg:mb-8 space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Período:
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8 text-sm"
              >
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
                <option value="6m">Últimos 6 meses</option>
                <option value="1y">Último año</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Moneda:
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8 text-sm"
              >
                <option value="USD">USD - Dólares</option>
                <option value="PEN">PEN - Soles Peruanos</option>
              </select>
            </div>

            {currency === 'PEN' && (
              <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                <i className="ri-information-line mr-1"></i>
                Tasa: 1 USD = S/ {exchangeRate}
              </div>
            )}
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-4 lg:mb-8">
          {getTabData().metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="text-center text-gray-500">Cargando reportes...</div>
        ) : (
          renderTabContent()
        )}
      </div>

      
    </div>
  );
}

// MetricCard component
const MetricCard = ({ title, value, subtitle, change, icon, color }: any) => (
  <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
    <div className="flex items-start justify-between mb-4">
      <div
        className={`w-10 h-10 lg:w-12 lg:h-12 ${color} rounded-lg flex items-center justify-center`}
      >
        <i className={`${icon} text-white text-lg lg:text-xl`}></i>
      </div>
      <div
        className={`flex items-center space-x-1 text-sm ${
          change.startsWith('+') ? 'text-green-600' : 'text-red-600'
        }`}
      >
        <i
          className={`${
            change.startsWith('+') ? 'ri-arrow-up-line' : 'ri-arrow-down-line'
          }`}
        ></i>
        <span>{change}</span>
      </div>
    </div>
    <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
    <p className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{value}</p>
    <p className="text-sm text-gray-500">{subtitle}</p>
  </div>
);

// LineChart component
const LineChart = ({ data, title }: any) => {
  const chartData =
    Array.isArray(data) && data.length > 0
      ? data
      : [
          { month: 'Ene', value: 0 },
          { month: 'Feb', value: 0 },
          { month: 'Mar', value: 0 },
          { month: 'Abr', value: 0 },
          { month: 'May', value: 0 },
          { month: 'Jun', value: 0 },
        ];

  const maxValue = Math.max(...chartData.map((d: any) => d.value || 0), 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
      <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">
        {title}
      </h3>
      <div className="relative h-48 lg:h-64">
        <div className="absolute inset-0 flex items-end justify-between px-2 lg:px-4 pb-6 lg:pb-8">
          {chartData.map((item: any, index: number) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div
                className="bg-blue-500 rounded-t-lg w-8 lg:w-12 transition-all duration-300 hover:bg-blue-600"
                style={{
                  height:
                    maxValue > 0 ? `${(item.value / maxValue) * 140}px` : '0px',
                }}
              ></div>
              <span className="text-xs lg:text-sm text-gray-600 font-medium">
                {item.month}
              </span>
            </div>
          ))}
        </div>
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>
      </div>
    </div>
  );
};

// PieChart component
const PieChartComponent = ({ data, title }: any) => {
  const categoryData = [
    { name: 'Medicamentos', value: 65, color: '#3B82F6' },
    { name: 'Material Médico', value: 20, color: '#10B981' },
    { name: 'EPP', value: 10, color: '#F59E0B' },
    { name: 'Equipos', value: 5, color: '#8B5CF6' },
  ];

  const total = categoryData.reduce(
    (sum: number, item: any) => sum + item.value,
    0
  );
  let currentAngle = 0;

  const createPieSlice = (
    percentage: number,
    color: string,
    startAngle: number
  ) => {
    const angle = (percentage / 100) * 360;
    const endAngle = startAngle + angle;

    const startX =
      50 + 50 * Math.cos(((startAngle - 90) * Math.PI) / 180);
    const startY =
      50 + 50 * Math.sin(((startAngle - 90) * Math.PI) / 180);
    const endX = 50 + 50 * Math.cos(((endAngle - 90) * Math.PI) / 180);
    const endY = 50 + 50 * Math.sin(((endAngle - 90) * Math.PI) / 180);

    const largeArc = angle > 180 ? 1 : 0;

    return `M 50 50 L ${startX} ${startY} A 50 50 0 ${largeArc} 1 ${endX} ${endY} Z`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
      <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">
        {title}
      </h3>
      <div className="flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-48 h-48 lg:w-64 lg:h-64">
          {categoryData.map((item: any, index: number) => {
            const percentage = (item.value / total) * 100;
            const path = createPieSlice(
              percentage,
              item.color,
              currentAngle
            );
            currentAngle += (percentage / 100) * 360;

            return (
              <path
                key={index}
                d={path}
                fill={item.color}
                stroke="white"
                strokeWidth="0.5"
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            );
          })}
        </svg>
      </div>
      <div className="mt-4 lg:mt-6 space-y-3">
        {categoryData.map((item: any, index: number) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-3 h-3 lg:w-4 lg:h-4 rounded"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm font-medium text-gray-700">
                {item.name}
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
