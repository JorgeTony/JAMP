
package com.hospital.inventario.service;

import com.hospital.inventario.model.LineaProducto;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;

@Service
public class LineaProductoService {
    
    private List<LineaProducto> lineas = new ArrayList<>();
    
    public LineaProductoService() {
        // Datos de prueba
        LineaProducto l1 = new LineaProducto("LIN-001", "Analgésicos", "Medicamentos", "Farmacología");
        l1.setDescripcion("Medicamentos para el alivio del dolor");
        l1.setProductos(45);
        lineas.add(l1);
        
        LineaProducto l2 = new LineaProducto("LIN-002", "Material Quirúrgico", "Suministros", "Cirugía");
        l2.setDescripcion("Instrumentos y materiales para procedimientos quirúrgicos");
        l2.setProductos(128);
        lineas.add(l2);
        
        LineaProducto l3 = new LineaProducto("LIN-003", "Equipos de Diagnóstico", "Equipos", "Diagnóstico");
        l3.setDescripcion("Equipos médicos para diagnóstico y monitoreo");
        l3.setProductos(67);
        lineas.add(l3);
    }
    
    public List<LineaProducto> findAll() {
        return lineas;
    }
    
    public LineaProducto findById(Long id) {
        return lineas.stream()
            .filter(l -> l.getId().equals(id))
            .findFirst()
            .orElse(null);
    }
    
    public LineaProducto save(LineaProducto linea) {
        if (linea.getId() == null) {
            linea.setId((long) (lineas.size() + 1));
            lineas.add(linea);
        } else {
            // Actualizar existente
            lineas.removeIf(l -> l.getId().equals(linea.getId()));
            lineas.add(linea);
        }
        return linea;
    }
    
    public void deleteById(Long id) {
        lineas.removeIf(l -> l.getId().equals(id));
    }
}
