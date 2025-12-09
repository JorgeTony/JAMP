package com.hospital.inventario.memento;

import java.time.LocalDateTime;

/**
 * Patrón Memento - Memento para guardar el estado de un producto
 */
public class ProductoMemento {
    private final Long id;
    private final String codigo;
    private final String nombre;
    private final String descripcion;
    private final String categoria;
    private final Double precio;
    private final Integer stock;
    private final Integer stockMinimo;
    private final String estado;
    private final LocalDateTime fechaSnapshot;
    private final String accionRealizada;
    
    public ProductoMemento(Long id, String codigo, String nombre, String descripcion, 
                          String categoria, Double precio, Integer stock, Integer stockMinimo, 
                          String estado, String accionRealizada) {
        this.id = id;
        this.codigo = codigo;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.categoria = categoria;
        this.precio = precio;
        this.stock = stock;
        this.stockMinimo = stockMinimo;
        this.estado = estado;
        this.fechaSnapshot = LocalDateTime.now();
        this.accionRealizada = accionRealizada;
    }
    
    // Getters
    public Long getId() { return id; }
    public String getCodigo() { return codigo; }
    public String getNombre() { return nombre; }
    public String getDescripcion() { return descripcion; }
    public String getCategoria() { return categoria; }
    public Double getPrecio() { return precio; }
    public Integer getStock() { return stock; }
    public Integer getStockMinimo() { return stockMinimo; }
    public String getEstado() { return estado; }
    public LocalDateTime getFechaSnapshot() { return fechaSnapshot; }
    public String getAccionRealizada() { return accionRealizada; }
    
    @Override
    public String toString() {
        return "ProductoMemento{" +
                "id=" + id +
                ", codigo='" + codigo + '\'' +
                ", nombre='" + nombre + '\'' +
                ", precio=" + precio +
                ", stock=" + stock +
                ", estado='" + estado + '\'' +
                ", fechaSnapshot=" + fechaSnapshot +
                ", accionRealizada='" + accionRealizada + '\'' +
                '}';
    }
}