package com.hospital.inventario.state;

import com.hospital.inventario.model.Producto;

/**
 * Patrón State - Estado concreto: Producto Descontinuado
 */
public class ProductoDescontinuado implements EstadoProducto {
    
    @Override
    public void activar(Producto producto) {
        System.out.println("No se puede activar un producto descontinuado directamente. Use reactivar()");
    }
    
    @Override
    public void desactivar(Producto producto) {
        System.out.println("El producto ya está descontinuado");
    }
    
    @Override
    public void descontinuar(Producto producto) {
        // Ya está descontinuado, no hacer nada
        System.out.println("El producto ya está descontinuado");
    }
    
    @Override
    public void reactivar(Producto producto) {
        producto.setEstado("ACTIVO");
        producto.setEstadoProducto(new ProductoActivo());
        System.out.println("Producto reactivado desde descontinuado");
    }
    
    @Override
    public String getDescripcionEstado() {
        return "Producto descontinuado permanentemente, no disponible";
    }
    
    @Override
    public boolean puedeVenderse() {
        return false;
    }
    
    @Override
    public boolean puedeModificarse() {
        return false;
    }
}