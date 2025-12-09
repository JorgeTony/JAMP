import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWithAuth, postWithAuth, putWithAuth, deleteWithAuth } from '../../utils/api';

interface LineaProducto {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  estado: string;
  productosAsociados: number;
  fechaCreacion?: string;
}

export default function LineaProducto() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedLinea, setSelectedLinea] = useState<LineaProducto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('todos');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [lineasProducto, setLineasProducto] = useState<LineaProducto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<LineaProducto>({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria: '',
    estado: 'ACTIVA',
    productosAsociados: 0
  });

  // Cargar líneas de producto al iniciar
  useEffect(() => {
    fetchLineas();
    fetchCategorias();
  }, []);

  const fetchLineas = async () => {
    try {
      const data = await getWithAuth('/linea-producto/api');
      setLineasProducto(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar líneas de producto:', error);
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const data = await getWithAuth('/linea-producto/api/categorias');
      setCategorias(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedLinea) {
        await putWithAuth(`/linea-producto/api/${selectedLinea.id}`, formData);
      } else {
        await postWithAuth('/linea-producto/api', formData);
      }
      setShowModal(false);
      resetForm();
      fetchLineas();
    } catch (error) {
      console.error('Error al guardar línea de producto:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar esta línea de producto?')) {
      try {
        await deleteWithAuth(`/linea-producto/api/${id}`);
        fetchLineas();
      } catch (error) {
        console.error('Error al eliminar línea de producto:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      categoria: '',
      estado: 'ACTIVA',
      productosAsociados: 0
    });
  };

  const openEditModal = (linea: LineaProducto) => {
    setSelectedLinea(linea);
    setFormData(linea);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setSelectedLinea(null);
    resetForm();
    setShowModal(true);
  };

  const getUserIcon = () => {
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
    const userRole = user?.role || 'Operador';
    
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
        return 'https://readdy.ai/api/search-image?query=professional%20technical%20worker%20operator%20specialist%20icon%20orange%20background%20minimalist%20clean%20design%20inventory%20operations&width=32&height=32&seq=oper1&orientation=squarish';
      default:
        return 'https://readdy.ai/api/search-image?query=professional%20technical%20worker%20operator%20specialist%20icon%20orange%20background%20minimalist%20clean%20design%20inventory%20operations&width=32&height=32&seq=oper1&orientation=squarish';
    }
  };

  const filteredLineas = lineasProducto.filter(linea => {
    const matchesSearch = linea.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         linea.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         linea.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = filterCategoria === 'todos' || linea.categoria === filterCategoria;
    const matchesEstado = filterEstado === 'todos' || linea.estado === filterEstado;
    return matchesSearch && matchesCategoria && matchesEstado;
  });

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'activa':
        return 'bg-green-100 text-green-800';
      case 'inactiva':
        return 'bg-red-100 text-red-800';
      case 'descontinuada':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (loading && lineasProducto.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando líneas de producto...</p>
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
                <img 
                  src={getUserIcon()} 
                  alt="Sistema" 
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <button 
                  onClick={() => navigate('/')}
                  className="text-lg lg:text-xl font-bold text-white hover:text-blue-200 transition-colors"
                >
                  Inventarios JAMP
                </button>
              </div>
              <div className="text-white">
                <i className="ri-arrow-right-s-line mx-2"></i>
                <span className="text-blue-200">Líneas de Producto</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 lg:px-6 py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Gestión de Líneas de Producto</h1>
          <p className="text-gray-600">Organiza y administra las líneas de productos del sistema</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Buscar líneas de producto..."
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
                <option value="ACTIVA">Activa</option>
                <option value="INACTIVA">Inactiva</option>
                <option value="DESCONTINUADA">Descontinuada</option>
              </select>
            </div>
            <button 
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 whitespace-nowrap"
            >
              <i className="ri-add-line"></i>
              <span>Nueva Línea</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Líneas</p>
                <p className="text-2xl font-bold text-gray-900">{lineasProducto.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-list-check text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Líneas Activas</p>
                <p className="text-2xl font-bold text-gray-900">{lineasProducto.filter(l => l.estado === 'ACTIVA').length}</p>
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
                <p className="text-sm font-medium text-gray-600 mb-1">Productos Asociados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {lineasProducto.reduce((sum, l) => sum + l.productosAsociados, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="ri-box-3-line text-orange-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Líneas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {lineasProducto.length === 0 && !loading ? (
            <div className="col-span-full text-center py-12">
              <i className="ri-inbox-line text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay líneas de producto registradas</h3>
              <p className="text-gray-500 mb-4">Comienza creando tu primera línea de producto.</p>
              <button 
                onClick={openCreateModal}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap"
              >
                Crear Primera Línea
              </button>
            </div>
          ) : (
            filteredLineas.map((linea) => (
              <div key={linea.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                  <img 
                    src={`https://readdy.ai/api/search-image?query=medical%20healthcare%20product%20line%20$%7Blinea.categoria%7D%20hospital%20equipment%20supplies%20professional%20clean%20modern%20design&width=300&height=200&seq=${linea.id}&orientation=landscape`}
                    alt={linea.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{linea.nombre}</h3>
                      <p className="text-sm text-gray-500">{linea.codigo}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(linea.estado)}`}>
                      {linea.estado}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{linea.descripcion}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Categoría:</span>
                      <span className="font-medium">{linea.categoria}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Productos:</span>
                      <span className="font-bold text-blue-600">{linea.productosAsociados}</span>
                    </div>
                    {linea.fechaCreacion && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Creada:</span>
                        <span className="font-medium">{formatDate(linea.fechaCreacion)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => openEditModal(linea)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Ver detalles
                    </button>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => openEditModal(linea)}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      <button 
                        onClick={() => handleDelete(linea.id!)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredLineas.length === 0 && lineasProducto.length > 0 && !loading && (
          <div className="text-center py-12">
            <i className="ri-search-line text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron líneas de producto</h3>
            <p className="text-gray-500">Intenta ajustar los filtros de búsqueda.</p>
          </div>
        )}
      </div>

      {/* Modal for Add/Edit Línea */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 lg:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                  {selectedLinea ? 'Editar Línea de Producto' : 'Nueva Línea de Producto'}
                </h2>
                <button 
                  onClick={() => {
                    setShowModal(false);
                    setSelectedLinea(null);
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
                      Código de Línea *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.codigo}
                      onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="LP-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Línea *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nombre de la línea"
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
                    placeholder="Descripción detallada de la línea de producto..."
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
                      <option value="Medicamentos">Medicamentos</option>
                      <option value="Suministros">Suministros</option>
                      <option value="Equipos">Equipos</option>
                      <option value="Instrumentos">Instrumentos</option>
                    </select>
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
                      <option value="ACTIVA">Activa</option>
                      <option value="INACTIVA">Inactiva</option>
                      <option value="DESCONTINUADA">Descontinuada</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedLinea(null);
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
                    {loading ? 'Guardando...' : (selectedLinea ? 'Actualizar' : 'Crear')} Línea
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
