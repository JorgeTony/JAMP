
package com.hospital.inventario.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lineas_producto")
public class LineaProducto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String codigo;
    
    @Column(nullable = false)
    private String nombre;
    
    private String descripcion;
    private String familia;
    private String categoria;
    private Integer productos;
    
    @Enumerated(EnumType.STRING)
    private EstadoLinea estado;
    
    private LocalDateTime fechaCreacion;
    
    // Constructores
    public LineaProducto() {
        this.fechaCreacion = LocalDateTime.now();
        this.estado = EstadoLinea.ACTIVA;
    }
    
    public LineaProducto(String codigo, String nombre, String familia, String categoria) {
        this();
        this.codigo = codigo;
        this.nombre = nombre;
        this.familia = familia;
        this.categoria = categoria;
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    
    public String getFamilia() { return familia; }
    public void setFamilia(String familia) { this.familia = familia; }
    
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    
    public Integer getProductos() { return productos; }
    public void setProductos(Integer productos) { this.productos = productos; }
    
    public EstadoLinea getEstado() { return estado; }
    public void setEstado(EstadoLinea estado) { this.estado = estado; }
    
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    
    public enum EstadoLinea {
        ACTIVA, INACTIVA
    }
}
