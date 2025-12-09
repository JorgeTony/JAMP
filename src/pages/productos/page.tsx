import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getWithAuth,
  postWithAuth,
  putWithAuth,
  deleteWithAuth
} from '../../utils/api';

// @ts-ignore
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  unidadMedida?: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  ubicacion?: string;
  proveedor?: string;
  estado: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  fechaVencimiento?: string;
}

// Helper para formatear la fecha al input[type=date]
const formatDateForInput = (value?: string) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

export default function Productos() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getWithAuth<Producto[]>('/productos/api');
      setProducts(data);
    } catch (error) {
      console.error('Error cargando productos:', error);
      setError(
        'Error al cargar los productos. Verifica que el servidor esté funcionando.'
      );
      setProducts([]);
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

  const categories = [
    { id: 'todos', name: 'Todos los productos' },
    { id: 'Medicamentos', name: 'Medicamentos' },
    { id: 'Antibióticos', name: 'Antibióticos' },
    { id: 'Suministros', name: 'Suministros' },
    { id: 'Equipos', name: 'Equipos' },
    { id: 'Medicamentos Controlados', name: 'Medicamentos Controlados' }
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'todos' || product.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (stock: number, stockMinimo: number) => {
    if (stock <= stockMinimo * 0.5) return 'bg-red-100 text-red-700';
    if (stock <= stockMinimo) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  const getStatusText = (stock: number, stockMinimo: number) => {
    if (stock <= stockMinimo * 0.5) return 'Crítico';
    if (stock <= stockMinimo) return 'Stock Bajo';
    return 'Normal';
  };
 // 👉 Bajo stock: cualquier cosa en rango "Stock Bajo" o "Crítico"
  const isLowStock = (product: Producto) =>
    product.stock <= product.stockMinimo;

  // 👉 Próximo a vencer: vencido o dentro de 30 días
  const isNearExpiry = (product: Producto) => {
    if (!product.fechaVencimiento) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(product.fechaVencimiento);
    if (Number.isNaN(expiry.getTime())) return false;
    expiry.setHours(0, 0, 0, 0);

    const diffMs = expiry.getTime() - today.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    // negativo = vencido, entre 0 y 30 = próximo a vencer
    return diffDays <= 30;
  };

  // 👉 Descripción amigable de por qué es crítico
  const getCriticalReason = (product: Producto) => {
    const reasons: string[] = [];

    if (isLowStock(product)) {
      const status = getStatusText(product.stock, product.stockMinimo);
      reasons.push(status === 'Normal' ? 'Stock Bajo' : status);
    }

    if (isNearExpiry(product)) {
      reasons.push('Próximo a vencer');
    }

    return reasons.join(' y ');
  };
  const handleEditProduct = (product: Producto) => {
    setEditingProduct({ ...product });
    setShowEditProduct(true);
    setShowDropdown(null);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await deleteWithAuth(`/productos/api/${productId}`);
        await loadProducts();
        setShowDropdown(null);
      } catch (error) {
        console.error('Error eliminando producto:', error);
        alert('Error al eliminar el producto');
      }
    }
  };

    const generateCriticalProductsReport = () => {
    // 1) Filtrar productos críticos: bajo stock O próximos a vencer
    const criticalProducts = products.filter(
      (p) => isLowStock(p) || isNearExpiry(p)
    );

    if (criticalProducts.length === 0) {
      alert('No hay productos críticos (bajo stock o próximos a vencer) para generar el reporte.');
      return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');

    // Paleta de colores
    const primary = { r: 37, g: 99, b: 235 }; // azul
    const grayBg = { r: 248, g: 250, b: 252 };
    const grayText = { r: 55, g: 65, b: 81 };

    // Fondo del encabezado
    doc.setFillColor(grayBg.r, grayBg.g, grayBg.b);
    doc.rect(0, 0, 210, 40, 'F');

    // Título
    doc.setTextColor(primary.r, primary.g, primary.b);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Productos Críticos', 14, 20);

    // Subtítulo
    doc.setFontSize(11);
    doc.setTextColor(grayText.r, grayText.g, grayText.b);
    doc.setFont('helvetica', 'normal');
    doc.text('Productos con bajo stock y próximos a vencer', 14, 27);

    // Fecha de generación
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    const fechaStr = new Date().toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Generado: ${fechaStr}`, 14, 34);

    // 2) Preparar datos de la tabla
    const tableColumns = [
      'Código',
      'Nombre',
      'Categoría',
      'Stock',
      'Stock mín.',
      'Fecha venc.',
      'Motivo'
    ];

    const rowsMeta = criticalProducts.map((p) => {
      const fechaVencStr = p.fechaVencimiento
        ? new Date(p.fechaVencimiento).toLocaleDateString('es-PE')
        : '-';

      const reason = getCriticalReason(p) || '-';

      return {
        product: p,
        row: [
          p.codigo,
          p.nombre,
          p.categoria || '-',
          String(p.stock),
          String(p.stockMinimo),
          fechaVencStr,
          reason
        ]
      };
    });

    // 3) Dibujar tabla con estilos
    // @ts-ignore
    autoTable(doc, {
      head: [tableColumns],
      body: rowsMeta.map((r) => r.row),
      startY: 45,
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [primary.r, primary.g, primary.b],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [grayBg.r, grayBg.g, grayBg.b]
      },
      theme: 'grid',
      // Destacar filas especiales
      // @ts-ignore
      didParseCell: (data) => {
        if (data.section !== 'body') return;
        const meta = rowsMeta[data.row.index];
        if (!meta) return;
        const p = meta.product as Producto;

        // Fila con stock 0 → rojo fuerte
        if (p.stock <= 0) {
          data.cell.styles.textColor = [185, 28, 28];
          data.cell.styles.fontStyle = 'bold';
        }

        // Próximo a vencer → resaltar columnas de fecha y motivo en naranja
        if (isNearExpiry(p) && (data.column.index === 5 || data.column.index === 6)) {
          data.cell.styles.textColor = [180, 83, 9];
        }
      }
    });

    // 4) Pie de página con numeración
    // @ts-ignore
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(156, 163, 175);
      doc.text(`Página ${i} de ${pageCount}`, 210 - 14, 297 - 10, {
        align: 'right'
      });
    }

    doc.save('reporte-productos-criticos.pdf');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const fechaVencRaw = formData.get('fechaVencimiento') as string;

      const updatedProduct = {
        ...editingProduct,
        nombre: formData.get('nombre') as string,
        codigo: formData.get('codigo') as string,
        descripcion: formData.get('descripcion') as string,
        categoria: formData.get('categoria') as string,
        unidadMedida: formData.get('unidadMedida') as string,
        precio: parseFloat(formData.get('precio') as string),
        stock: parseInt(formData.get('stock') as string, 10),
        stockMinimo: parseInt(formData.get('stockMinimo') as string, 10),
        ubicacion: formData.get('ubicacion') as string,
        proveedor: formData.get('proveedor') as string,
        fechaVencimiento: fechaVencRaw || null,
        estado: 'ACTIVO'
      };

      await putWithAuth(`/productos/api/${editingProduct.id}`, updatedProduct);
      await loadProducts();
      setShowEditProduct(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error actualizando producto:', error);
      alert('Error al actualizar el producto');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const fechaVencRaw = formData.get('fechaVencimiento') as string;

      const newProduct = {
        codigo: formData.get('codigo') as string,
        nombre: formData.get('nombre') as string,
        descripcion: formData.get('descripcion') as string,
        categoria: formData.get('categoria') as string,
        unidadMedida: formData.get('unidadMedida') as string,
        precio: parseFloat(formData.get('precio') as string),
        stock: parseInt(formData.get('stock') as string, 10),
        stockMinimo: parseInt(formData.get('stockMinimo') as string, 10),
        ubicacion: formData.get('ubicacion') as string,
        proveedor: formData.get('proveedor') as string,
        fechaVencimiento: fechaVencRaw || null,
        estado: 'ACTIVO'
      };

      await postWithAuth('/productos/api', newProduct);
      await loadProducts();
      setShowAddProduct(false);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error creando producto:', error);
      alert('Error al crear el producto');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

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
                <button className="text-white bg-blue-600 px-3 py-1 rounded-md font-medium">
                  Productos
                </button>
                <button
                  onClick={() => navigate('/inventario')}
                  className="text-blue-200 hover:text-white font-medium transition-colors"
                >
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

            {/* 👉 Aquí solo dejamos el usuario, SIN campana */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
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
        </div>
      </header>

      <div className="px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Productos
          </h2>
          <p className="text-gray-600">
            Administra el catálogo completo de productos del inventario
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
                  onClick={loadProducts}
                  className="text-red-600 hover:text-red-800 text-sm font-medium mt-2"
                >
                  Intentar nuevamente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Buscar productos por nombre o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-80 text-sm"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8 text-sm"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={loadProducts}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2 whitespace-nowrap"
              >
                <i className="ri-refresh-line"></i>
                <span>Actualizar</span>
              </button>
<button
                onClick={generateCriticalProductsReport}
                className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 flex items-center space-x-2 whitespace-nowrap"
              >
                <i className="ri-file-pdf-line"></i>
                <span>Generar reporte de productos críticos</span>
              </button>

              <button
                onClick={() => setShowAddProduct(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 flex items-center space-x-2 whitespace-nowrap"
              >
                <i className="ri-add-line"></i>
                <span>Nuevo Producto</span>
              </button> 
             
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <i className="ri-archive-line text-4xl text-gray-400 mb-4"></i>
            <p className="text-lg font-medium text-gray-900 mb-2">
              {products.length === 0
                ? 'No hay productos registrados'
                : 'No se encontraron productos'}
            </p>
            <p className="text-gray-600 mb-4">
              {products.length === 0
                ? 'Comienza agregando tu primer producto al inventario'
                : 'Intenta con otros términos de búsqueda o filtros'}
            </p>
            {products.length === 0 && (
              <button
                onClick={() => setShowAddProduct(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto whitespace-nowrap"
              >
                <i className="ri-add-line"></i>
                <span>Agregar Primer Producto</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                        <i className="ri-medicine-bottle-line text-2xl text-gray-400"></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {product.nombre}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1">
                          Código: {product.codigo}
                        </p>
                        <p className="text-sm text-gray-600">
                          {product.categoria}
                        </p>
                        {product.fechaVencimiento && (
                          <p className="text-xs text-orange-700 mt-1">
                            Vence:{' '}
                            {new Date(
                              product.fechaVencimiento
                            ).toLocaleDateString('es-PE')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          product.stock,
                          product.stockMinimo
                        )}`}
                      >
                        {getStatusText(product.stock, product.stockMinimo)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Stock Actual</p>
                      <p className="font-semibold text-gray-900">
                        {product.stock}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Stock Mínimo
                      </p>
                      <p className="font-semibold text-gray-900">
                        {product.stockMinimo}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Precio Unitario
                      </p>
                      <p className="font-semibold text-gray-900">
                        ${product.precio}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Valor Total</p>
                      <p className="font-semibold text-gray-900">
                        ${(product.stock * product.precio).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>{product.unidadMedida || 'Unidades'}</span>
                    <span>{product.proveedor || 'Sin proveedor'}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap"
                    >
                      Ver Detalles
                    </button>
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                      title="Eliminar producto"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Agregar Nuevo Producto
                </h2>
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>

            <form onSubmit={handleAddProduct} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código del Producto *
                  </label>
                  <input
                    type="text"
                    name="codigo"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: MED001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Paracetamol 500mg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Descripción del producto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    name="categoria"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="Medicamentos">Medicamentos</option>
                    <option value="Antibióticos">Antibióticos</option>
                    <option value="Suministros">Suministros</option>
                    <option value="Equipos">Equipos</option>
                    <option value="Medicamentos Controlados">
                      Medicamentos Controlados
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text.sm font-medium text-gray-700 mb-2">
                    Unidad de Medida
                  </label>
                  <input
                    type="text"
                    name="unidadMedida"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Tabletas, Viales, Unidades"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio Unitario *
                  </label>
                  <input
                    type="number"
                    name="precio"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Inicial *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Mínimo *
                  </label>
                  <input
                    type="number"
                    name="stockMinimo"
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    name="fechaVencimiento"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    name="ubicacion"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: ALM001-A1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proveedor
                  </label>
                  <input
                    type="text"
                    name="proveedor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Laboratorios Bayer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
                >
                  Agregar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProduct && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Editar Producto
                </h2>
                <button
                  onClick={() => setShowEditProduct(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código del Producto *
                  </label>
                  <input
                    type="text"
                    name="codigo"
                    required
                    defaultValue={editingProduct.codigo}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    required
                    defaultValue={editingProduct.nombre}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    rows={3}
                    defaultValue={editingProduct.descripcion || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    name="categoria"
                    required
                    defaultValue={editingProduct.categoria}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
                  >
                    <option value="Medicamentos">Medicamentos</option>
                    <option value="Antibióticos">Antibióticos</option>
                    <option value="Suministros">Suministros</option>
                    <option value="Equipos">Equipos</option>
                    <option value="Medicamentos Controlados">
                      Medicamentos Controlados
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unidad de Medida
                  </label>
                  <input
                    type="text"
                    name="unidadMedida"
                    defaultValue={editingProduct.unidadMedida || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio Unitario *
                  </label>
                  <input
                    type="number"
                    name="precio"
                    required
                    min="0"
                    step="0.01"
                    defaultValue={editingProduct.precio}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Actual *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    required
                    min="0"
                    defaultValue={editingProduct.stock}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Mínimo *
                  </label>
                  <input
                    type="number"
                    name="stockMinimo"
                    required
                    min="0"
                    defaultValue={editingProduct.stockMinimo}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    name="fechaVencimiento"
                    defaultValue={formatDateForInput(
                      editingProduct.fechaVencimiento
                    )}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    name="ubicacion"
                    defaultValue={editingProduct.ubicacion || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proveedor
                  </label>
                  <input
                    type="text"
                    name="proveedor"
                    defaultValue={editingProduct.proveedor || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowEditProduct(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Detalles del Producto
                </h2>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start space-x-6 mb-6">
                <div className="w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center">
                  <i className="ri-medicine-bottle-line text-4xl text-gray-400"></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedProduct.nombre}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Código: {selectedProduct.codigo}
                  </p>
                  <p className="text-gray-600 mb-2">
                    Categoría: {selectedProduct.categoria}
                  </p>
                  {selectedProduct.fechaVencimiento && (
                    <p className="text-orange-700 mb-2">
                      Fecha de vencimiento:{' '}
                      {new Date(
                        selectedProduct.fechaVencimiento
                      ).toLocaleDateString('es-PE')}
                    </p>
                  )}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      selectedProduct.stock,
                      selectedProduct.stockMinimo
                    )}`}
                  >
                    {getStatusText(
                      selectedProduct.stock,
                      selectedProduct.stockMinimo
                    )}
                  </span>
                </div>
              </div>

              {selectedProduct.descripcion && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <p className="text-gray-900">{selectedProduct.descripcion}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Actual
                    </label>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedProduct.stock}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Mínimo
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProduct.stockMinimo}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio Unitario
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      ${selectedProduct.precio}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor Total
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {(
                        selectedProduct.stock * selectedProduct.precio
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unidad de Medida
                  </label>
                  <p className="text-gray-900">
                    {selectedProduct.unidadMedida || 'No especificada'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicación
                  </label>
                  <p className="text-gray-900">
                    {selectedProduct.ubicacion || 'No especificada'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proveedor
                  </label>
                  <p className="text-gray-900">
                    {selectedProduct.proveedor || 'No especificado'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <p className="text-gray-900">{selectedProduct.estado}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
