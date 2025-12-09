
package com.hospital.inventario.service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;

@Service
public class ConfiguracionService {
    
    public List<Map<String, Object>> getConfiguraciones() {
        List<Map<String, Object>> configuraciones = new ArrayList<>();
        
        // Configuraciones del sistema
        Map<String, Object> config1 = new HashMap<>();
        config1.put("categoria", "General");
        config1.put("configuraciones", List.of(
            Map.of("nombre", "Nombre del Sistema", "valor", "Inventarios JAMP", "tipo", "texto"),
            Map.of("nombre", "Moneda", "valor", "PEN", "tipo", "select"),
            Map.of("nombre", "Zona Horaria", "valor", "America/Lima", "tipo", "select")
        ));
        configuraciones.add(config1);
        
        Map<String, Object> config2 = new HashMap<>();
        config2.put("categoria", "Inventario");
        config2.put("configuraciones", List.of(
            Map.of("nombre", "Alertas de Stock Bajo", "valor", true, "tipo", "boolean"),
            Map.of("nombre", "Días para Alerta de Vencimiento", "valor", 30, "tipo", "numero"),
            Map.of("nombre", "Método de Valorización", "valor", "FIFO", "tipo", "select")
        ));
        configuraciones.add(config2);
        
        Map<String, Object> config3 = new HashMap<>();
        config3.put("categoria", "Usuarios");
        config3.put("configuraciones", List.of(
            Map.of("nombre", "Sesión Automática", "valor", false, "tipo", "boolean"),
            Map.of("nombre", "Tiempo de Sesión (minutos)", "valor", 60, "tipo", "numero"),
            Map.of("nombre", "Intentos de Login", "valor", 3, "tipo", "numero")
        ));
        configuraciones.add(config3);
        
        return configuraciones;
    }
}
