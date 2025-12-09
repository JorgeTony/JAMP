package com.hospital.inventario.controller;

import com.hospital.inventario.model.Usuario;
import com.hospital.inventario.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

  @GetMapping("/api")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'OPERADOR')")
public ResponseEntity<?> getAllUsuarios() {
    try {
        List<Usuario> usuarios = usuarioService.findAll();
        return ResponseEntity.ok(usuarios);
    } catch (Exception e) {
        e.printStackTrace(); // para que veas el error exacto en la consola
        return ResponseEntity.internalServerError()
                .body(Map.of("error", "Error al cargar usuarios", "detalle", e.getMessage()));
    }
}



    @GetMapping("/api/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable Long id) {
        Optional<Usuario> usuarioOpt = usuarioService.findById(id);
        return usuarioOpt.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/api")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUsuario(@RequestBody Usuario usuario) {
        try {
            if (usuarioService.existsByEmail(usuario.getEmail())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Ya existe un usuario con este email"));
            }

            if (usuario.getEstado() == null || usuario.getEstado().isBlank()) {
                usuario.setEstado("ACTIVO");
            }

            Usuario nuevoUsuario = usuarioService.save(usuario);

            return ResponseEntity.ok(
                    Map.of(
                            "message", "Usuario creado exitosamente",
                            "usuario", nuevoUsuario
                    )
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error al crear usuario: " + e.getMessage()));
        }
    }

    @PutMapping("/api/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<?> updateUsuario(@PathVariable Long id, @RequestBody Usuario usuario) {
        try {
            Optional<Usuario> existenteOpt = usuarioService.findById(id);
            if (existenteOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Usuario existente = existenteOpt.get();

            existente.setNombre(usuario.getNombre());
            existente.setApellidos(usuario.getApellidos());
            existente.setEmail(usuario.getEmail());
            existente.setRol(usuario.getRol());
            existente.setEstado(usuario.getEstado());
            existente.setTelefono(usuario.getTelefono());
            existente.setDepartamento(usuario.getDepartamento());

            if (usuario.getPassword() != null && !usuario.getPassword().isBlank()) {
                existente.setPassword(usuario.getPassword());
            }

            Usuario actualizado = usuarioService.save(existente);

            return ResponseEntity.ok(
                    Map.of(
                            "message", "Usuario actualizado exitosamente",
                            "usuario", actualizado
                    )
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error al actualizar usuario: " + e.getMessage()));
        }
    }

    @DeleteMapping("/api/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUsuario(@PathVariable Long id) {
        try {
            if (usuarioService.findById(id).isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            usuarioService.desactivarUsuario(id);

            return ResponseEntity.ok(
                    Map.of("message", "Usuario desactivado exitosamente")
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error al eliminar usuario: " + e.getMessage()));
        }
    }

    @GetMapping("/api/activos")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<List<Usuario>> getUsuariosActivos() {
        List<Usuario> usuarios = usuarioService.findUsuariosActivos();
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/api/rol/{rol}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<List<Usuario>> getUsuariosPorRol(@PathVariable String rol) {
        List<Usuario> usuarios = usuarioService.findByRol(rol);
        return ResponseEntity.ok(usuarios);
    }
}
