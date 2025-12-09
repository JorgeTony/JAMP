package com.hospital.inventario.controller;

import com.hospital.inventario.model.Producto;
import com.hospital.inventario.service.ProductoService;
import com.hospital.inventario.decorator.ProductoConDescuento;
import com.hospital.inventario.decorator.ProductoConAlerta;
import com.hospital.inventario.memento.ProductoMemento;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador para demostrar el uso de los patrones de diseño implementados
 */
@RestController
@RequestMapping("/patrones")
public class PatronesController {

    @Autowired
    private ProductoService productoService;

    // ========== PATRÓN STATE ==========
    
    @PutMapping("/api/productos/{id}/activar")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<?> activarProducto(@PathVariable Long id) {
        try {
            Producto producto = productoService.activarProducto(id);
            return ResponseEntity.ok(Map.of(
                "message", "Producto activado exitosamente",
                "producto", producto,
                "estadoDetallado", producto.getDescripcionEstado()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Error al activar producto: " + e.getMessage()));
        }
    }
    
    @PutMapping("/api/productos/{id}/desactivar")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<?> desactivarProducto(@PathVariable Long id) {
        try {
            Producto producto = productoService.desactivarProducto(id);
            return ResponseEntity.ok(Map.of(
                "message", "Producto desactivado exitosamente",
                "producto", producto,
                "estadoDetallado", producto.getDescripcionEstado()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Error al desactivar producto: " + e.getMessage()));
        }
    }
    
    @PutMapping("/api/productos/{id}/descontinuar")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<?> descontinuarProducto(@PathVariable Long id) {
        try {
            Producto producto = productoService.descontinuarProducto(id);
            return ResponseEntity.ok(Map.of(
                "message", "Producto descontinuado exitosamente",
                "producto", producto,
                "estadoDetallado", producto.getDescripcionEstado()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Error al descontinuar producto: " + e.getMessage()));
        }
    }
    
    @PutMapping("/api/productos/{id}/reactivar")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<?> reactivarProducto(@PathVariable Long id) {
        try {
            Producto producto = productoService.reactivarProducto(id);
            return ResponseEntity.ok(Map.of(
                "message", "Producto reactivado exitosamente",
                "producto", producto,
                "estadoDetallado", producto.getDescripcionEstado()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Error al reactivar producto: " + e.getMessage()));
        }
    }
    
    @GetMapping("/api/productos/{id}/estado-detallado")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'OPERADOR')")
    public ResponseEntity<?> getEstadoDetallado(@PathVariable Long id) {
        try {
            String estadoDetallado = productoService.getEstadoDetalladoProducto(id);
            return ResponseEntity.ok(Map.of(
                "productoId", id,
                "estadoDetallado", estadoDetallado
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Error al obtener estado: " + e.getMessage()));
        }
    }

    // ========== PATRÓN DECORATOR ==========
    
    @PostMapping("/api/productos/{id}/aplicar-descuento")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<?> aplicarDescuento(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            Double porcentaje = Double.valueOf(request.get("porcentaje").toString());
            String motivo = request.get("motivo").toString();
            
            ProductoConDescuento productoConDescuento = productoService.aplicarDescuento(id, porcentaje, motivo);
            
            return ResponseEntity.ok(Map.of(
                "message", "Descuento aplicado exitosamente",
                "productoOriginal", Map.of(
                    "id", productoConDescuento.getId(),
                    "nombre", productoConDescuento.getNombre(),
                    "precioOriginal", productoConDescuento.getPrecio()
                ),
                "descuento", Map.of(
                    "porcentaje", productoConDescuento.getPorcentajeDescuento(),
                    "motivo", productoConDescuento.getMotivoDescuento(),
                    "precioConDescuento", productoConDescuento.getPrecioConDescuentos(),
                    "descripcionCompleta", productoConDescuento.getDescripcionCompleta()
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Error al aplicar descuento: " + e.getMessage()));
        }
    }
    
    @PostMapping("/api/productos/{id}/agregar-alerta")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<?> agregarAlerta(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String tipoAlerta = request.get("tipoAlerta");
            String mensaje = request.get("mensaje");
            
            ProductoConAlerta productoConAlerta = productoService.agregarAlerta(id, tipoAlerta, mensaje);
            
            return ResponseEntity.ok(Map.of(
                "message", "Alerta agregada exitosamente",
                "producto", Map.of(
                    "id", productoConAlerta.getId(),
                    "nombre", productoConAlerta.getNombre(),
                    "estadoDetallado", productoConAlerta.getEstadoDetallado(),
                    "descripcionCompleta", productoConAlerta.getDescripcionCompleta()
                ),
                "alerta", Map.of(
                    "tipo", productoConAlerta.getTipoAlerta(),
                    "mensaje", productoConAlerta.getMensajeAlerta()
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Error al agregar alerta: " + e.getMessage()));
        }
    }
    
    @GetMapping("/api/productos/alertas-stock-bajo")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'OPERADOR')")
    public ResponseEntity<List<ProductoConAlerta>> getProductosConAlertaStockBajo() {
        List<ProductoConAlerta> productosConAlerta = productoService.getProductosConAlertaStockBajo();
        return ResponseEntity.ok(productosConAlerta);
    }

    // ========== PATRÓN MEMENTO ==========
    
    @GetMapping("/api/productos/{id}/historial")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<List<ProductoMemento>> getHistorialProducto(@PathVariable Long id) {
        List<ProductoMemento> historial = productoService.getHistorialProducto(id);
        return ResponseEntity.ok(historial);
    }
    
    @GetMapping("/api/productos/{id}/ultimo-memento")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<?> getUltimoMemento(@PathVariable Long id) {
        ProductoMemento memento = productoService.getUltimoMemento(id);
        if (memento != null) {
            return ResponseEntity.ok(memento);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping("/api/productos/{id}/restaurar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> restaurarProducto(@PathVariable Long id) {
        try {
            Producto productoRestaurado = productoService.restaurarProducto(id);
            return ResponseEntity.ok(Map.of(
                "message", "Producto restaurado exitosamente",
                "producto", productoRestaurado
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Error al restaurar producto: " + e.getMessage()));
        }
    }
    
    @GetMapping("/api/cambios-recientes")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<List<ProductoMemento>> getCambiosRecientes(@RequestParam(defaultValue = "10") int limite) {
        List<ProductoMemento> cambios = productoService.getCambiosRecientes(limite);
        return ResponseEntity.ok(cambios);
    }
    
    @DeleteMapping("/api/productos/{id}/limpiar-historial")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> limpiarHistorial(@PathVariable Long id) {
        try {
            productoService.limpiarHistorialProducto(id);
            return ResponseEntity.ok(Map.of("message", "Historial limpiado exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Error al limpiar historial: " + e.getMessage()));
        }
    }

    // ========== ANÁLISIS CON PATRONES ==========
    
    @GetMapping("/api/productos/necesitan-atencion")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'OPERADOR')")
    public ResponseEntity<List<Producto>> getProductosQueNecesitanAtencion() {
        List<Producto> productos = productoService.getProductosQueNecesitanAtencion();
        return ResponseEntity.ok(productos);
    }
    
    @GetMapping("/api/demo-patrones")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<?> demoPatrones() {
        return ResponseEntity.ok(Map.of(
            "message", "Patrones de diseño implementados",
            "patrones", Map.of(
                "creacionales", List.of("Singleton", "Factory Method"),
                "estructurales", List.of("Decorator", "Facade", "Proxy"),
                "comportamiento", List.of("Observer", "State", "Memento")
            ),
            "endpoints", Map.of(
                "state", List.of(
                    "PUT /patrones/api/productos/{id}/activar",
                    "PUT /patrones/api/productos/{id}/desactivar",
                    "PUT /patrones/api/productos/{id}/descontinuar",
                    "PUT /patrones/api/productos/{id}/reactivar"
                ),
                "decorator", List.of(
                    "POST /patrones/api/productos/{id}/aplicar-descuento",
                    "POST /patrones/api/productos/{id}/agregar-alerta",
                    "GET /patrones/api/productos/alertas-stock-bajo"
                ),
                "memento", List.of(
                    "GET /patrones/api/productos/{id}/historial",
                    "POST /patrones/api/productos/{id}/restaurar",
                    "GET /patrones/api/cambios-recientes"
                )
            )
        ));
    }
}