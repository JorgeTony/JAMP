package com.hospital.inventario.memento;

import org.springframework.stereotype.Component;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Patrón Memento - Caretaker que gestiona los mementos de productos
 */
@Component
public class ProductoCaretaker {
    private final Map<Long, List<ProductoMemento>> historialProductos = new ConcurrentHashMap<>();
    private final int MAX_HISTORIAL_POR_PRODUCTO = 10;
    
    public void guardarMemento(Long productoId, ProductoMemento memento) {
        historialProductos.computeIfAbsent(productoId, k -> new ArrayList<>());
        List<ProductoMemento> historial = historialProductos.get(productoId);
        
        historial.add(memento);
        
        // Mantener solo los últimos MAX_HISTORIAL_POR_PRODUCTO registros
        if (historial.size() > MAX_HISTORIAL_POR_PRODUCTO) {
            historial.remove(0);
        }
    }
    
    public List<ProductoMemento> getHistorial(Long productoId) {
        return historialProductos.getOrDefault(productoId, new ArrayList<>());
    }
    
    public ProductoMemento getUltimoMemento(Long productoId) {
        List<ProductoMemento> historial = historialProductos.get(productoId);
        if (historial != null && !historial.isEmpty()) {
            return historial.get(historial.size() - 1);
        }
        return null;
    }
    
    public ProductoMemento getMementoAnterior(Long productoId) {
        List<ProductoMemento> historial = historialProductos.get(productoId);
        if (historial != null && historial.size() > 1) {
            return historial.get(historial.size() - 2);
        }
        return null;
    }
    
    public void limpiarHistorial(Long productoId) {
        historialProductos.remove(productoId);
    }
    
    public Map<Long, Integer> getEstadisticasHistorial() {
        Map<Long, Integer> estadisticas = new HashMap<>();
        historialProductos.forEach((productoId, historial) -> 
            estadisticas.put(productoId, historial.size()));
        return estadisticas;
    }
    
    public List<ProductoMemento> getTodosLosCambiosRecientes(int limite) {
        return historialProductos.values().stream()
                .flatMap(List::stream)
                .sorted((m1, m2) -> m2.getFechaSnapshot().compareTo(m1.getFechaSnapshot()))
                .limit(limite)
                .toList();
    }
}