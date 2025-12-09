package com.hospital.inventario.state;

import com.hospital.inventario.model.Producto;

/**
 * Patrón State - Estado concreto: Producto Inactivo
 */
public class ProductoInactivo implements EstadoProducto {
    
    @Override
    public void activar(Producto producto) {
        producto.setEstado("ACTIVO");
        producto.setEstadoProducto(new ProductoActivo());
        System.out.println("Producto activado");
    }
    
    @Override
    public void desactivar(Producto producto) {
        // Ya está inactivo, no hacer nada
        System.out.println("El producto ya está inactivo");
    }
    
    @Override
    public void descontinuar(Producto producto) {
        producto.setEstado("DESCONTINUADO");
        producto.setEstadoProducto(new ProductoDescontinuado());
        System.out.println("Producto descontinuado");
    }
    
    @Override
    public void reactivar(Producto producto) {
        producto.setEstado("ACTIVO");
        producto.setEstadoProducto(new ProductoActivo());
        System.out.println("Producto reactivado");
    }
    
    @Override
    public String getDescripcionEstado() {
        return "Producto temporalmente inactivo, no disponible para venta";
    }
    
    @Override
    public boolean puedeVenderse() {
        return false;
    }
    
    @Override
    public boolean puedeModificarse() {
        return true;
    }
}