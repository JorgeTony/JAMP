
package com.hospital.inventario.model;

import com.hospital.inventario.state.EstadoProducto;
import com.hospital.inventario.state.ProductoActivo;
import com.hospital.inventario.state.ProductoInactivo;
import com.hospital.inventario.state.ProductoDescontinuado;
import com.hospital.inventario.memento.ProductoMemento;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@Table(name = "productos")
public class Producto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "El código es obligatorio")
    @Size(max = 20, message = "El código no puede exceder 20 caracteres")
    @Column(unique = true, nullable = false)
    private String codigo;
    
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    @Column(nullable = false)
    private String nombre;
    
    @Size(max = 500, message = "La descripción no puede exceder 500 caracteres")
    private String descripcion;
    
    @NotBlank(message = "La categoría es obligatoria")
    @Size(max = 50, message = "La categoría no puede exceder 50 caracteres")
    @Column(nullable = false)
    private String categoria;
    
    @Size(max = 100, message = "El proveedor no puede exceder 100 caracteres")
    @Column(name = "proveedor")
    private String proveedor;
    
    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;
    
    // + getters y setters
    public LocalDate getFechaVencimiento() {
    return fechaVencimiento;
}

public void setFechaVencimiento(LocalDate fechaVencimiento) {
    this.fechaVencimiento = fechaVencimiento;
}

    public String getProveedor() { return proveedor; }
    public void setProveedor(String proveedor) { this.proveedor = proveedor; }
    
    @Size(max = 255, message = "La ubicación no puede exceder 255 caracteres")
    @Column(name = "ubicacion")
    private String ubicacion;

    public String getUbicacion() { 
        return ubicacion; 
    }

    public void setUbicacion(String ubicacion) { 
        this.ubicacion = ubicacion; 
    }
    

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.0", inclusive = false, message = "El precio debe ser mayor a 0")
    @Column(nullable = false)
    private Double precio;
    
    @NotNull(message = "El stock es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    @Column(nullable = false)
    private Integer stock;
    
    @NotNull(message = "El stock mínimo es obligatorio")
    @Min(value = 0, message = "El stock mínimo no puede ser negativo")
    @Column(name = "stock_minimo", nullable = false)
    private Integer stockMinimo;
    
    @NotBlank(message = "El estado es obligatorio")
    @Pattern(regexp = "ACTIVO|INACTIVO|DESCONTINUADO", message = "El estado debe ser ACTIVO, INACTIVO o DESCONTINUADO")
    @Column(nullable = false)
    private String estado = "ACTIVO";
    
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    // Patrón State - Campo transient para el estado del producto
    @Transient
    @JsonIgnore
    private EstadoProducto estadoProducto;
    
    // Constructores
    public Producto() {
        this.fechaCreacion = LocalDateTime.now();
        this.fechaActualizacion = LocalDateTime.now();
        initializeEstadoProducto();
    }
    
    public Producto(String codigo, String nombre, String descripcion, String categoria, 
                   Double precio, Integer stock, Integer stockMinimo) {
        this();
        this.codigo = codigo;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.categoria = categoria;
        this.precio = precio;
        this.stock = stock;
        this.stockMinimo = stockMinimo;
    }
    
    // Métodos del ciclo de vida JPA
    @PrePersist
    public void prePersist() {
        this.fechaCreacion = LocalDateTime.now();
        this.fechaActualizacion = LocalDateTime.now();
        initializeEstadoProducto();
    }
    
    @PreUpdate
    public void preUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
        initializeEstadoProducto();
    }
    
    @PostLoad
    public void postLoad() {
        initializeEstadoProducto();
    }
    
    // Inicializar el estado del producto según el valor del campo estado
    private void initializeEstadoProducto() {
        if (this.estado == null) {
            this.estado = "ACTIVO";
        }
        
        switch (this.estado) {
            case "ACTIVO":
                this.estadoProducto = new ProductoActivo();
                break;
            case "INACTIVO":
                this.estadoProducto = new ProductoInactivo();
                break;
            case "DESCONTINUADO":
                this.estadoProducto = new ProductoDescontinuado();
                break;
            default:
                this.estadoProducto = new ProductoActivo();
                this.estado = "ACTIVO";
        }
    }
    
    // Métodos del patrón State
    public void activar() {
        if (estadoProducto != null) {
            estadoProducto.activar(this);
        }
    }
    
    public void desactivar() {
        if (estadoProducto != null) {
            estadoProducto.desactivar(this);
        }
    }
    
    public void descontinuar() {
        if (estadoProducto != null) {
            estadoProducto.descontinuar(this);
        }
    }
    
    public void reactivar() {
        if (estadoProducto != null) {
            estadoProducto.reactivar(this);
        }
    }
    
    public String getDescripcionEstado() {
        return estadoProducto != null ? estadoProducto.getDescripcionEstado() : "Estado no definido";
    }
    
    public boolean puedeVenderse() {
        return estadoProducto != null ? estadoProducto.puedeVenderse() : false;
    }
    
    public boolean puedeModificarse() {
        return estadoProducto != null ? estadoProducto.puedeModificarse() : false;
    }
    
    // Método del patrón Memento
    public ProductoMemento crearMemento(String accionRealizada) {
        return new ProductoMemento(
            this.id,
            this.codigo,
            this.nombre,
            this.descripcion,
            this.categoria,
            this.precio,
            this.stock,
            this.stockMinimo,
            this.estado,
            accionRealizada
        );
    }
    
    // Método para restaurar desde memento
    public void restaurarDesdeMemento(ProductoMemento memento) {
        this.codigo = memento.getCodigo();
        this.nombre = memento.getNombre();
        this.descripcion = memento.getDescripcion();
        this.categoria = memento.getCategoria();
        this.precio = memento.getPrecio();
        this.stock = memento.getStock();
        this.stockMinimo = memento.getStockMinimo();
        this.estado = memento.getEstado();
        this.fechaActualizacion = LocalDateTime.now();
        initializeEstadoProducto();
    }
    
    // Métodos de utilidad
    public boolean tieneStockBajo() {
        return this.stock <= this.stockMinimo;
    }
    
    public Double getValorTotalStock() {
        return this.precio * this.stock;
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
    
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    
    public Double getPrecio() { return precio; }
    public void setPrecio(Double precio) { this.precio = precio; }
    
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    
    public Integer getStockMinimo() { return stockMinimo; }
    public void setStockMinimo(Integer stockMinimo) { this.stockMinimo = stockMinimo; }
    
    public String getEstado() { return estado; }
    public void setEstado(String estado) { 
        this.estado = estado;
        initializeEstadoProducto();
    }
    
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    
    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }
    
    public EstadoProducto getEstadoProducto() { return estadoProducto; }
    public void setEstadoProducto(EstadoProducto estadoProducto) { this.estadoProducto = estadoProducto; }
    
    @Override
    public String toString() {
        return "Producto{" +
                "id=" + id +
                ", codigo='" + codigo + '\'' +
                ", nombre='" + nombre + '\'' +
                ", categoria='" + categoria + '\'' +
                ", precio=" + precio +
                ", stock=" + stock +
                ", estado='" + estado + '\'' +
                '}';
    }
}
