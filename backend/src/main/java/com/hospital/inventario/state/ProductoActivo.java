package com.hospital.inventario.state;

import com.hospital.inventario.model.Producto;

/**
 * Patrón State - Estado concreto: Producto Activo
 */
public class ProductoActivo implements EstadoProducto {
    
    @Override
    public void activar(Producto producto) {
        // Ya está activo, no hacer nada
        System.out.println("El producto ya está activo");
    }
    
    @Override
    public void desactivar(Producto producto) {
        producto.setEstado("INACTIVO");
        producto.setEstadoProducto(new ProductoInactivo());
        System.out.println("Producto desactivado");
    }
    
    @Override
    public void descontinuar(Producto producto) {
        producto.setEstado("DESCONTINUADO");
        producto.setEstadoProducto(new ProductoDescontinuado());
        System.out.println("Producto descontinuado");
    }
    
    @Override
    public void reactivar(Producto producto) {
        // Ya está activo, no hacer nada
        System.out.println("El producto ya está activo");
    }
    
    @Override
    public String getDescripcionEstado() {
        return "Producto disponible para venta y modificación";
    }
    
    @Override
    public boolean puedeVenderse() {
        return true;
    }
    
    @Override
    public boolean puedeModificarse() {
        return true;
    }
}