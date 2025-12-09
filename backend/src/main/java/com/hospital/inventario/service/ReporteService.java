
package com.hospital.inventario.service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;

@Service
public class ReporteService {
    
    public List<Map<String, Object>> getReportesDisponibles() {
        List<Map<String, Object>> reportes = new ArrayList<>();
        
        // Tipos de reportes disponibles
        Map<String, Object> rep1 = new HashMap<>();
        rep1.put("id", 1L);
        rep1.put("nombre", "Reporte de Inventario");
        rep1.put("descripcion", "Estado actual del inventario por almacén");
        rep1.put("tipo", "inventario");
        rep1.put("frecuencia", "Diario");
        reportes.add(rep1);
        
        Map<String, Object> rep2 = new HashMap<>();
        rep2.put("id", 2L);
        rep2.put("nombre", "Reporte de Movimientos");
        rep2.put("descripcion", "Transacciones y movimientos de productos");
        rep2.put("tipo", "movimientos");
        rep2.put("frecuencia", "Semanal");
        reportes.add(rep2);
        
        Map<String, Object> rep3 = new HashMap<>();
        rep3.put("id", 3L);
        rep3.put("nombre", "Reporte de Stock Bajo");
        rep3.put("descripcion", "Productos con stock por debajo del mínimo");
        rep3.put("tipo", "stock-bajo");
        rep3.put("frecuencia", "Diario");
        reportes.add(rep3);
        
        Map<String, Object> rep4 = new HashMap<>();
        rep4.put("id", 4L);
        rep4.put("nombre", "Reporte Financiero");
        rep4.put("descripcion", "Valorización del inventario y costos");
        rep4.put("tipo", "financiero");
        rep4.put("frecuencia", "Mensual");
        reportes.add(rep4);
        
        return reportes;
    }
}
