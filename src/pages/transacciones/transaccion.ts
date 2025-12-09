// src/pages/transacciones/transaccion.ts

export interface Transaccion {
  id?: number;
  codigo: string;
  tipo: string;          // ENTRADA, SALIDA, etc.
  fecha: string;         // ISO string o 'YYYY-MM-DD'
  productoId?: number;
  almacenId?: number;
  cantidad: number;
  precioUnitario: number;
  total: number;
  responsable: string;
  observaciones: string;
  estado: string;        // COMPLETADA, PENDIENTE, CANCELADA

  // Opcionales para mostrar info relacionada
  productoNombre?: string;
  almacenNombre?: string;
}
