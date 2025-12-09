package com.hospital.inventario.controller;

import com.hospital.inventario.model.Almacen;
import com.hospital.inventario.model.Producto;
import com.hospital.inventario.service.AlmacenService;
import com.hospital.inventario.service.ProductoService;
import com.hospital.inventario.service.ReporteService;
import com.hospital.inventario.service.VencimientoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/reportes")
// @CrossOrigin(origins = "http://localhost:3000") // descomenta si lo necesitas para el frontend
public class ReportesController {

    private final ReporteService reporteService;
    private final ProductoService productoService;
    private final AlmacenService almacenService;
    private final VencimientoService vencimientoService;

    public ReportesController(ReporteService reporteService,
                              ProductoService productoService,
                              AlmacenService almacenService,
                              VencimientoService vencimientoService) {
        this.reporteService = reporteService;
        this.productoService = productoService;
        this.almacenService = almacenService;
        this.vencimientoService = vencimientoService;
    }

    // === VENCIMIENTOS (para el dashboard) ===
    @GetMapping("/api/vencimientos")
@PreAuthorize("hasAnyRole('ADMIN','SUPERVISOR','OPERADOR')")
public ResponseEntity<?> getProductosProximosAVencer(
        @RequestParam(defaultValue = "30") int dias) {
    var productos = vencimientoService.getProductosProximosAVencer(dias);
    return ResponseEntity.ok(Map.of(
            "total", productos.size(),
            "productos", productos
    ));
}


    // === RESUMEN GENERAL (para pestaña Reportes -> Resumen / Ventas, etc) ===
    @GetMapping("/api")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'OPERADOR')")
    public ResponseEntity<Map<String, Object>> getReportesGenerales() {
        try {
            Map<String, Object> reportes = new HashMap<>();

            // Reportes de productos
            reportes.put("totalProductos", productoService.findAll().size());
            reportes.put("productosActivos", productoService.countProductosActivos());
            reportes.put("productosStockBajo", productoService.countProductosStockBajo());
            reportes.put("valorTotalInventario", productoService.getValorTotalInventario());

            // Reportes de almacenes
            reportes.put("totalAlmacenes", almacenService.findAll().size());
            reportes.put("almacenesActivos", almacenService.countAlmacenesActivos());

            // Productos con stock bajo
            reportes.put("listaProductosStockBajo", productoService.findProductosStockBajo());

            // Productos por categoría
            Map<String, Long> productosPorCategoria = new HashMap<>();
            List<String> categorias = productoService.findAllCategorias();
            for (String categoria : categorias) {
                long count = productoService.findByCategoria(categoria).size();
                productosPorCategoria.put(categoria, count);
            }
            reportes.put("productosPorCategoria", productosPorCategoria);

            // Almacenes con mayor ocupación
            List<Almacen> almacenesOrdenados = almacenService.findAll()
                    .stream()
                    .sorted((a1, a2) -> Integer.compare(
                            a2.getPorcentajeOcupacion() != null ? a2.getPorcentajeOcupacion() : 0,
                            a1.getPorcentajeOcupacion() != null ? a1.getPorcentajeOcupacion() : 0
                    ))
                    .limit(5)
                    .toList();
            reportes.put("almacenesMayorOcupacion", almacenesOrdenados);

            return ResponseEntity.ok(reportes);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error al generar reportes: " + e.getMessage()));
        }
    }

    // === REPORTE DETALLADO DE PRODUCTOS ===
    @GetMapping("/api/productos")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'OPERADOR')")
    public ResponseEntity<Map<String, Object>> getReporteProductos() {
        try {
            Map<String, Object> reporte = new HashMap<>();

            List<Producto> productos = productoService.findAll();
            reporte.put("productos", productos);
            reporte.put("total", productos.size());

            // Estadísticas por estado
            Map<String, Long> porEstado = productos.stream()
                    .collect(Collectors.groupingBy(Producto::getEstado, Collectors.counting()));
            reporte.put("estadisticasPorEstado", porEstado);

            // Estadísticas por categoría
            Map<String, Long> porCategoria = productos.stream()
                    .collect(Collectors.groupingBy(Producto::getCategoria, Collectors.counting()));
            reporte.put("estadisticasPorCategoria", porCategoria);

            // Valor total por categoría
            Map<String, Double> valorPorCategoria = new HashMap<>();
            for (String categoria : productoService.findAllCategorias()) {
                double valor = productos.stream()
                        .filter(p -> categoria.equals(p.getCategoria()))
                        .mapToDouble(p -> p.getPrecio() * p.getStock())
                        .sum();
                valorPorCategoria.put(categoria, valor);
            }
            reporte.put("valorPorCategoria", valorPorCategoria);

            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error al generar reporte de productos: " + e.getMessage()));
        }
    }

    // === REPORTE DETALLADO DE ALMACENES ===
    @GetMapping("/api/almacenes")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'OPERADOR')")
    public ResponseEntity<Map<String, Object>> getReporteAlmacenes() {
        try {
            Map<String, Object> reporte = new HashMap<>();

            List<Almacen> almacenes = almacenService.findAll();
            reporte.put("almacenes", almacenes);
            reporte.put("total", almacenes.size());

            // Estadísticas por estado
            Map<String, Long> porEstado = almacenes.stream()
                    .collect(Collectors.groupingBy(Almacen::getEstado, Collectors.counting()));
            reporte.put("estadisticasPorEstado", porEstado);

            // Ocupación promedio
            double ocupacionPromedio = almacenes.stream()
                    .filter(a -> a.getPorcentajeOcupacion() != null)
                    .mapToInt(Almacen::getPorcentajeOcupacion)
                    .average()
                    .orElse(0.0);
            reporte.put("ocupacionPromedio", ocupacionPromedio);

            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error al generar reporte de almacenes: " + e.getMessage()));
        }
    }

    // === ALERTAS DE STOCK BAJO (para Reportes -> Estado de Inventario) ===
    @GetMapping("/api/stock-bajo")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'OPERADOR')")
    public ResponseEntity<List<Producto>> getProductosStockBajo() {
        List<Producto> productos = productoService.findProductosStockBajo();
        return ResponseEntity.ok(productos);
    }

    // === EXPORTACIÓN (simulada) ===
    @GetMapping("/api/exportar/{tipo}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<?> exportarReporte(@PathVariable String tipo) {
        try {
            return ResponseEntity.ok(Map.of(
                    "message", "Reporte " + tipo + " exportado exitosamente",
                    "tipo", tipo,
                    "fecha", LocalDateTime.now()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error al exportar reporte: " + e.getMessage()));
        }
    }
}
