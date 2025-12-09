package com.hospital.inventario.controller;

import com.hospital.inventario.model.Almacen;
import com.hospital.inventario.service.AlmacenService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/almacenes/api")
@CrossOrigin(
        origins = "http://localhost:3000",
        allowCredentials = "true"
)
public class AlmacenesController {

    private final AlmacenService almacenService;

    public AlmacenesController(AlmacenService almacenService) {
        this.almacenService = almacenService;
    }

    // ========== LISTAR TODOS ==========
    @GetMapping
    public ResponseEntity<?> getAllAlmacenes() {
        try {
            List<Almacen> almacenes = almacenService.findAll();
            return ResponseEntity.ok(almacenes);
        } catch (Exception e) {
            e.printStackTrace(); // <-- mira la consola de Spring
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Error al obtener almacenes",
                            "detalles", e.getMessage()
                    ));
        }
    }

    // ========== OBTENER POR ID ==========
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERVISOR', 'ROLE_OPERADOR')")
    public ResponseEntity<?> getAlmacenById(@PathVariable Long id) {
        try {
            Optional<Almacen> almacen = almacenService.findById(id);
            return almacen.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener almacén", "detalles", e.getMessage()));
        }
    }

    // ========== CREAR ==========
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERVISOR')")
    public ResponseEntity<?> createAlmacen(@RequestBody Almacen almacen) {
        try {
            if (almacenService.existsByCodigo(almacen.getCodigo())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Ya existe un almacén con este código"));
            }

            // Valores por defecto por si vienen nulos
            if (almacen.getEstado() == null || almacen.getEstado().isBlank()) {
                almacen.setEstado("ACTIVO");
            }
            if (almacen.getProductos() == null) {
                almacen.setProductos(0);
            }
            if (almacen.getPorcentajeOcupacion() == null) {
                almacen.setPorcentajeOcupacion(0);
            }
            if (almacen.getOcupacion() == null) {
                almacen.setOcupacion("0 m³");
            }

            Almacen nuevoAlmacen = almacenService.save(almacen);
            return ResponseEntity.ok(Map.of(
                    "message", "Almacén creado exitosamente",
                    "almacen", nuevoAlmacen
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error al crear almacén: " + e.getMessage()));
        }
    }

    // ========== ACTUALIZAR ==========
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERVISOR')")
    public ResponseEntity<?> updateAlmacen(@PathVariable Long id, @RequestBody Almacen almacen) {
        try {
            Optional<Almacen> almacenExistente = almacenService.findById(id);
            if (almacenExistente.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            if (almacenService.existsByCodigoAndIdNot(almacen.getCodigo(), id)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Ya existe otro almacén con este código"));
            }

            almacen.setId(id);
            Almacen almacenActualizado = almacenService.save(almacen);
            return ResponseEntity.ok(Map.of(
                    "message", "Almacén actualizado exitosamente",
                    "almacen", almacenActualizado
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error al actualizar almacén: " + e.getMessage()));
        }
    }

    // ========== ELIMINAR ==========
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERVISOR')")
    public ResponseEntity<?> deleteAlmacen(@PathVariable Long id) {
        try {
            if (almacenService.findById(id).isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            almacenService.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Almacén eliminado exitosamente"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error al eliminar almacén: " + e.getMessage()));
        }
    }

    // ========== RESTO DE ENDPOINTS (opcionales) ==========
    @GetMapping("/buscar")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERVISOR', 'ROLE_OPERADOR')")
    public ResponseEntity<?> buscarAlmacenes(@RequestParam String termino) {
        try {
            return ResponseEntity.ok(almacenService.buscarAlmacenes(termino));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al buscar almacenes", "detalles", e.getMessage()));
        }
    }

    @GetMapping("/activos")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERVISOR', 'ROLE_OPERADOR')")
    public ResponseEntity<?> getAlmacenesActivos() {
        try {
            return ResponseEntity.ok(almacenService.findAlmacenesActivos());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener almacenes activos", "detalles", e.getMessage()));
        }
    }
}
