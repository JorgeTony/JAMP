import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWithAuth, postWithAuth, putWithAuth, deleteWithAuth } from '../../utils/api';
import { hasAccess, getAccessDeniedMessage } from '../../utils/permissions';

export default function Configuracion() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('general');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showNewAlmacenModal, setShowNewAlmacenModal] = useState(false);
  const [showNewCategoriaModal, setShowNewCategoriaModal] = useState(false);
  const [showNewProveedorModal, setShowNewProveedorModal] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  const [newUserForm, setNewUserForm] = useState({
    username: '',
    email: '',
    name: '',
    role: 'Operador',
    password: '',
    confirmPassword: ''
  });

  const [newAlmacenForm, setNewAlmacenForm] = useState({
    codigo: '',
    nombre: '',
    ubicacion: '',
    responsable: '',
    capacidad: ''
  });

  const [newCategoriaForm, setNewCategoriaForm] = useState({
    nombre: '',
    descripcion: '',
    icono: 'ri-folder-line'
  });

  const [newProveedorForm, setNewProveedorForm] = useState({
    nombre: '',
    razonSocial: '',
    ruc: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: ''
  });


  const roleLabelMap: Record<string, string> = {
    ADMIN: 'Administrador',
    SUPERVISOR: 'Supervisor',
    OPERADOR: 'Operador'
  };

  const roleMapToBackend: Record<string, string> = {
    Administrador: 'ADMIN',
    Supervisor: 'SUPERVISOR',
    Operador: 'OPERADOR'
  };


  type UserRow = {
    id: number;
    username: string;
    name: string;
    email: string;
    role: string;
    status: 'activo' | 'inactivo';
    lastAccess: string;
    avatar: string;
    backendRole: string;
  };

  type AlmacenRow = {
    id: number;
    name: string;
    code: string;
    location: string;
    status: 'activo' | 'mantenimiento' | 'inactivo';
    responsable: string;
    capacidad: string;
  };
  type CategoriaRow = {
    id: number;
    name: string;
    icon: string;
    count: number;
    color: string;
    estado: 'ACTIVO' | 'INACTIVO';
  };
  type ProveedorRow = {
    id: number;
    name: string;
    contact: string;
    phone: string;
    products: number;
    status: 'activo' | 'inactivo';
  };

  const [users, setUsers] = useState<UserRow[]>([]);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [almacenes, setAlmacenes] = useState<AlmacenRow[]>([]);

  const [editingAlmacen, setEditingAlmacen] = useState<AlmacenRow | null>(null);

  const [categorias, setCategorias] = useState<CategoriaRow[]>([]);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaRow | null>(null);


  const [proveedores, setProveedores] = useState<ProveedorRow[]>([]);
  const [editingProveedor, setEditingProveedor] = useState<ProveedorRow | null>(null);
  const [loadingProveedores, setLoadingProveedores] = useState(false);

  const getCategoriaColor = (nameOrIcon: string): string => {
    // Puedes ajustar esta lógica a tu gusto
    const key = nameOrIcon.toLowerCase();
    if (key.includes('medic') || key.includes('capsule')) {
      return 'bg-blue-100 text-blue-600';
    }
    if (key.includes('material') || key.includes('heart')) {
      return 'bg-green-100 text-green-600';
    }
    if (key.includes('epp') || key.includes('shield')) {
      return 'bg-orange-100 text-orange-600';
    }
    if (key.includes('equip') || key.includes('stethoscope')) {
      return 'bg-purple-100 text-purple-600';
    }
    if (key.includes('antisept') || key.includes('drop')) {
      return 'bg-red-100 text-red-600';
    }
    return 'bg-gray-100 text-gray-600';
  };

  const mapCategoriaFromBackend = (c: any): CategoriaRow => {
    const icon = c.icono || 'ri-folder-line';
    return {
      id: c.id,
      name: c.nombre,
      icon,
      count: c.productos ?? 0,
      color: getCategoriaColor(icon || c.nombre),
      estado: c.estado || 'ACTIVO'
    };
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
  const mapProveedorFromBackend = (p: any): ProveedorRow => {
    return {
      id: p.id,
      name: p.nombre,
      contact: p.contacto || '',
      phone: p.telefono || '',
      // Por ahora estos 2 no vienen de la BD, los manejamos en front
      products: 0,
      status: 'activo'
    };
  };

  const loadProveedores = async () => {
    try {
      setLoadingProveedores(true);
      const data = await getWithAuth('/proveedores/api');
      const rows = (data as any[]).map(mapProveedorFromBackend);
      setProveedores(rows);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error al cargar proveedores');
    } finally {
      setLoadingProveedores(false);
    }
  };

  const mapAlmacenFromBackend = (a: any): AlmacenRow => {
    const status: AlmacenRow['status'] =
      a.estado === 'ACTIVO'
        ? 'activo'
        : a.estado === 'MANTENIMIENTO'
          ? 'mantenimiento'
          : 'inactivo';

    return {
      id: a.id,
      name: a.nombre,
      code: a.codigo,
      location: a.ubicacion,
      status,
      responsable: a.responsable || '',
      capacidad: a.capacidad || ''
    };
  };


  const mapUsuarioFromBackend = (u: any): UserRow => {
    const frontRole = roleLabelMap[u.rol] || u.rol; // ahora u.rol será 'Operador', 'Administrador', etc.
    const fullName = `${u.nombre} ${u.apellidos}`.trim();

    return {
      id: u.id,
      username: u.email.split('@')[0],
      name: fullName,
      email: u.email,
      role: frontRole,
      status: u.estado === 'ACTIVO' ? 'activo' : 'inactivo',
      lastAccess: u.ultimoAcceso ? new Date(u.ultimoAcceso).toLocaleString() : 'Nunca',
      avatar: getUserIcon(frontRole),
      backendRole: u.rol
    };
  };


  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await getWithAuth('/usuarios/api');
      const rows = (data as any[]).map(mapUsuarioFromBackend);
      setUsers(rows);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error al cargar usuarios');
    } finally {
      setLoadingUsers(false);
    }
  };
  const loadAlmacenes = async () => {
    try {
      const data = await getWithAuth('/almacenes/api');
      const rows = (data as any[]).map(mapAlmacenFromBackend);
      setAlmacenes(rows);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error al cargar almacenes');
    }
  };
  const loadCategorias = async () => {
    try {
      const data = await getWithAuth('/categorias/api');
      const rows = (data as any[]).map(mapCategoriaFromBackend);
      setCategorias(rows);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error al cargar categorías');
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);

      if (hasAccess(parsed.role, 'usuarios', 'view')) {
        loadUsers();
      }

      if (hasAccess(parsed.role, 'almacenes', 'view')) {
        loadAlmacenes();
      }
      if (hasAccess(parsed.role, 'almacenes', 'view')) {
        loadAlmacenes();
      }

      if (hasAccess(parsed.role, 'categorias', 'view')) {
        loadCategorias();
      }
      if (hasAccess(parsed.role, 'proveedores', 'view')) {
        loadProveedores();
      }


    }
  }, []);


  const handleNewUser = () => {
    if (!hasAccess(user?.role, 'usuarios', 'create')) {
      setShowAccessDenied(true);
      setTimeout(() => setShowAccessDenied(false), 3000);
      return;
    }
    setEditingUser(null);
    setNewUserForm({
      username: '',
      email: '',
      name: '',
      role: 'Operador',
      password: '',
      confirmPassword: ''
    });
    setShowNewUserModal(true);
  };

  const handleEditUserClick = (userItem: UserRow) => {
    if (!hasAccess(user?.role, 'usuarios', 'edit')) {
      setShowAccessDenied(true);
      setTimeout(() => setShowAccessDenied(false), 3000);
      return;
    }
    setEditingUser(userItem);
    setNewUserForm({
      username: userItem.username,
      email: userItem.email,
      name: userItem.name,
      role: userItem.role,
      password: '',
      confirmPassword: ''
    });
    setShowNewUserModal(true);
  };
  const handleEditCategoriaClick = (category: CategoriaRow) => {
    if (!hasAccess(user?.role, 'categorias', 'edit')) {
      setShowAccessDenied(true);
      setTimeout(() => setShowAccessDenied(false), 3000);
      return;
    }

    setEditingCategoria(category);
    setNewCategoriaForm({
      nombre: category.name,
      descripcion: '',
      icono: category.icon
    });
    setShowNewCategoriaModal(true);
  };
  const handleDeleteCategoria = async (categoriaId: number) => {
    if (!hasAccess(user?.role, 'categorias', 'delete')) {
      setShowAccessDenied(true);
      setTimeout(() => setShowAccessDenied(false), 3000);
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      return;
    }

    try {
      await deleteWithAuth(`/categorias/api/${categoriaId}`);
      setCategorias(prev => prev.filter(c => c.id !== categoriaId));
      alert('Categoría eliminada exitosamente');
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error al eliminar categoría');
    }
  };

  const handleNewAlmacen = () => {
    if (!hasAccess(user?.role, 'almacenes', 'create')) {
      setShowAccessDenied(true);
      setTimeout(() => setShowAccessDenied(false), 3000);
      return;
    }

    setEditingAlmacen(null);
    setNewAlmacenForm({
      codigo: '',
      nombre: '',
      ubicacion: '',
      responsable: '',
      capacidad: ''
    });
    setShowNewAlmacenModal(true);
  };
  const handleEditAlmacenClick = (almacen: AlmacenRow) => {
    if (!hasAccess(user?.role, 'almacenes', 'edit')) {
      setShowAccessDenied(true);
      setTimeout(() => setShowAccessDenied(false), 3000);
      return;
    }

    setEditingAlmacen(almacen);
    setNewAlmacenForm({
      codigo: almacen.code,
      nombre: almacen.name,
      ubicacion: almacen.location,
      responsable: almacen.responsable,
      capacidad: almacen.capacidad
    });
    setShowNewAlmacenModal(true);
  };

  const handleDeleteAlmacen = async (id: number) => {
    if (!hasAccess(user?.role, 'almacenes', 'delete')) {
      setShowAccessDenied(true);
      setTimeout(() => setShowAccessDenied(false), 3000);
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar este almacén?')) {
      return;
    }

    try {
      await deleteWithAuth(`/almacenes/api/${id}`);
      setAlmacenes(prev => prev.filter(a => a.id !== id));
      alert('Almacén eliminado exitosamente');
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error al eliminar almacén');
    }
  };

  const handleNewCategoria = () => {
    if (!hasAccess(user?.role, 'categorias', 'create')) {
      setShowAccessDenied(true);
      setTimeout(() => setShowAccessDenied(false), 3000);
      return;
    }
    setEditingCategoria(null);
    setNewCategoriaForm({
      nombre: '',
      descripcion: '',
      icono: 'ri-folder-line'
    });
    setShowNewCategoriaModal(true);
  };


  const handleNewProveedor = () => {
    if (!hasAccess(user?.role, 'proveedores', 'create')) {
      setShowAccessDenied(true);
      setTimeout(() => setShowAccessDenied(false), 3000);
      return;
    }
    setEditingProveedor(null);
    setNewProveedorForm({
      nombre: '',
      razonSocial: '',
      ruc: '',
      contacto: '',
      telefono: '',
      email: '',
      direccion: ''
    });
    setShowNewProveedorModal(true);
  };

  const handleEditProveedorClick = (prov: ProveedorRow) => {
    if (!hasAccess(user?.role, 'proveedores', 'edit')) {
      setShowAccessDenied(true);
      setTimeout(() => setShowAccessDenied(false), 3000);
      return;
    }

    setEditingProveedor(prov);
    setNewProveedorForm({
      nombre: prov.name,
      razonSocial: '', // si luego lo traes de la BD, aquí lo mapeas
      ruc: '',
      contacto: prov.contact,
      telefono: prov.phone,
      email: '',
      direccion: ''
    });
    setShowNewProveedorModal(true);
  };



 const handleCreateUser = async () => {
  if (!hasAccess(user?.role, 'usuarios', editingUser ? 'edit' : 'create')) {
    alert('No tienes permisos para realizar esta acción');
    return;
  }

  // Validaciones básicas
  if (
    !newUserForm.name.trim() ||
    !newUserForm.username.trim() ||
    !newUserForm.email.trim() ||
    (!editingUser && !newUserForm.password.trim())
  ) {
    alert('Nombre, usuario, correo y contraseña son obligatorios');
    return;
  }

  if (!editingUser && newUserForm.password !== newUserForm.confirmPassword) {
    alert('Las contraseñas no coinciden');
    return;
  }

  // Separar nombre / apellidos
  const [nombre, ...resto] = newUserForm.name.trim().split(' ');
  const apellidos = resto.join(' ');

  // Rol que espera el backend
  const backendRole = roleMapToBackend[newUserForm.role] || 'OPERADOR';

  const payload: any = {
    nombre,
    apellidos,
    email: newUserForm.email,
    username: newUserForm.username,   // si tu backend tiene este campo
    rol: backendRole,
    estado: 'ACTIVO'
  };

  // Si es creación o si en edición se cambió la contraseña
  if (!editingUser || newUserForm.password) {
    payload.password = newUserForm.password;
  }

  try {
    let response;
    if (!editingUser) {
      // Crear
      response = await postWithAuth('/usuarios/api', payload);
    } else {
      // Editar
      response = await putWithAuth(`/usuarios/api/${editingUser.id}`, payload);
    }

    const usuarioBackend = (response as any).usuario || response;
    const row = mapUsuarioFromBackend(usuarioBackend);

    if (!editingUser) {
      setUsers(prev => [...prev, row]);
      alert('Usuario creado exitosamente');
    } else {
      setUsers(prev => prev.map(u => (u.id === row.id ? row : u)));
      alert('Usuario actualizado exitosamente');
    }

    // Cerrar modal y limpiar formulario
    setShowNewUserModal(false);
    setEditingUser(null);
    setNewUserForm({
      username: '',
      email: '',
      name: '',
      role: 'Operador',
      password: '',
      confirmPassword: ''
    });
  } catch (error: any) {
    console.error(error);
    alert(error.message || 'Error al guardar usuario');
  }
};




  const handleCreateAlmacen = async () => {
    const permiso = editingAlmacen ? 'edit' : 'create';

    if (!hasAccess(user?.role, 'almacenes', permiso)) {
      alert('No tienes permisos para realizar esta acción');
      return;
    }

    if (
      !newAlmacenForm.codigo ||
      !newAlmacenForm.nombre ||
      !newAlmacenForm.ubicacion ||
      !newAlmacenForm.responsable
    ) {
      alert('Todos los campos son obligatorios');
      return;
    }

    const payload: any = {
      codigo: newAlmacenForm.codigo,
      nombre: newAlmacenForm.nombre,
      ubicacion: newAlmacenForm.ubicacion,
      responsable: newAlmacenForm.responsable,
      capacidad: newAlmacenForm.capacidad,
      ocupacion: '0 m³',
      porcentajeOcupacion: 0,
      estado: 'ACTIVO',
      productos: 0
    };

    try {
      let response;
      if (editingAlmacen) {
        // EDITAR
        response = await putWithAuth(`/almacenes/api/${editingAlmacen.id}`, payload);
      } else {
        // CREAR
        response = await postWithAuth('/almacenes/api', payload);
      }

      const almacenBackend = (response as any).almacen || response;
      const row = mapAlmacenFromBackend(almacenBackend);

      setAlmacenes(prev =>
        editingAlmacen
          ? prev.map(a => (a.id === row.id ? row : a))
          : [...prev, row]
      );

      setShowNewAlmacenModal(false);
      setEditingAlmacen(null);
      setNewAlmacenForm({
        codigo: '',
        nombre: '',
        ubicacion: '',
        responsable: '',
        capacidad: ''
      });

      alert(
        editingAlmacen
          ? 'Almacén actualizado exitosamente'
          : 'Almacén creado exitosamente'
      );
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error al guardar almacén');
    }
  };



  const handleCreateCategoria = async () => {
    if (!hasAccess(user?.role, 'categorias', editingCategoria ? 'edit' : 'create')) {
      alert('No tienes permisos para realizar esta acción');
      return;
    }

    if (!newCategoriaForm.nombre.trim()) {
      alert('El nombre de la categoría es obligatorio');
      return;
    }

    const payload: any = {
      nombre: newCategoriaForm.nombre.trim(),
      descripcion: newCategoriaForm.descripcion.trim(),
      icono: newCategoriaForm.icono,
      estado: 'ACTIVO',
      productos: editingCategoria ? editingCategoria.count : 0
    };

    try {
      let response;
      if (!editingCategoria) {
        // Crear
        response = await postWithAuth('/categorias/api', payload);
      } else {
        // Editar
        response = await putWithAuth(`/categorias/api/${editingCategoria.id}`, payload);
      }

      const categoriaBackend = (response as any).categoria || response;
      const row = mapCategoriaFromBackend(categoriaBackend);

      if (!editingCategoria) {
        setCategorias(prev => [...prev, row]);
      } else {
        setCategorias(prev => prev.map(c => (c.id === row.id ? row : c)));
      }

      setShowNewCategoriaModal(false);
      setEditingCategoria(null);
      setNewCategoriaForm({
        nombre: '',
        descripcion: '',
        icono: 'ri-folder-line'
      });

      alert(!editingCategoria ? 'Categoría creada exitosamente' : 'Categoría actualizada exitosamente');
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error al guardar categoría');
    }
  };


  const handleCreateProveedor = async () => {
    if (!hasAccess(user?.role, 'proveedores', editingProveedor ? 'edit' : 'create')) {
      setShowAccessDenied(true);
      setTimeout(() => setShowAccessDenied(false), 3000);
      return;
    }

    if (!newProveedorForm.nombre || !newProveedorForm.contacto || !newProveedorForm.telefono) {
      alert('Los campos nombre, contacto y teléfono son obligatorios');
      return;
    }

    const payload: any = {
      nombre: newProveedorForm.nombre,
      razonSocial: newProveedorForm.razonSocial || newProveedorForm.nombre,
      ruc: newProveedorForm.ruc || '',
      contacto: newProveedorForm.contacto,
      telefono: newProveedorForm.telefono
    };

    try {
      let response;
      if (!editingProveedor) {
        // Crear
        response = await postWithAuth('/proveedores/api', payload);
      } else {
        // Editar
        response = await putWithAuth(`/proveedores/api/${editingProveedor.id}`, payload);
      }

      const proveedorBackend = (response as any).proveedor || response;
      const row = mapProveedorFromBackend(proveedorBackend);

      if (!editingProveedor) {
        setProveedores(prev => [...prev, row]);
        alert('Proveedor creado exitosamente');
      } else {
        setProveedores(prev => prev.map(p => (p.id === row.id ? row : p)));
        alert('Proveedor actualizado exitosamente');
      }

      setShowNewProveedorModal(false);
      setEditingProveedor(null);
      setNewProveedorForm({
        nombre: '',
        razonSocial: '',
        ruc: '',
        contacto: '',
        telefono: '',
        email: '',
        direccion: ''
      });
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error al guardar proveedor');
    }
  };
  const handleDeleteProveedor = async (id: number) => {
    if (!hasAccess(user?.role, 'proveedores', 'delete')) {
      setShowAccessDenied(true);
      setTimeout(() => setShowAccessDenied(false), 3000);
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar este proveedor?')) {
      return;
    }

    try {
      await deleteWithAuth(`/proveedores/api/${id}`);
      setProveedores(prev => prev.filter(p => p.id !== id));
      alert('Proveedor eliminado exitosamente');
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error al eliminar proveedor');
    }
  };


  const handleDeleteUser = async (userId: number) => {
    if (!hasAccess(user?.role, 'usuarios', 'delete')) {
      setShowAccessDenied(true);
      setTimeout(() => setShowAccessDenied(false), 3000);
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return;
    }

    try {
      await deleteWithAuth(`/usuarios/api/${userId}`);
      setUsers(users.filter((u) => u.id !== userId));
      alert('Usuario eliminado exitosamente');
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error al eliminar usuario');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const renderContent = () => {
    switch (selectedTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="ri-settings-line text-blue-600 text-lg"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Información de la Empresa</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Empresa</label>
                  <input
                    type="text"
                    defaultValue="Proyecto JAMP"
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">RUC</label>
                  <input
                    type="text"
                    defaultValue="20123456789"
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                  <input
                    type="text"
                    defaultValue="Av. Salud 123, Lima"
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="text"
                    defaultValue="+51 959791846"
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="ri-tools-line text-green-600 text-lg"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Configuración del Sistema</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Moneda por Defecto</h4>
                    <p className="text-sm text-gray-600">Moneda utilizada en el sistema</p>
                  </div>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8">
                    <option value="USD">USD - Dólares</option>
                    <option value="PEN">PEN - Soles Peruanos</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Zona Horaria</h4>
                    <p className="text-sm text-gray-600">Zona horaria del sistema</p>
                  </div>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8">
                    <option value="America/Lima">Lima (UTC-5)</option>
                    <option value="America/New_York">New York (UTC-5)</option>
                    <option value="Europe/Madrid">Madrid (UTC+1)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Formato de Fecha</h4>
                    <p className="text-sm text-gray-600">Formato de fechas en el sistema</p>
                  </div>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8">
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      case 'usuarios':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="ri-user-line text-purple-600 text-lg"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Gestión de Usuarios</h3>
                    <p className="text-sm text-gray-600">Administra los usuarios del sistema</p>
                  </div>
                </div>
                <button
                  onClick={handleNewUser}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 whitespace-nowrap"
                >
                  <i className="ri-add-line"></i>
                  <span>Nuevo Usuario</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Acceso</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loadingUsers && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        Cargando usuarios...
                      </td>
                    </tr>
                  )}
                  {!loadingUsers && users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No hay usuarios registrados.
                      </td>
                    </tr>
                  )}
                  {!loadingUsers &&
                    users.map((userItem) => (
                      <tr key={userItem.id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <img src={userItem.avatar} alt="Usuario" className="w-10 h-10 rounded-full object-cover" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                              <div className="text-sm text-gray-500">{userItem.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{userItem.role}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${userItem.status === 'activo'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                              }`}
                          >
                            {userItem.status === 'activo' ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{userItem.lastAccess}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditUserClick(userItem)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(userItem.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
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
          </div>
        );
      case 'almacenes':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="ri-building-2-line text-green-600 text-lg"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Configuración de Almacenes</h3>
                    <p className="text-sm text-gray-600">Gestiona los almacenes y ubicaciones</p>
                  </div>
                </div>
                <button
                  onClick={handleNewAlmacen}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 whitespace-nowrap"
                >
                  <i className="ri-add-line"></i>
                  <span>Nuevo Almacén</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {almacenes.map((warehouse) => (
                  <div key={warehouse.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <i className="ri-building-2-line text-blue-600"></i>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{warehouse.name}</h4>
                          <p className="text-sm text-gray-600">{warehouse.code}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${warehouse.status === 'activo'
                          ? 'bg-green-100 text-green-700'
                          : warehouse.status === 'mantenimiento'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                          }`}
                      >
                        {warehouse.status === 'activo'
                          ? 'Activo'
                          : warehouse.status === 'mantenimiento'
                            ? 'Mantenimiento'
                            : 'Inactivo'}
                      </span>

                    </div>
                    <p className="text-sm text-gray-600 mb-4">📍 {warehouse.location}</p>
                    <div className="flex items-center space-x-2">
                      <button
                        className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                        onClick={() => handleEditAlmacenClick(warehouse)}
                      >
                        Editar
                      </button>
                      <button
                        className="px-3 py-2 border border-gray-300 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                        onClick={() => handleDeleteAlmacen(warehouse.id)}
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'categorias':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <i className="ri-folder-line text-orange-600 text-lg"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Categorías de Productos</h3>
                    <p className="text-sm text-gray-600">Organiza los productos por categorías</p>
                  </div>
                </div>
                <button
                  onClick={handleNewCategoria}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 whitespace-nowrap"
                >
                  <i className="ri-add-line"></i>
                  <span>Nueva Categoría</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categorias.map((category) => (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center`}>
                          <i className={`${category.icon} text-lg`}></i>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{category.name}</h4>
                          <p className="text-sm text-gray-600">{category.count} productos</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          onClick={() => handleEditCategoriaClick(category)}
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          onClick={() => handleDeleteCategoria(category.id)}
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'proveedores':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <i className="ri-truck-line text-indigo-600 text-lg"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Gestión de Proveedores</h3>
                    <p className="text-sm text-gray-600">Administra la información de proveedores</p>
                  </div>
                </div>
                <button
                  onClick={handleNewProveedor}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 whitespace-nowrap"
                >
                  <i className="ri-add-line"></i>
                  <span>Nuevo Proveedor</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proveedor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Productos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {proveedores.map((supplier) => (
                    <tr key={supplier.id}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                          <div className="text-sm text-gray-500">{supplier.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{supplier.contact}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{supplier.products} productos</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${supplier.status === 'activo'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}
                        >
                          {supplier.status === 'activo' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditProveedorClick(supplier)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteProveedor(supplier.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
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
          </div>
        );
      case 'notificaciones':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <i className="ri-notification-3-line text-red-600 text-lg"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Configuración de Alertas</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Stock Bajo</h4>
                    <p className="text-sm text-gray-600">Alertas cuando el stock esté por debajo del mínimo</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Productos Próximos a Vencer</h4>
                    <p className="text-sm text-gray-600">Notificaciones de productos cercanos al vencimiento</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Movimientos de Inventario</h4>
                    <p className="text-sm text-gray-600">Notificaciones por movimientos importantes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="ri-mail-line text-blue-600 text-lg"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Configuración de Email</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Servidor SMTP</label>
                  <input
                    type="text"
                    value="smtp.gmail.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Puerto</label>
                  <input
                    type="text"
                    value="587"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
                  <input
                    type="email"
                    value="sistema@hospital.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                  <input
                    type="password"
                    value="••••••••"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-700 shadow-sm">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 lg:space-x-6">
              <div className="flex items-center space-x-3">
                <img src={getUserIcon()} alt="Sistema" className="w-8 h-8 rounded-lg object-cover" />
                <button
                  onClick={() => navigate('/')}
                  className="text-lg lg:text-xl font-bold text-white hover:text-blue-200 transition-colors cursor-pointer"
                >
                  Inventarios JAMP
                </button>
              </div>
              <nav className="hidden lg:flex items-center space-x-8">
                <button
                  onClick={() => {
                    if (!hasAccess(user?.role, 'dashboard')) {
                      setShowAccessDenied(true);
                      setTimeout(() => setShowAccessDenied(false), 3000);
                      return;
                    }
                    navigate('/dashboard');
                  }}
                  className="text-blue-200 hover:text-white font-medium transition-colors whitespace-nowrap"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    if (!hasAccess(user?.role, 'productos')) {
                      setShowAccessDenied(true);
                      setTimeout(() => setShowAccessDenied(false), 3000);
                      return;
                    }
                    navigate('/productos');
                  }}
                  className="text-blue-200 hover:text-white font-medium transition-colors whitespace-nowrap"
                >
                  Productos
                </button>
                <button
                  onClick={() => {
                    if (!hasAccess(user?.role, 'inventario')) {
                      setShowAccessDenied(true);
                      setTimeout(() => setShowAccessDenied(false), 3000);
                      return;
                    }
                    navigate('/inventario');
                  }}
                  className="text-blue-200 hover:text-white font-medium transition-colors whitespace-nowrap"
                >
                  Inventario
                </button>
                <button
                  onClick={() => {
                    if (!hasAccess(user?.role, 'reportes')) {
                      setShowAccessDenied(true);
                      setTimeout(() => setShowAccessDenied(false), 3000);
                      return;
                    }
                    navigate('/reportes');
                  }}
                  className="text-blue-200 hover:text-white font-medium transition-colors whitespace-nowrap"
                >
                  Reportes
                </button>
                <button className="text-white bg-blue-600 px-3 py-1 rounded-md font-medium whitespace-nowrap">
                  Configuración
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-white hover:text-blue-200"
              >
                <i className={`${mobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'} text-xl`}></i>
              </button>
              <div className="hidden lg:flex items-center space-x-3">
                <img
                  src={
                    user?.role === 'Administrador'
                      ? getUserIcon('Administrador')
                      : user?.role === 'Supervisor'
                        ? getUserIcon('Supervisor')
                        : user?.role === 'Operador'
                          ? getUserIcon('Operador')
                          : getUserIcon()
                  }
                  alt={user?.name || 'Usuario'}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="text-sm">
                  <p className="font-medium text-white">{user?.name || 'Usuario'}</p>
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
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-slate-600">
              <nav className="flex flex-col space-y-2 mt-4">
                <button
                  onClick={() => {
                    if (!hasAccess(user?.role, 'dashboard')) {
                      setShowAccessDenied(true);
                      setTimeout(() => setShowAccessDenied(false), 3000);
                      return;
                    }
                    navigate('/dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="text-blue-200 hover:text-white font-medium transition-colors text-left py-2"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    if (!hasAccess(user?.role, 'productos')) {
                      setShowAccessDenied(true);
                      setTimeout(() => setShowAccessDenied(false), 3000);
                      return;
                    }
                    navigate('/productos');
                    setMobileMenuOpen(false);
                  }}
                  className="text-blue-200 hover:text-white font-medium transition-colors text-left py-2"
                >
                  Productos
                </button>
                <button
                  onClick={() => {
                    if (!hasAccess(user?.role, 'inventario')) {
                      setShowAccessDenied(true);
                      setTimeout(() => setShowAccessDenied(false), 3000);
                      return;
                    }
                    navigate('/inventario');
                    setMobileMenuOpen(false);
                  }}
                  className="text-blue-200 hover:text-white font-medium transition-colors text-left py-2"
                >
                  Inventario
                </button>
                <button
                  onClick={() => {
                    if (!hasAccess(user?.role, 'reportes')) {
                      setShowAccessDenied(true);
                      setTimeout(() => setShowAccessDenied(false), 3000);
                      return;
                    }
                    navigate('/reportes');
                    setMobileMenuOpen(false);
                  }}
                  className="text-blue-200 hover:text-white font-medium transition-colors text-left py-2"
                >
                  Reportes
                </button>
                <button className="text-white bg-blue-600 px-3 py-2 rounded-md font-medium text-left">
                  Configuración
                </button>
              </nav>
              <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-slate-600">
                <img
                  src={
                    user?.role === 'Administrador'
                      ? getUserIcon('Administrador')
                      : user?.role === 'Supervisor'
                        ? getUserIcon('Supervisor')
                        : user?.role === 'Operador'
                          ? getUserIcon('Operador')
                          : getUserIcon()
                  }
                  alt={user?.name || 'Usuario'}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="text-sm">
                  <p className="font-medium text-white">{user?.name || 'Usuario'}</p>
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
        <div className="mb-6 lg:mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Configuración del Sistema</h2>
          <p className="text-gray-600">Administra la configuración general del sistema de inventarios</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <nav className="space-y-2">
                {[
                  { id: 'general', label: 'General', icon: 'ri-settings-line', color: 'blue' },
                  { id: 'usuarios', label: 'Usuarios', icon: 'ri-user-line', color: 'purple' },
                  { id: 'almacenes', label: 'Almacenes', icon: 'ri-building-2-line', color: 'green' },
                  { id: 'proveedores', label: 'Proveedores', icon: 'ri-truck-line', color: 'indigo' },
                  { id: 'notificaciones', label: 'Notificaciones', icon: 'ri-notification-3-line', color: 'red' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${selectedTab === tab.id
                      ? `bg-${tab.color}-50 text-${tab.color}-700 border border-${tab.color}-200`
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <div
                      className={`w-6 h-6 flex items-center justify-center ${selectedTab === tab.id ? `text-${tab.color}-600` : 'text-gray-400'
                        }`}
                    >
                      <i className={`${tab.icon} text-lg`}></i>
                    </div>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="flex-1">
            {renderContent()}

            <div className="mt-6 lg:mt-8 flex items-center justify-end space-x-4">
              <button className="px-4 lg:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 whitespace-nowrap">
                Cancelar
              </button>
              <button
                onClick={() => alert('Configuración guardada exitosamente')}
                className="px-4 lg:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </div>

      {showNewUserModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h3>

          <button
            onClick={() => {
              setShowNewUserModal(false);
              setEditingUser(null);
            }}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Completo
          </label>
          <input
            type="text"
            value={newUserForm.name}
            onChange={(e) =>
              setNewUserForm({ ...newUserForm, name: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ingresa el nombre completo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Usuario
          </label>
          <input
            type="text"
            value={newUserForm.username}
            onChange={(e) =>
              setNewUserForm({ ...newUserForm, username: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ingresa el nombre de usuario"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={newUserForm.email}
            onChange={(e) =>
              setNewUserForm({ ...newUserForm, email: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ingresa el email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rol
          </label>
          <select
            value={newUserForm.role}
            onChange={(e) =>
              setNewUserForm({ ...newUserForm, role: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
          >
            <option value="Operador">Operador</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Administrador">Administrador</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contraseña
          </label>
          <input
            type="password"
            value={newUserForm.password}
            onChange={(e) =>
              setNewUserForm({ ...newUserForm, password: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ingresa la contraseña"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirmar Contraseña
          </label>
          <input
            type="password"
            value={newUserForm.confirmPassword}
            onChange={(e) =>
              setNewUserForm({
                ...newUserForm,
                confirmPassword: e.target.value
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Confirma la contraseña"
          />
        </div>
      </div>

      <div className="p-6 border-t border-gray-100 flex items-center justify-end space-x-3">
        <button
          onClick={() => {
            setShowNewUserModal(false);
            setEditingUser(null);
          }}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 whitespace-nowrap"
        >
          Cancelar
        </button>
        <button
          onClick={handleCreateUser}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
        >
          {editingUser ? 'Guardar cambios' : 'Crear Usuario'}
        </button>
      </div>
    </div>
  </div>
)}


      {showNewAlmacenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingAlmacen ? 'Editar Almacén' : 'Nuevo Almacén'}
                </h3>
                <button
                  onClick={() => {
                    setShowNewAlmacenModal(false);
                    setEditingAlmacen(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Código del Almacén</label>
                <input
                  type="text"
                  value={newAlmacenForm.codigo}
                  onChange={(e) => setNewAlmacenForm({ ...newAlmacenForm, codigo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ALM-005"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Almacén</label>
                <input
                  type="text"
                  value={newAlmacenForm.nombre}
                  onChange={(e) => setNewAlmacenForm({ ...newAlmacenForm, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Almacén de Suministros"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                <input
                  type="text"
                  value={newAlmacenForm.ubicacion}
                  onChange={(e) => setNewAlmacenForm({ ...newAlmacenForm, ubicacion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Edificio Principal - Piso 2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Responsable</label>
                <input
                  type="text"
                  value={newAlmacenForm.responsable}
                  onChange={(e) => setNewAlmacenForm({ ...newAlmacenForm, responsable: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nombre del responsable"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacidad (m³)</label>
                <input
                  type="text"
                  value={newAlmacenForm.capacidad}
                  onChange={(e) => setNewAlmacenForm({ ...newAlmacenForm, capacidad: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1000"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowNewAlmacenModal(false);
                  setEditingAlmacen(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 whitespace-nowrap"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateAlmacen}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
              >
                {editingAlmacen ? 'Guardar cambios' : 'Crear Almacén'}
              </button>
            </div>

          </div>
        </div>
      )}

      {showNewCategoriaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
                </h3>

                <button
                  onClick={() => {
                    setShowNewCategoriaModal(false);
                    setEditingCategoria(null);
                  }}

                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Categoría</label>
                <input
                  type="text"
                  value={newCategoriaForm.nombre}
                  onChange={(e) => setNewCategoriaForm({ ...newCategoriaForm, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Instrumentos Quirúrgicos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  value={newCategoriaForm.descripcion}
                  onChange={(e) => setNewCategoriaForm({ ...newCategoriaForm, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descripción de la categoría"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icono</label>
                <select
                  value={newCategoriaForm.icono}
                  onChange={(e) => setNewCategoriaForm({ ...newCategoriaForm, icono: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
                >
                  <option value="ri-folder-line">📁 Carpeta</option>
                  <option value="ri-capsule-line">💊 Medicamento</option>
                  <option value="ri-heart-pulse-line">❤️ Médico</option>
                  <option value="ri-shield-line">🛡️ Protección</option>
                  <option value="ri-stethoscope-line">🩺 Estetoscopio</option>
                  <option value="ri-drop-line">💧 Líquido</option>
                  <option value="ri-scissors-line">✂️ Instrumentos</option>
                  <option value="ri-test-tube-line">🧪 Laboratorio</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowNewCategoriaModal(false);
                  setEditingCategoria(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 whitespace-nowrap"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCategoria}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
              >
                {editingCategoria ? 'Guardar cambios' : 'Crear Categoría'}
              </button>

            </div>
          </div>
        </div>
      )}

      {showNewProveedorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Nuevo Proveedor</h3>
                <button
                  onClick={() => setShowNewProveedorModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Proveedor</label>
                <input
                  type="text"
                  value={newProveedorForm.nombre}
                  onChange={(e) => setNewProveedorForm({ ...newProveedorForm, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Distribuidora Médica SAC"
                />
              </div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Razón Social</label>
  <input
    type="text"
    value={newProveedorForm.razonSocial}
    onChange={(e) =>
      setNewProveedorForm({
        ...newProveedorForm,
        razonSocial: e.target.value,
      })
    }
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    placeholder="Tecnoquímicas S.A."
  />
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">RUC</label>
  <input
    type="text"
    value={newProveedorForm.ruc}
    onChange={(e) =>
      setNewProveedorForm({
        ...newProveedorForm,
        ruc: e.target.value,
      })
    }
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    placeholder="20123456789"
  />
</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contacto Principal</label>
                <input
                  type="text"
                  value={newProveedorForm.contacto}
                  onChange={(e) => setNewProveedorForm({ ...newProveedorForm, contacto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ventas@distribuidora.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                <input
                  type="text"
                  value={newProveedorForm.telefono}
                  onChange={(e) => setNewProveedorForm({ ...newProveedorForm, telefono: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+51 1 234-5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email (Opcional)</label>
                <input
                  type="email"
                  value={newProveedorForm.email}
                  onChange={(e) => setNewProveedorForm({ ...newProveedorForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="contacto@proveedor.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dirección (Opcional)</label>
                <textarea
                  value={newProveedorForm.direccion}
                  onChange={(e) => setNewProveedorForm({ ...newProveedorForm, direccion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dirección completa del proveedor"
                  rows={2}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowNewProveedorModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 whitespace-nowrap"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateProveedor}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
              >
                Crear Proveedor
              </button>
            </div>
          </div>
        </div>
      )}

      {showAccessDenied && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2">
          <i className="ri-error-warning-line"></i>
          <span>{getAccessDeniedMessage()}</span>
        </div>
      )}
    </div>
  );
}
