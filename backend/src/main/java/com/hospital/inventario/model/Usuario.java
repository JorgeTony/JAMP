    package com.hospital.inventario.model;

    import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;
    import jakarta.validation.constraints.*;
    import java.time.LocalDateTime;
    import java.util.Collection;
    import java.util.List;
    import org.springframework.security.core.GrantedAuthority;
    import org.springframework.security.core.authority.SimpleGrantedAuthority;
    import org.springframework.security.core.userdetails.UserDetails;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

    @Entity
    @Table(name = "usuarios")
    public class Usuario implements UserDetails {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @NotBlank(message = "El email es obligatorio")
        @Email(message = "El email debe tener un formato válido")
        @Column(unique = true, nullable = false)
        private String email;

        @Column(nullable = false, unique = true, length = 50)
        private String codigo;

        @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

        @NotBlank(message = "El nombre es obligatorio")
        @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
        @Column(nullable = false)
        private String nombre;

        @NotBlank(message = "Los apellidos son obligatorios")
        @Size(min = 2, max = 100, message = "Los apellidos deben tener entre 2 y 100 caracteres")
        private String apellidos;

        @NotBlank(message = "El rol es obligatorio")
    @Pattern(
        regexp = "^(ADMIN|SUPERVISOR|OPERADOR)$",
        message = "El rol debe ser ADMIN, SUPERVISOR u OPERADOR"
    )
    private String rol;

        @Pattern(regexp = "^(ACTIVO|INACTIVO)$", message = "El estado debe ser ACTIVO o INACTIVO")
        private String estado = "ACTIVO";

        @Size(max = 20, message = "El teléfono no puede exceder 20 caracteres")
        private String telefono;

        @Size(max = 100, message = "El departamento no puede exceder 100 caracteres")
        private String departamento;

        @Column(name = "fecha_creacion")
        private LocalDateTime fechaCreacion = LocalDateTime.now();

        @Column(name = "ultimo_acceso")
        private LocalDateTime ultimoAcceso;

        // ===== Constructores =====
        public Usuario() {}

        public Usuario(String email, String password, String nombre, String apellidos, String rol) {
            this.email = email;
            this.password = password;
            this.nombre = nombre;
            this.apellidos = apellidos;
            this.rol = rol;
            this.fechaCreacion = LocalDateTime.now();
        }

        // ===== UserDetails =====

        @Override
        @JsonIgnore
        public Collection<? extends GrantedAuthority> getAuthorities() {
            if (rol == null || rol.isBlank()) {
                return List.of();
            }
            return List.of(new SimpleGrantedAuthority("ROLE_" + rol.toUpperCase()));
        }

        @Override
        @JsonIgnore
        public String getUsername() {
            return email;
        }

   @Override
public String getPassword() {
    return password;
}



        @Override
        @JsonIgnore
        public boolean isAccountNonExpired() {
            return true;
        }

        @Override
        @JsonIgnore
        public boolean isAccountNonLocked() {
            return "ACTIVO".equals(estado);
        }

        @Override
        @JsonIgnore
        public boolean isCredentialsNonExpired() {
            return true;
        }

        @Override
        @JsonIgnore
        public boolean isEnabled() {
            return "ACTIVO".equals(estado);
        }

        // ===== Getters / setters “normales” =====

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public void setPassword(String password) { this.password = password; }

        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }

        public String getApellidos() { return apellidos; }
        public void setApellidos(String apellidos) { this.apellidos = apellidos; }

        public String getRol() { return rol; }
        public void setRol(String rol) { this.rol = rol; }

        public String getEstado() { return estado; }
        public void setEstado(String estado) { this.estado = estado; }

        public String getTelefono() { return telefono; }
        public void setTelefono(String telefono) { this.telefono = telefono; }

        public String getDepartamento() { return departamento; }
        public void setDepartamento(String departamento) { this.departamento = departamento; }

        public LocalDateTime getFechaCreacion() { return fechaCreacion; }
        public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

        public LocalDateTime getUltimoAcceso() { return ultimoAcceso; }
        public void setUltimoAcceso(LocalDateTime ultimoAcceso) { this.ultimoAcceso = ultimoAcceso; }

        public String getNombreCompleto() {
            return nombre + " " + apellidos;
        }

        public String getCodigo() {
            return codigo;
        }

        public void setCodigo(String codigo) {
            this.codigo = codigo;
        }
    }
