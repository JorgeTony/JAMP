package com.hospital.inventario.decorator;

import com.hospital.inventario.model.Producto;
import java.time.LocalDateTime;

/**
 * Patrón Decorator - Decorador base para productos
 * Permite añadir funcionalidades adicionales a los productos sin modificar la clase original
 */
public abstract class ProductoDecorator {
    protected Producto producto;
    
    public ProductoDecorator(Producto producto) {
        this.producto = producto;
    }
    
    public abstract String getDescripcionCompleta();
    public abstract Double getPrecioConDescuentos();
    public abstract String getEstadoDetallado();
    
    // Métodos delegados al producto original
    public Long getId() { return producto.getId(); }
    public String getCodigo() { return producto.getCodigo(); }
    public String getNombre() { return producto.getNombre(); }
    public String getDescripcion() { return producto.getDescripcion(); }
    public String getCategoria() { return producto.getCategoria(); }
    public Double getPrecio() { return producto.getPrecio(); }
    public Integer getStock() { return producto.getStock(); }
    public Integer getStockMinimo() { return producto.getStockMinimo(); }
    public String getEstado() { return producto.getEstado(); }
    public LocalDateTime getFechaCreacion() { return producto.getFechaCreacion(); }
    public LocalDateTime getFechaActualizacion() { return producto.getFechaActualizacion(); }
}