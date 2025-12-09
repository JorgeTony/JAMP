
// Sistema de permisos por roles
export interface UserRole {
  name: string;
  permissions: string[];
}

export const ROLES: Record<string, UserRole> = {
  'Administrador': {
    name: 'Administrador',
    permissions: [
      'dashboard.view',
      'productos.view',
      'productos.create',
      'productos.edit',
      'productos.delete',
      'inventario.view',
      'inventario.create',
      'inventario.edit',
      'inventario.delete',
      'transacciones.view',
      'transacciones.create',
      'transacciones.edit',
      'transacciones.delete',
      'kardex.view',
      'kardex.create',
      'kardex.edit',
      'kardex.delete',
      'almacenes.view',
      'almacenes.create',
      'almacenes.edit',
      'almacenes.delete',
      'catalogo.view',
      'catalogo.create',
      'catalogo.edit',
      'catalogo.delete',
      'linea-producto.view',
      'linea-producto.create',
      'linea-producto.edit',
      'linea-producto.delete',
      'reportes.view',
      'reportes.create',
      'reportes.edit',
      'reportes.delete',
      'configuracion.view',
      'configuracion.edit',
      'configuracion.create',
      'configuracion.delete',
      'usuarios.view',
      'usuarios.create',
      'usuarios.edit',
      'usuarios.delete',
      'requerimientos.view',
      'requerimientos.create',
      'requerimientos.edit',
      'requerimientos.delete',
      'ordenes-compra.view',
      'ordenes-compra.create',
      'ordenes-compra.edit',
      'ordenes-compra.delete',
      // Permisos específicos para todas las funcionalidades
      'almacenes.nuevo',
      'categorias.nueva',
      'proveedores.nuevo',
      'productos.duplicar',
      'productos.historial',
      'notificaciones.view',
      'notificaciones.edit',
      'sistema.configuracion',
      'sistema.backup',
      'sistema.restore',
      'sistema.logs'
    ]
  },
  'Supervisor': {
    name: 'Supervisor',
    permissions: [
      'dashboard.view',
      'productos.view',
      'productos.create',
      'productos.edit',
      'usuarios.view',
'usuarios.edit',

      'productos.delete',
      'inventario.view',
      'inventario.create',
      'inventario.edit',
      'transacciones.view',
      'transacciones.create',
      'transacciones.edit',
      'kardex.view',
      'almacenes.view',
      'almacenes.create',
      'almacenes.edit',
      'catalogo.view',
      'catalogo.create',
      'catalogo.edit',
      'linea-producto.view',
      'linea-producto.create',
      'linea-producto.edit',
      'reportes.view',
      'configuracion.view',
      'configuracion.edit',
      'requerimientos.view',
      'requerimientos.create',
      'requerimientos.edit',
      'ordenes-compra.view',
      'ordenes-compra.create',
      'ordenes-compra.edit',
      // Permisos específicos (sin gestión de usuarios)
      'almacenes.nuevo',
      'categorias.nueva',
      'proveedores.nuevo',
      'productos.duplicar',
      'productos.historial',
      'notificaciones.view'
      // NO tiene permisos de usuarios ni configuración del sistema
    ]
  },
  'Operador': {
    name: 'Operador',
    permissions: [
      'dashboard.view',
      'transacciones.view',
      'transacciones.create',
      'kardex.view',
      'inventario.view',
      'productos.view',
      'notificaciones.view'
      // Solo puede registrar movimientos de productos y ver información básica
    ]
  }
};

export const checkPermission = (userRole: string, permission: string): boolean => {
  const role = ROLES[userRole];
  if (!role) return false;
  
  // El administrador tiene acceso a TODO
  if (userRole === 'Administrador') {
    return true;
  }
  
  return role.permissions.includes(permission);
};

export const hasAccess = (userRole: string, module: string, action: string = 'view'): boolean => {
  // El administrador tiene acceso completo a todo
  if (userRole === 'Administrador') {
    return true;
  }
  
  const permission = `${module}.${action}`;
  return checkPermission(userRole, permission);
};

export const getAccessDeniedMessage = (): string => {
  return "No tienes acceso para esta función";
};
