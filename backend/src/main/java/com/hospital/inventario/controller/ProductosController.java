package com.hospital.inventario.controller;

import com.hospital.inventario.model.Producto;
import com.hospital.inventario.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/productos")

public class ProductosController {

    @Autowired
    private ProductoService productoService;

    @GetMapping("/api")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERVISOR', 'ROLE_OPERADOR')")
    public ResponseEntity<List<Producto>> getAllProductos() {
        List<Producto> productos = productoService.findAll();
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/api/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERVISOR', 'ROLE_OPERADOR')")
    public ResponseEntity<Producto> getProductoById(@PathVariable Long id) {
        Optional<Producto> producto = productoService.findById(id);
        return producto.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/api")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERVISOR')")
    public ResponseEntity<?> createProducto(@RequestBody Producto producto) {
        try {
            if (productoService.existsByCodigo(producto.getCodigo())) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Ya existe un producto con este código"));
            }

            Producto nuevoProducto = productoService.save(producto);
            return ResponseEntity.ok(Map.of(
                "message", "Producto creado exitosamente",
                "producto", nuevoProducto
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Error al crear producto: " + e.getMessage()));
        }
    }

    @PutMapping("/api/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERVISOR')")
    public ResponseEntity<?> updateProducto(@PathVariable Long id, @RequestBody Producto producto) {
        try {
            Optional<Producto> productoExistente = productoService.findById(id);
            if (productoExistente.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            if (productoService.existsByCodigoAndIdNot(producto.getCodigo(), id)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Ya existe otro producto con este código"));
            }

            producto.setId(id);
            Producto productoActualizado = productoService.save(producto);
            return ResponseEntity.ok(Map.of(
                "message", "Producto actualizado exitosamente",
                "producto", productoActualizado
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Error al actualizar producto: " + e.getMessage()));
        }
    }

    @DeleteMapping("/api/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERVISOR')")
    public ResponseEntity<?> deleteProducto(@PathVariable Long id) {
        try {
            if (productoService.findById(id).isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            productoService.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Producto eliminado exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Error al eliminar producto: " + e.getMessage()));
        }
    }

    @GetMapping("/api/buscar")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERVISOR', 'ROLE_OPERADOR')")
    public ResponseEntity<List<Producto>> buscarProductos(@RequestParam String termino) {
        List<Producto> productos = productoService.buscarPorNombreOCodigo(termino);
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/api/categoria/{categoria}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERVISOR', 'ROLE_OPERADOR')")
    public ResponseEntity<List<Producto>> getProductosPorCategoria(@PathVariable String categoria) {
        List<Producto> productos = productoService.findByCategoria(categoria);
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/api/stock-bajo")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERVISOR', 'ROLE_OPERADOR')")
    public ResponseEntity<List<Producto>> getProductosStockBajo() {
        List<Producto> productos = productoService.findProductosStockBajo();
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/api/categorias")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERVISOR', 'ROLE_OPERADOR')")
    public ResponseEntity<List<String>> getAllCategorias() {
        List<String> categorias = productoService.findAllCategorias();
        return ResponseEntity.ok(categorias);
    }

    @PutMapping("/api/{id}/stock")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERVISOR', 'ROLE_OPERADOR')")
    public ResponseEntity<?> actualizarStock(@PathVariable Long id, @RequestBody Map<String, Integer> request) {
        try {
            Optional<Producto> productoOpt = productoService.findById(id);
            if (productoOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Producto producto = productoOpt.get();
            Integer nuevoStock = request.get("stock");

            if (nuevoStock == null || nuevoStock < 0) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "El stock debe ser un número positivo"));
            }

            producto.setStock(nuevoStock);
            Producto productoActualizado = productoService.save(producto);

            return ResponseEntity.ok(Map.of(
                "message", "Stock actualizado exitosamente",
                "producto", productoActualizado
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Error al actualizar stock: " + e.getMessage()));
        }
    }
}
