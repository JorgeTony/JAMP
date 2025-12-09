package com.hospital.inventario.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "proveedores")
public class Proveedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El código del proveedor es obligatorio")
    @Size(max = 50, message = "El código no puede exceder 50 caracteres")
    @Column(nullable = false, unique = true, length = 50)
    private String codigo;

    @NotBlank(message = "El nombre del proveedor es obligatorio")
    @Size(max = 255, message = "El nombre no puede exceder 255 caracteres")
    private String nombre;

    @Size(max = 255, message = "La razón social no puede exceder 255 caracteres")
    @Column(name = "razon_social")
    private String razonSocial;

    @Size(max = 20, message = "El RUC no puede exceder 20 caracteres")
    private String ruc;

    @Size(max = 255, message = "El contacto no puede exceder 255 caracteres")
    private String contacto;

    @Size(max = 255, message = "El teléfono no puede exceder 255 caracteres")
    private String telefono;

    @Size(max = 255, message = "El email no puede exceder 255 caracteres")
    private String email;

    @Size(max = 255, message = "La dirección no puede exceder 255 caracteres")
    private String direccion;

    @Pattern(regexp = "^(ACTIVO|INACTIVO)$", message = "El estado debe ser ACTIVO o INACTIVO")
    @Column(length = 20)
    private String estado = "ACTIVO";

    // ====== Getters / Setters ======

    public Long getId() { 
        return id; 
    }
    public void setId(Long id) { 
        this.id = id; 
    }

    public String getCodigo() { 
        return codigo; 
    }
    public void setCodigo(String codigo) { 
        this.codigo = codigo; 
    }

    public String getNombre() { 
        return nombre; 
    }
    public void setNombre(String nombre) { 
        this.nombre = nombre; 
    }

    public String getRazonSocial() { 
        return razonSocial; 
    }
    public void setRazonSocial(String razonSocial) { 
        this.razonSocial = razonSocial; 
    }

    public String getRuc() { 
        return ruc; 
    }
    public void setRuc(String ruc) { 
        this.ruc = ruc; 
    }

    public String getContacto() { 
        return contacto; 
    }
    public void setContacto(String contacto) { 
        this.contacto = contacto; 
    }

    public String getTelefono() { 
        return telefono; 
    }
    public void setTelefono(String telefono) { 
        this.telefono = telefono; 
    }

    public String getEmail() { 
        return email; 
    }
    public void setEmail(String email) { 
        this.email = email; 
    }

    public String getDireccion() { 
        return direccion; 
    }
    public void setDireccion(String direccion) { 
        this.direccion = direccion; 
    }

    public String getEstado() { 
        return estado; 
    }
    public void setEstado(String estado) { 
        this.estado = estado; 
    }
}
