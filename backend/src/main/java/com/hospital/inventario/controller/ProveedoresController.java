package com.hospital.inventario.controller;

import com.hospital.inventario.model.Proveedor;
import com.hospital.inventario.service.ProveedorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/proveedores")
@CrossOrigin(origins = "*")
public class ProveedoresController {

    @Autowired
    private ProveedorService proveedorService;

    // 1) Listar todos (GET /proveedores/api)
    @GetMapping("/api")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERVISOR', 'ROLE_OPERADOR')")
    public ResponseEntity<List<Proveedor>> getAll() {
        return ResponseEntity.ok(proveedorService.findAll());
    }

    // 2) Obtener por id
    @GetMapping("/api/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERVISOR', 'ROLE_OPERADOR')")
    public ResponseEntity<Proveedor> getById(@PathVariable Long id) {
        Optional<Proveedor> proveedor = proveedorService.findById(id);
        return proveedor.map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
    }

    // 3) Crear
    @PostMapping("/api")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERVISOR')")
    public ResponseEntity<?> create(@RequestBody Proveedor proveedor) {
        try {
            if (proveedor.getCodigo() == null || proveedor.getCodigo().isBlank()) {
                proveedor.setCodigo(proveedorService.generarNuevoCodigo());
            } else if (proveedorService.existsByCodigo(proveedor.getCodigo())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Ya existe un proveedor con este código"));
            }

            Proveedor nuevo = proveedorService.save(proveedor);
            return ResponseEntity.ok(Map.of(
                "message", "Proveedor creado exitosamente",
                "proveedor", nuevo
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error al crear proveedor: " + e.getMessage()));
        }
    }

    // 4) Actualizar
  @PutMapping("/api/{id}")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERVISOR')")
public ResponseEntity<?> updateProveedor(@PathVariable Long id, @RequestBody Proveedor request) {
    try {
        Optional<Proveedor> optProveedor = proveedorService.findById(id);
        if (optProveedor.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Proveedor proveedor = optProveedor.get();

        // ⚠️ IMPORTANTE: NO tocamos el código si no lo editas en el frontend
        // proveedor.setCodigo(proveedor.getCodigo());

        // Actualizamos SOLO los campos que vienen del formulario
        proveedor.setNombre(request.getNombre());
        proveedor.setContacto(request.getContacto());
        proveedor.setTelefono(request.getTelefono());

        // Solo si en tu formulario también manejas estos campos,
        // actualízalos aquí (si no, déjalos comentados / fuera):
        proveedor.setRazonSocial(request.getRazonSocial());
        proveedor.setRuc(request.getRuc());
        proveedor.setEmail(request.getEmail());
        proveedor.setDireccion(request.getDireccion());
        proveedor.setEstado(request.getEstado());

        Proveedor actualizado = proveedorService.save(proveedor);

        return ResponseEntity.ok(Map.of(
            "message", "Proveedor actualizado exitosamente",
            "proveedor", actualizado
        ));
    } catch (Exception e) {
        e.printStackTrace(); // para ver el error exacto en la consola
        return ResponseEntity.badRequest()
            .body(Map.of("error", "Error al actualizar proveedor: " + e.getMessage()));
    }
}



    // 5) Eliminar
    @DeleteMapping("/api/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERVISOR')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            if (proveedorService.findById(id).isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            proveedorService.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Proveedor eliminado exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error al eliminar proveedor: " + e.getMessage()));
        }
    }

    // 6) Búsqueda opcional
    @GetMapping("/api/buscar")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERVISOR', 'ROLE_OPERADOR')")
    public ResponseEntity<List<Proveedor>> buscar(@RequestParam String termino) {
        return ResponseEntity.ok(proveedorService.buscar(termino));
    }
}
