package com.hospital.inventario.decorator;

import com.hospital.inventario.model.Producto;

/**
 * Patrón Decorator - Decorador concreto que añade alertas al producto
 */
public class ProductoConAlerta extends ProductoDecorator {
    private String tipoAlerta;
    private String mensajeAlerta;
    
    public ProductoConAlerta(Producto producto, String tipoAlerta, String mensajeAlerta) {
        super(producto);
        this.tipoAlerta = tipoAlerta;
        this.mensajeAlerta = mensajeAlerta;
    }
    
    @Override
    public String getDescripcionCompleta() {
        return producto.getDescripcion() + " - ALERTA: " + tipoAlerta + " - " + mensajeAlerta;
    }
    
    @Override
    public Double getPrecioConDescuentos() {
        return producto.getPrecio();
    }
    
    @Override
    public String getEstadoDetallado() {
        return producto.getEstado() + " - " + tipoAlerta.toUpperCase();
    }
    
    public String getTipoAlerta() { return tipoAlerta; }
    public String getMensajeAlerta() { return mensajeAlerta; }
}