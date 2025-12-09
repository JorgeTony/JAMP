import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWithAuth, postWithAuth, putWithAuth, deleteWithAuth } from '../../utils/api';

interface Producto {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  unidadMedida: string;
  precio: number;
  stockMinimo: number;
  proveedor: string;
  estado: string;
}

export default function CatalogoProductos() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('todos');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Producto>({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria: '',
    unidadMedida: '',
    precio: 0,
    stockMinimo: 0,
    proveedor: '',
    estado: 'ACTIVO'
  });

  // Cargar productos al iniciar
  useEffect(() => {
    fetchProductos();
    fetchCategorias();
  }, []);

  const fetchProductos = async () => {
    try {
      const data = await getWithAuth('/catalogo-productos/api');
      setProductos(data);
    } catch (error) {
      console.error('Error al cargar catálogo:', error);
    }
  };

  const fetchCategorias = async () => {
    try {
      const data = await getWithAuth('/catalogo-productos/api/categorias');
      setCategorias(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (selectedProducto) {
        await putWithAuth(`/catalogo-productos/api/${selectedProducto.id}`, formData);
        alert('Producto actualizado exitosamente');
      } else {
        await postWithAuth('/catalogo-productos/api', formData);
        alert('Producto creado exitosamente');
      }
      
      await fetchProductos();
      setShowModal(false);
      setSelectedProducto(null);
      resetForm();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await deleteWithAuth(`/catalogo-productos/api/${id}`);
        await fetchProductos();
        alert('Producto eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar el producto');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      categoria: '',
      unidadMedida: '',
      precio: 0,
      stockMinimo: 0,
      proveedor: '',
      estado: 'ACTIVO'
    });
  };

  const openEditModal = (producto: Producto) => {
    setSelectedProducto(producto);
    setFormData(producto);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setSelectedProducto(null);
    resetForm();
    setShowModal(true);
  };

  const filteredProductos = productos.filter(producto => {
    const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         producto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = filterCategoria === 'todos' || producto.categoria === filterCategoria;
    const matchesEstado = filterEstado === 'todos' || producto.estado === filterEstado;
    return matchesSearch && matchesCategoria && matchesEstado;
  });

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'inactivo':
        return 'bg-red-100 text-red-800';
      case 'descontinuado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && productos.length === 0) {
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
        <div className="px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <i className="ri-archive-line text-white text-lg"></i>
                </div>
                <button 
                  onClick={() => navigate('/')}
                  className="text-lg lg:text-xl font-bold text-white hover:text-blue-200 transition-colors"
                >
                  Inventarios JAMP
                </button>
              </div>
              <div className="text-white">
                <i className="ri-arrow-right-s-line mx-2"></i>
                <span className="text-blue-200">Catálogo de Productos</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 lg:px-6 py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Catálogo de Productos</h1>
          <p className="text-gray-600">Gestiona el catálogo completo de productos del sistema</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                />
              </div>
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
              >
                <option value="todos">Todas las categorías</option>
                {categorias.map((categoria, index) => (
                  <option key={index} value={categoria}>{categoria}</option>
                ))}
              </select>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
              >
                <option value="todos">Todos los estados</option>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
                <option value="DESCONTINUADO">Descontinuado</option>
              </select>
            </div>
            <button 
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 whitespace-nowrap"
            >
              <i className="ri-add-line"></i>
              <span>Nuevo Producto</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Productos</p>
                <p className="text-2xl font-bold text-gray-900">{productos.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-book-open-line text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Productos Activos</p>
                <p className="text-2xl font-bold text-gray-900">{productos.filter(p => p.estado === 'ACTIVO').length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-check-line text-green-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Categorías</p>
                <p className="text-2xl font-bold text-gray-900">{categorias.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="ri-folder-line text-purple-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Valor Promedio</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${productos.length > 0 ? (productos.reduce((sum, p) => sum + p.precio, 0) / productos.length).toFixed(2) : '0.00'}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="ri-money-dollar-circle-line text-orange-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {filteredProductos.map((producto) => (
            <div key={producto.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <img 
                  src={`https://readdy.ai/api/search-image?query=medical%20product%20$%7Bproducto.nombre%7D%20healthcare%20equipment%20hospital%20supply&width=200&height=200&seq=${producto.id}&orientation=squarish`}
                  alt={producto.nombre}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{producto.nombre}</h3>
                    <p className="text-sm text-gray-500">{producto.codigo}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(producto.estado)}`}>
                    {producto.estado}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{producto.descripcion}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Categoría:</span>
                    <span className="font-medium">{producto.categoria}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Precio:</span>
                    <span className="font-bold text-blue-600">${producto.precio.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Unidad:</span>
                    <span className="font-medium">{producto.unidadMedida}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => openEditModal(producto)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Ver detalles
                  </button>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => openEditModal(producto)}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                    <button 
                      onClick={() => handleDelete(producto.id!)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProductos.length === 0 && !loading && (
          <div className="text-center py-12">
            <i className="ri-inbox-line text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
            <p className="text-gray-500">Intenta ajustar los filtros o crear un nuevo producto.</p>
          </div>
        )}
      </div>

      {/* Modal for Add/Edit Producto */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 lg:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                  {selectedProducto ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                <button 
                  onClick={() => {
                    setShowModal(false);
                    setSelectedProducto(null);
                    resetForm();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>
            
            <div className="p-4 lg:p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código del Producto *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.codigo}
                      onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="PROD-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nombre del producto"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Descripción detallada del producto..."
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría *
                    </label>
                    <select 
                      required
                      value={formData.categoria}
                      onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
                    >
                      <option value="">Seleccionar categoría</option>
                      {categorias.map((categoria, index) => (
                        <option key={index} value={categoria}>{categoria}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio Unitario *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.precio}
                      onChange={(e) => setFormData({...formData, precio: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unidad de Medida *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.unidadMedida}
                      onChange={(e) => setFormData({...formData, unidadMedida: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Unidad, Caja, Frasco..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Mínimo
                    </label>
                    <input
                      type="number"
                      value={formData.stockMinimo}
                      onChange={(e) => setFormData({...formData, stockMinimo: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proveedor
                    </label>
                    <input
                      type="text"
                      value={formData.proveedor}
                      onChange={(e) => setFormData({...formData, proveedor: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nombre del proveedor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select 
                      value={formData.estado}
                      onChange={(e) => setFormData({...formData, estado: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
                    >
                      <option value="ACTIVO">Activo</option>
                      <option value="INACTIVO">Inactivo</option>
                      <option value="DESCONTINUADO">Descontinuado</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedProducto(null);
                      resetForm();
                    }}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : (selectedProducto ? 'Actualizar' : 'Crear Producto')}
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
