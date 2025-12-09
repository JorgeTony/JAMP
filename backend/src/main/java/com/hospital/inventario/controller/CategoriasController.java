package com.hospital.inventario.controller;

import com.hospital.inventario.model.Categoria;
import com.hospital.inventario.service.CategoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/categorias")
@CrossOrigin(origins = "*")
public class CategoriasController {

    @Autowired
    private CategoriaService categoriaService;

    // LISTAR TODAS
    @GetMapping("/api")
    public ResponseEntity<List<Categoria>> getAll() {
        List<Categoria> categorias = categoriaService.findAll();
        return ResponseEntity.ok(categorias);
    }

    // OBTENER POR ID
    @GetMapping("/api/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERVISOR', 'ROLE_OPERADOR')")
    public ResponseEntity<Categoria> getById(@PathVariable Long id) {
        Optional<Categoria> categoria = categoriaService.findById(id);
        return categoria.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // CREAR
    @PostMapping("/api")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERVISOR')")
    public ResponseEntity<?> create(@RequestBody Categoria categoria) {
        try {
            if (categoriaService.existsByNombre(categoria.getNombre())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Ya existe una categoría con este nombre"));
            }

            if (categoria.getEstado() == null || categoria.getEstado().isBlank()) {
                categoria.setEstado("ACTIVO");
            }
            if (categoria.getProductos() == null) {
                categoria.setProductos(0);
            }

            Categoria nueva = categoriaService.save(categoria);
            return ResponseEntity.ok(Map.of(
                    "message", "Categoría creada exitosamente",
                    "categoria", nueva
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error al crear categoría: " + e.getMessage()));
        }
    }

    // ACTUALIZAR
    @PutMapping("/api/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERVISOR')")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Categoria categoria) {
        try {
            Optional<Categoria> existenteOpt = categoriaService.findById(id);
            if (existenteOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            if (categoriaService.existsByNombreAndIdNot(categoria.getNombre(), id)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Ya existe otra categoría con este nombre"));
            }

            Categoria existente = existenteOpt.get();
            existente.setNombre(categoria.getNombre());
            existente.setDescripcion(categoria.getDescripcion());
            existente.setIcono(categoria.getIcono());
            existente.setEstado(
                    categoria.getEstado() == null || categoria.getEstado().isBlank()
                            ? existente.getEstado()
                            : categoria.getEstado()
            );
            // productos normalmente se debería recalcular por productos asociados,
            // pero dejamos que venga del payload si lo mandas.
            if (categoria.getProductos() != null) {
                existente.setProductos(categoria.getProductos());
            }

            Categoria actualizada = categoriaService.save(existente);

            return ResponseEntity.ok(Map.of(
                    "message", "Categoría actualizada exitosamente",
                    "categoria", actualizada
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error al actualizar categoría: " + e.getMessage()));
        }
    }

    // ELIMINAR
    @DeleteMapping("/api/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERVISOR')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            if (categoriaService.findById(id).isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            categoriaService.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Categoría eliminada exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error al eliminar categoría: " + e.getMessage()));
        }
    }

    // FILTROS EXTRA (opcionales)
    @GetMapping("/api/activos")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERVISOR', 'ROLE_OPERADOR')")
    public ResponseEntity<List<Categoria>> activos() {
        return ResponseEntity.ok(categoriaService.findByEstado("ACTIVO"));
    }

    @GetMapping("/api/buscar")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERVISOR', 'ROLE_OPERADOR')")
    public ResponseEntity<List<Categoria>> buscar(@RequestParam String termino) {
        return ResponseEntity.ok(categoriaService.buscar(termino));
    }
}
