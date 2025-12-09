package com.hospital.inventario.decorator;

import com.hospital.inventario.model.Producto;

/**
 * Patrón Decorator - Decorador concreto que añade funcionalidad de descuento
 */
public class ProductoConDescuento extends ProductoDecorator {
    private Double porcentajeDescuento;
    private String motivoDescuento;
    
    public ProductoConDescuento(Producto producto, Double porcentajeDescuento, String motivoDescuento) {
        super(producto);
        this.porcentajeDescuento = porcentajeDescuento;
        this.motivoDescuento = motivoDescuento;
    }
    
    @Override
    public String getDescripcionCompleta() {
        return producto.getDescripcion() + " - DESCUENTO: " + porcentajeDescuento + "% (" + motivoDescuento + ")";
    }
    
    @Override
    public Double getPrecioConDescuentos() {
        return producto.getPrecio() * (1 - porcentajeDescuento / 100);
    }
    
    @Override
    public String getEstadoDetallado() {
        return producto.getEstado() + " - CON DESCUENTO";
    }
    
    public Double getPorcentajeDescuento() { return porcentajeDescuento; }
    public String getMotivoDescuento() { return motivoDescuento; }
}