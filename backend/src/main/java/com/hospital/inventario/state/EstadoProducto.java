package com.hospital.inventario.state;

import com.hospital.inventario.model.Producto;

/**
 * Patrón State - Interface para los diferentes estados de un producto
 */
public interface EstadoProducto {
    void activar(Producto producto);
    void desactivar(Producto producto);
    void descontinuar(Producto producto);
    void reactivar(Producto producto);
    String getDescripcionEstado();
    boolean puedeVenderse();
    boolean puedeModificarse();
}