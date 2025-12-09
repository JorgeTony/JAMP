
import { useState } from 'react';

export default function Requerimientos() {
  const [activeTab, setActiveTab] = useState('pendientes');
  const [showNewModal, setShowNewModal] = useState(false);

  const requerimientos = [
    {
      id: 'REQ-001',
      area: 'Urgencias',
      solicitante: 'Dr. Carlos Mendez',
      fecha: '2024-01-15',
      estado: 'pendiente',
      prioridad: 'alta',
      productos: [
        { nombre: 'Acetaminofén 500mg', cantidad: 100, unidad: 'tabletas' },
        { nombre: 'Jeringa 10ml', cantidad: 50, unidad: 'unidades' }
      ]
    },
    {
      id: 'REQ-002',
      area: 'Pediatría',
      solicitante: 'Dra. Ana López',
      fecha: '2024-01-14',
      estado: 'aprobado',
      prioridad: 'media',
      productos: [
        { nombre: 'Guantes Latex Talla S', cantidad: 200, unidad: 'pares' },
        { nombre: 'Termómetro Digital', cantidad: 5, unidad: 'unidades' }
      ]
    },
    {
      id: 'REQ-003',
      area: 'Farmacia',
      solicitante: 'Farm. Luis Rodríguez',
      fecha: '2024-01-13',
      estado: 'consolidado',
      prioridad: 'baja',
      productos: [
        { nombre: 'Alcohol Etílico 70%', cantidad: 20, unidad: 'litros' }
      ]
    }
  ];

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'aprobado': return 'bg-green-100 text-green-800';
      case 'consolidado': return 'bg-blue-100 text-blue-800';
      case 'rechazado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100">
                <i className="ri-menu-line text-xl"></i>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Requerimientos</h1>
            </div>
            
            <button 
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 whitespace-nowrap"
            >
              <i className="ri-add-line"></i>
              <span>Nuevo Requerimiento</span>
            </button>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">12</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <i className="ri-time-line text-yellow-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Aprobados</p>
                <p className="text-2xl font-bold text-green-600">8</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <i className="ri-check-line text-green-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Consolidados</p>
                <p className="text-2xl font-bold text-blue-600">15</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <i className="ri-file-list-3-line text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Mes</p>
                <p className="text-2xl font-bold text-gray-900">35</p>
              </div>
              <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                <i className="ri-bar-chart-line text-gray-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'pendientes', label: 'Pendientes', count: 12 },
                { id: 'aprobados', label: 'Aprobados', count: 8 },
                { id: 'consolidados', label: 'Consolidados', count: 15 },
                { id: 'historial', label: 'Historial', count: 156 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-4">
              {requerimientos.map((req) => (
                <div key={req.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{req.id}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(req.estado)}`}>
                          {req.estado.charAt(0).toUpperCase() + req.estado.slice(1)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(req.prioridad)}`}>
                          Prioridad {req.prioridad}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Área:</span> {req.area} | 
                        <span className="font-medium ml-2">Solicitante:</span> {req.solicitante}
                      </div>
                      <div className="text-sm text-gray-500">
                        Fecha: {req.fecha}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <i className="ri-eye-line text-lg"></i>
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg">
                        <i className="ri-edit-line text-lg"></i>
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <i className="ri-delete-bin-line text-lg"></i>
                      </button>
                    </div>
                  </div>

                  {/* Products List */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Productos solicitados:</h4>
                    <div className="space-y-2">
                      {req.productos.map((producto, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{producto.nombre}</span>
                          <span className="text-sm font-medium text-gray-900">
                            {producto.cantidad} {producto.unidad}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3 mt-4">
                    {req.estado === 'pendiente' && (
                      <>
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm whitespace-nowrap">
                          <i className="ri-check-line mr-1"></i>
                          Aprobar
                        </button>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm whitespace-nowrap">
                          <i className="ri-close-line mr-1"></i>
                          Rechazar
                        </button>
                      </>
                    )}
                    {req.estado === 'aprobado' && (
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap">
                        <i className="ri-file-list-3-line mr-1"></i>
                        Consolidar
                      </button>
                    )}
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">
                      <i className="ri-download-line mr-1"></i>
                      Exportar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Requirement Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Nuevo Requerimiento</h2>
                <button 
                  onClick={() => setShowNewModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Área Solicitante
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Seleccionar área</option>
                      <option value="urgencias">Urgencias</option>
                      <option value="pediatria">Pediatría</option>
                      <option value="farmacia">Farmacia</option>
                      <option value="cirugia">Cirugía</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prioridad
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Solicitante
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nombre del solicitante"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones
                  </label>
                  <textarea 
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Observaciones adicionales"
                  ></textarea>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Productos Solicitados
                    </label>
                    <button 
                      type="button"
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap"
                    >
                      <i className="ri-add-line mr-1"></i>
                      Agregar Producto
                    </button>
                  </div>
                  
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input 
                        type="text" 
                        placeholder="Nombre del producto"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input 
                        type="number" 
                        placeholder="Cantidad"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Unidad</option>
                        <option value="unidades">Unidades</option>
                        <option value="cajas">Cajas</option>
                        <option value="litros">Litros</option>
                        <option value="kg">Kilogramos</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-6">
                  <button 
                    type="button"
                    onClick={() => setShowNewModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
                  >
                    Crear Requerimiento
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
