package com.hospital.inventario.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "almacenes")
public class Almacen {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "El código del almacén es obligatorio")
    @Size(min = 3, max = 50, message = "El código debe tener entre 3 y 50 caracteres")
    @Pattern(regexp = "^[A-Z0-9]+$", message = "El código solo puede contener letras mayúsculas y números")
    @Column(unique = true, nullable = false, length = 50)
    private String codigo;
    
    @NotBlank(message = "El nombre del almacén es obligatorio")
    @Size(min = 2, max = 255, message = "El nombre debe tener entre 2 y 255 caracteres")
    @Column(nullable = false)
    private String nombre;
    
    @Size(max = 500, message = "La ubicación no puede exceder 500 caracteres")
    private String ubicacion;
    
    @NotBlank(message = "El responsable es obligatorio")
    @Size(min = 2, max = 255, message = "El responsable debe tener entre 2 y 255 caracteres")
    private String responsable;
    
    @Size(max = 100, message = "La capacidad no puede exceder 100 caracteres")
    private String capacidad;
    
    @Size(max = 100, message = "La ocupación no puede exceder 100 caracteres")
    private String ocupacion;
    
    @Min(value = 0, message = "El porcentaje de ocupación no puede ser negativo")
    @Max(value = 100, message = "El porcentaje de ocupación no puede exceder 100%")
    @Column(name = "porcentaje_ocupacion")
    private Integer porcentajeOcupacion;
    
    @Pattern(regexp = "^(ACTIVO|MANTENIMIENTO|INACTIVO)$", message = "El estado debe ser ACTIVO, MANTENIMIENTO o INACTIVO")
    private String estado = "ACTIVO";
    
    @Min(value = 0, message = "El número de productos no puede ser negativo")
    @Max(value = 999999, message = "El número de productos no puede exceder 999,999")
    private Integer productos = 0;
    
    @PastOrPresent(message = "La fecha de última actualización no puede ser futura")
    @Column(name = "ultima_actualizacion")
    private LocalDateTime ultimaActualizacion = LocalDateTime.now();
    
    // Constructores
    public Almacen() {}
    
    public Almacen(String codigo, String nombre, String ubicacion, String responsable) {
        this.codigo = codigo;
        this.nombre = nombre;
        this.ubicacion = ubicacion;
        this.responsable = responsable;
        this.ultimaActualizacion = LocalDateTime.now();
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public String getUbicacion() { return ubicacion; }
    public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }
    
    public String getResponsable() { return responsable; }
    public void setResponsable(String responsable) { this.responsable = responsable; }
    
    public String getCapacidad() { return capacidad; }
    public void setCapacidad(String capacidad) { this.capacidad = capacidad; }
    
    public String getOcupacion() { return ocupacion; }
    public void setOcupacion(String ocupacion) { this.ocupacion = ocupacion; }
    
    public Integer getPorcentajeOcupacion() { return porcentajeOcupacion; }
    public void setPorcentajeOcupacion(Integer porcentajeOcupacion) { this.porcentajeOcupacion = porcentajeOcupacion; }
    
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    
    public Integer getProductos() { return productos; }
    public void setProductos(Integer productos) { this.productos = productos; }
    
    public LocalDateTime getUltimaActualizacion() { return ultimaActualizacion; }
    public void setUltimaActualizacion(LocalDateTime ultimaActualizacion) { this.ultimaActualizacion = ultimaActualizacion; }
    
    @PreUpdate
    public void preUpdate() {
        this.ultimaActualizacion = LocalDateTime.now();
    }
}
