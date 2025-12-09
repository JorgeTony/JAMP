// src/pages/transacciones/page.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWithAuth, postWithAuth, deleteWithAuth } from '../../utils/api';
import type { Transaccion } from './transaccion';

// 👇 Tipos locales para combos
interface Producto {
  id: number;
  nombre: string;
  codigo: string;
}

interface Almacen {
  id: number;
  nombre: string;
  codigo: string;
}

export default function Transacciones() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaccion, setSelectedTransaccion] = useState<Transaccion | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<Transaccion>({
    codigo: '',
    tipo: 'ENTRADA',
    fecha: new Date().toISOString().split('T')[0],
    productoId: 0,
    almacenId: 0,
    cantidad: 0,
    precioUnitario: 0,
    total: 0,
    responsable: '',
    observaciones: '',
    estado: 'COMPLETADA'
  });

  // Cargar datos al iniciar
  useEffect(() => {
    fetchTransacciones();
    fetchProductos();
    fetchAlmacenes();
  }, []);

  // Calcular total cuando cambian cantidad o precio
  useEffect(() => {
    const total = formData.cantidad * formData.precioUnitario;
    setFormData(prev => ({ ...prev, total }));
  }, [formData.cantidad, formData.precioUnitario]);

  const fetchTransacciones = async () => {
    try {
      setLoading(true);
      const data = (await getWithAuth('/transacciones/api')) as Transaccion[];
      setTransacciones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
      setTransacciones([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductos = async () => {
    try {
      const data = (await getWithAuth('/catalogo-productos/api')) as Producto[];
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProductos([]);
    }
  };

  const fetchAlmacenes = async () => {
    try {
      const data = (await getWithAuth('/almacenes/api')) as Almacen[];
      setAlmacenes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar almacenes:', error);
      setAlmacenes([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      await postWithAuth('/transacciones/api', formData);
      setShowModal(false);
      resetForm();
      await fetchTransacciones();
    } catch (error) {
      console.error('Error al guardar transacción:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
      try {
        await deleteWithAuth(`/transacciones/api/${id}`);
        await fetchTransacciones();
        alert('Transacción eliminada exitosamente');
      } catch (error) {
        console.error('Error al eliminar transacción:', error);
        alert('Error al eliminar la transacción');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      tipo: 'ENTRADA',
      fecha: new Date().toISOString().split('T')[0],
      productoId: 0,
      almacenId: 0,
      cantidad: 0,
      precioUnitario: 0,
      total: 0,
      responsable: '',
      observaciones: '',
      estado: 'COMPLETADA'
    });
  };

  const openEditModal = (transaccion: Transaccion) => {
    setSelectedTransaccion(transaccion);
    setFormData({
      ...transaccion,
      fecha: transaccion.fecha.split('T')[0] // Convertir a formato de input date
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setSelectedTransaccion(null);
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
      default:
        return 'https://readdy.ai/api/search-image?query=professional%20technical%20worker%20operator%20specialist%20icon%20orange%20background%20minimalist%20clean%20design%20inventory%20operations&width=32&height=32&seq=oper1&orientation=squarish';
    }
  };

  const filteredTransacciones = transacciones.filter(transaccion => {
    const matchesSearch =
      transaccion.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaccion.responsable.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaccion.productoNombre &&
        transaccion.productoNombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaccion.almacenNombre &&
        transaccion.almacenNombre.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTipo = filterTipo === 'todos' || transaccion.tipo === filterTipo;
    const matchesEstado = filterEstado === 'todos' || transaccion.estado === filterEstado;
    return matchesSearch && matchesTipo && matchesEstado;
  });

  const getTipoColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'entrada':
        return 'bg-green-100 text-green-800';
      case 'salida':
        return 'bg-red-100 text-red-800';
      case 'transferencia':
        return 'bg-blue-100 text-blue-800';
      case 'ajuste':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && transacciones.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando transacciones...</p>
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
                <i className="ri-arrow-right-s-line mx-2" />
                <span className="text-blue-200">Transacciones</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 lg:px-6 py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Gestión de Transacciones</h1>
          <p className="text-gray-600">Registra y controla todas las transacciones de inventario</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Buscar transacciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                />
              </div>
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
              >
                <option value="todos">Todos los tipos</option>
                <option value="ENTRADA">Entrada</option>
                <option value="SALIDA">Salida</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="AJUSTE">Ajuste</option>
              </select>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
              >
                <option value="todos">Todos los estados</option>
                <option value="COMPLETADA">Completada</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>
            <button 
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 whitespace-nowrap"
            >
              <i className="ri-add-line"></i>
              <span>Nueva Transacción</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Transacciones</p>
                <p className="text-2xl font-bold text-gray-900">{transacciones.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-exchange-line text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Entradas</p>
                <p className="text-2xl font-bold text-gray-900">{transacciones.filter(t => t.tipo === 'ENTRADA').length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-arrow-down-line text-green-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Salidas</p>
                <p className="text-2xl font-bold text-gray-900">{transacciones.filter(t => t.tipo === 'SALIDA').length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="ri-arrow-up-line text-red-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${transacciones.reduce((sum, t) => sum + t.total, 0).toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="ri-money-dollar-circle-line text-purple-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Transacciones Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Lista de Transacciones</h3>
          </div>
          {transacciones.length === 0 && !loading ? (
            <div className="text-center py-12">
              <i className="ri-inbox-line text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay transacciones registradas</h3>
              <p className="text-gray-500 mb-4">Comienza registrando tu primera transacción.</p>
              <button 
                onClick={openCreateModal}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap"
              >
                Crear Primera Transacción
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransacciones.map((transaccion) => (
                    <tr key={transaccion.id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{transaccion.codigo}</div>
                        <div className="text-sm text-gray-500">{transaccion.responsable}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoColor(transaccion.tipo)}`}>
                          {transaccion.tipo}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(transaccion.fecha)}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="text-sm text-gray-900">{transaccion.productoNombre || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{transaccion.almacenNombre || 'N/A'}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transaccion.cantidad.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">${transaccion.precioUnitario.toFixed(2)} c/u</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">${transaccion.total.toFixed(2)}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(transaccion.estado)}`}>
                          {transaccion.estado}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => openEditModal(transaccion)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <i className="ri-eye-line"></i>
                          </button>
                          <button 
                            onClick={() => handleDelete(transaccion.id!)}
                            className="text-red-600 hover:text-red-900"
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

        {filteredTransacciones.length === 0 && transacciones.length > 0 && !loading && (
          <div className="text-center py-12">
            <i className="ri-search-line text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron transacciones</h3>
            <p className="text-gray-500">Intenta ajustar los filtros de búsqueda.</p>
          </div>
        )}
      </div>

      {/* Modal for Add/Edit Transacción */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 lg:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                  {selectedTransaccion ? 'Editar Transacción' : 'Nueva Transacción'}
                </h2>
                <button 
                  onClick={() => {
                    setShowModal(false);
                    setSelectedTransaccion(null);
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
                      Código de Transacción *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.codigo}
                      onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="TXN-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Transacción *
                    </label>
                    <select 
                      required
                      value={formData.tipo}
                      onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
                    >
                      <option value="ENTRADA">Entrada</option>
                      <option value="SALIDA">Salida</option>
                      <option value="TRANSFERENCIA">Transferencia</option>
                      <option value="AJUSTE">Ajuste</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Producto *
                    </label>
                    <select 
                      required
                      value={formData.productoId}
                      onChange={(e) => setFormData({...formData, productoId: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
                    >
                      <option value={0}>Seleccionar producto</option>
                      {productos.map((producto) => (
                        <option key={producto.id} value={producto.id}>
                          {producto.codigo} - {producto.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Almacén *
                    </label>
                    <select 
                      required
                      value={formData.almacenId}
                      onChange={(e) => setFormData({...formData, almacenId: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
                    >
                      <option value={0}>Seleccionar almacén</option>
                      {almacenes.map((almacen) => (
                        <option key={almacen.id} value={almacen.id}>
                          {almacen.codigo} - {almacen.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.cantidad}
                      onChange={(e) => setFormData({...formData, cantidad: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio Unitario *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0"
                      value={formData.precioUnitario}
                      onChange={(e) => setFormData({...formData, precioUnitario: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.total}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.fecha}
                      onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones
                  </label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Observaciones adicionales..."
                  ></textarea>
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
                    <option value="COMPLETADA">Completada</option>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="CANCELADA">Cancelada</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedTransaccion(null);
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
                    {loading ? 'Guardando...' : (selectedTransaccion ? 'Actualizar' : 'Crear')} Transacción
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
