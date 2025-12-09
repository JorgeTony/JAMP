package com.hospital.inventario.controller;

import com.hospital.inventario.model.LineaProducto;
import com.hospital.inventario.service.LineaProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Arrays;

@RestController
@RequestMapping("/linea-producto/api")

public class LineaProductoRestController {
    
    @Autowired
    private LineaProductoService lineaProductoService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'OPERADOR')")
    public ResponseEntity<List<LineaProducto>> getAllLineas() {
        return ResponseEntity.ok(lineaProductoService.findAll());
    }
    
    @GetMapping("/categorias")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'OPERADOR')")
    public ResponseEntity<List<String>> getCategorias() {
        List<String> categorias = Arrays.asList(
            "Medicamentos",
            "Suministros",
            "Equipos",
            "Material Quirúrgico",
            "Diagnóstico",
            "Farmacología",
            "Cirugía",
            "Laboratorio"
        );
        return ResponseEntity.ok(categorias);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'OPERADOR')")
    public ResponseEntity<LineaProducto> getLineaById(@PathVariable Long id) {
        LineaProducto linea = lineaProductoService.findById(id);
        if (linea != null) {
            return ResponseEntity.ok(linea);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<LineaProducto> createLinea(@RequestBody LineaProducto linea) {
        LineaProducto saved = lineaProductoService.save(linea);
        return ResponseEntity.ok(saved);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<LineaProducto> updateLinea(@PathVariable Long id, @RequestBody LineaProducto linea) {
        LineaProducto existing = lineaProductoService.findById(id);
        if (existing != null) {
            linea.setId(id);
            return ResponseEntity.ok(lineaProductoService.save(linea));
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteLinea(@PathVariable Long id) {
        LineaProducto linea = lineaProductoService.findById(id);
        if (linea != null) {
            lineaProductoService.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
