import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWithAuth, postWithAuth, putWithAuth, deleteWithAuth } from '../../utils/api';

interface Almacen {
  id?: number;
  codigo: string;
  nombre: string;
  ubicacion: string;
  responsable: string;
  capacidad: string;
  ocupacion: string;
  porcentajeOcupacion: number;
  estado: string;
  productos: number;
  ultimaActualizacion?: string;
}

export default function Almacenes() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedAlmacen, setSelectedAlmacen] = useState<Almacen | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Almacen>({
    codigo: '',
    nombre: '',
    ubicacion: '',
    responsable: '',
    capacidad: '',
    ocupacion: '',
    porcentajeOcupacion: 0,
    estado: 'activo',
    productos: 0
  });

  // Cargar almacenes al iniciar
  useEffect(() => {
    fetchAlmacenes();
  }, []);

  const fetchAlmacenes = async () => {
    try {
      const data = await getWithAuth('/almacenes/api');
      setAlmacenes(data);
    } catch (error) {
      console.error('Error al cargar almacenes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await putWithAuth(`/almacenes/api/${editingId}`, formData);
      } else {
        await postWithAuth('/almacenes/api', formData);
      }
      setShowModal(false);
      resetForm();
      fetchAlmacenes();
    } catch (error) {
      console.error('Error al guardar almacén:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este almacén?')) {
      try {
        await deleteWithAuth(`/almacenes/api/${id}`);
        fetchAlmacenes();
      } catch (error) {
        console.error('Error al eliminar almacén:', error);
      }
    }
  };

  const handleEstadoChange = async (id: number, nuevoEstado: string) => {
    try {
      const almacen = almacenes.find(a => a.id === id);
      if (almacen) {
        await putWithAuth(`/almacenes/api/${id}`, {
          ...almacen,
          estado: nuevoEstado
        });
        fetchAlmacenes();
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      nombre: '',
      ubicacion: '',
      responsable: '',
      capacidad: '',
      ocupacion: '',
      porcentajeOcupacion: 0,
      estado: 'activo',
      productos: 0
    });
  };

  const openEditModal = (almacen: Almacen) => {
    setSelectedAlmacen(almacen);
    setFormData(almacen);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setSelectedAlmacen(null);
    resetForm();
    setShowModal(true);
  };

  // Función para obtener el icono según el rol
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

  const filteredAlmacenes = almacenes.filter(almacen => {
    const matchesSearch = almacen.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         almacen.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         almacen.responsable.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'todos' || almacen.estado === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'mantenimiento':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactivo':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOcupacionColor = (porcentaje: number) => {
    if (porcentaje >= 90) return 'bg-red-500';
    if (porcentaje >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading && almacenes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando almacenes...</p>
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
                <span className="text-blue-200">Almacenes</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 lg:px-6 py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Gestión de Almacenes</h1>
          <p className="text-gray-600">Administra y controla todos los almacenes del sistema</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Buscar almacenes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
            <button 
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 whitespace-nowrap"
            >
              <i className="ri-add-line"></i>
              <span>Nuevo Almacén</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Almacenes</p>
                <p className="text-2xl font-bold text-gray-900">{almacenes.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-building-2-line text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Almacenes Activos</p>
                <p className="text-2xl font-bold text-gray-900">{almacenes.filter(a => a.estado.toLowerCase() === 'activo').length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-check-line text-green-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Capacidad Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {almacenes.reduce((total, a) => {
                    const capacidad = parseInt(a.capacidad.replace(/[^\d]/g, '')) || 0;
                    return total + capacidad;
                  }, 0).toLocaleString()} m²
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="ri-archive-line text-purple-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Ocupación Promedio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {almacenes.length > 0 ? Math.round(almacenes.reduce((sum, a) => sum + a.porcentajeOcupacion, 0) / almacenes.length) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="ri-pie-chart-line text-orange-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Almacenes Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Lista de Almacenes</h3>
          </div>
          {almacenes.length === 0 && !loading ? (
            <div className="text-center py-12">
              <i className="ri-inbox-line text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay almacenes registrados</h3>
              <p className="text-gray-500 mb-4">Comienza agregando tu primer almacén al sistema.</p>
              <button 
                onClick={openCreateModal}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap"
              >
                Crear Primer Almacén
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Almacén
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Responsable
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ocupación
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Productos
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAlmacenes.map((almacen) => (
                    <tr key={almacen.id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{almacen.nombre}</div>
                          <div className="text-sm text-gray-500">{almacen.codigo}</div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="text-sm text-gray-900">{almacen.ubicacion}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{almacen.responsable}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getOcupacionColor(almacen.porcentajeOcupacion)}`}
                              style={{ width: `${almacen.porcentajeOcupacion}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{almacen.porcentajeOcupacion}%</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {almacen.ocupacion} / {almacen.capacidad}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(almacen.estado)}`}>
                          {almacen.estado.charAt(0).toUpperCase() + almacen.estado.slice(1)}
                        </span>
                        <div className="mt-1">
                          <select 
                            value={almacen.estado}
                            onChange={(e) => handleUpdateStatus(almacen.id!, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 pr-6"
                          >
                            <option value="activo">Activo</option>
                            <option value="mantenimiento">Mantenimiento</option>
                            <option value="inactivo">Inactivo</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{almacen.productos.toLocaleString()}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => openEditModal(almacen)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button 
                            onClick={() => handleDelete(almacen.id!)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filteredAlmacenes.length === 0 && almacenes.length > 0 && !loading && (
          <div className="text-center py-12">
            <i className="ri-search-line text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron almacenes</h3>
            <p className="text-gray-500">Intenta ajustar los filtros de búsqueda.</p>
          </div>
        )}
      </div>

      {/* Modal for Add/Edit Almacén */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 lg:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                  {selectedAlmacen ? 'Editar Almacén' : 'Nuevo Almacén'}
                </h2>
                <button 
                  onClick={() => {
                    setShowModal(false);
                    setSelectedAlmacen(null);
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
                      Código del Almacén *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.codigo}
                      onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="ALM-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Almacén *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Almacén Central"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Edificio Principal - Piso 1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Responsable *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.responsable}
                      onChange={(e) => setFormData({...formData, responsable: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nombre del responsable"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacidad *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.capacidad}
                      onChange={(e) => setFormData({...formData, capacidad: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1000 m²"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ocupación Actual
                    </label>
                    <input
                      type="text"
                      value={formData.ocupacion}
                      onChange={(e) => setFormData({...formData, ocupacion: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="750 m²"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Porcentaje de Ocupación
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.porcentajeOcupacion}
                      onChange={(e) => setFormData({...formData, porcentajeOcupacion: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="75"
                    />
                  </div>
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
                    <option value="activo">Activo</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedAlmacen(null);
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
                    {loading ? 'Guardando...' : (selectedAlmacen ? 'Actualizar' : 'Crear')} Almacén
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

