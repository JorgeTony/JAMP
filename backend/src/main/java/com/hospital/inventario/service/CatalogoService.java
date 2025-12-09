
package com.hospital.inventario.service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;

@Service
public class CatalogoService {
    
    public List<Map<String, Object>> findAllCategorias() {
        List<Map<String, Object>> categorias = new ArrayList<>();
        
        // Datos de prueba para el catálogo
        Map<String, Object> cat1 = new HashMap<>();
        cat1.put("id", 1L);
        cat1.put("nombre", "Medicamentos");
        cat1.put("descripcion", "Productos farmacéuticos y medicinas");
        cat1.put("productos", 456);
        cat1.put("subcategorias", List.of("Analgésicos", "Antibióticos", "Vitaminas"));
        categorias.add(cat1);
        
        Map<String, Object> cat2 = new HashMap<>();
        cat2.put("id", 2L);
        cat2.put("nombre", "Suministros Médicos");
        cat2.put("descripcion", "Material médico y suministros hospitalarios");
        cat2.put("productos", 789);
        cat2.put("subcategorias", List.of("Jeringas", "Gasas", "Vendas"));
        categorias.add(cat2);
        
        Map<String, Object> cat3 = new HashMap<>();
        cat3.put("id", 3L);
        cat3.put("nombre", "Equipos Médicos");
        cat3.put("descripcion", "Equipos y dispositivos médicos");
        cat3.put("productos", 234);
        cat3.put("subcategorias", List.of("Diagnóstico", "Monitoreo", "Terapia"));
        categorias.add(cat3);
        
        return categorias;
    }
}
