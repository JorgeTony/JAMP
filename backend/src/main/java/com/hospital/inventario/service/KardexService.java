
package com.hospital.inventario.service;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;

@Service
public class KardexService {
    
    public List<Map<String, Object>> findAll() {
        List<Map<String, Object>> movimientos = new ArrayList<>();
        
        // Datos de prueba para el kardex
        Map<String, Object> mov1 = new HashMap<>();
        mov1.put("fecha", LocalDateTime.now().minusDays(1));
        mov1.put("producto", "Paracetamol 500mg");
        mov1.put("tipo", "ENTRADA");
        mov1.put("cantidad", 100);
        mov1.put("saldoAnterior", 400);
        mov1.put("saldoActual", 500);
        mov1.put("usuario", "María González");
        movimientos.add(mov1);
        
        Map<String, Object> mov2 = new HashMap<>();
        mov2.put("fecha", LocalDateTime.now().minusHours(6));
        mov2.put("producto", "Ibuprofeno 400mg");
        mov2.put("tipo", "SALIDA");
        mov2.put("cantidad", 25);
        mov2.put("saldoAnterior", 325);
        mov2.put("saldoActual", 300);
        mov2.put("usuario", "Carlos Mendoza");
        movimientos.add(mov2);
        
        Map<String, Object> mov3 = new HashMap<>();
        mov3.put("fecha", LocalDateTime.now().minusHours(2));
        mov3.put("producto", "Jeringa 5ml");
        mov3.put("tipo", "TRANSFERENCIA");
        mov3.put("cantidad", 50);
        mov3.put("saldoAnterior", 1050);
        mov3.put("saldoActual", 1000);
        mov3.put("usuario", "Ana García");
        movimientos.add(mov3);
        
        return movimientos;
    }
}
