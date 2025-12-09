package com.hospital.inventario.controller;

import com.hospital.inventario.model.Transaccion;
import com.hospital.inventario.service.TransaccionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/transacciones/api")
@CrossOrigin(origins = {"http://localhost:3000"})
public class TransaccionesRestController {

    @Autowired
    private TransaccionService transaccionService;

    @GetMapping
    public List<Transaccion> getAllTransacciones() {
        return transaccionService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaccion> getTransaccion(@PathVariable Long id) {
        Optional<Transaccion> transaccion = transaccionService.findById(id);
        return transaccion.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
@PostMapping
public ResponseEntity<Transaccion> createTransaccion(@RequestBody Transaccion transaccion) {

    // 👉 Si no viene código, generamos uno
    if (transaccion.getCodigo() == null || transaccion.getCodigo().isBlank()) {
        transaccion.setCodigo(generarCodigoMovimiento());
    }

    // 👉 FORZAR ESTADO A UN VALOR VÁLIDO PARA LA BD
    //    (ignora lo que mande el front: ACTIVO, A, etc.)
    transaccion.setEstado("COMPLETADA");  // o "PENDIENTE" si prefieres

    // 👉 Por si acaso, si no te llega fecha, pon la actual
    if (transaccion.getFecha() == null) {
        transaccion.setFecha(java.time.LocalDateTime.now());
    }

    Transaccion saved = transaccionService.save(transaccion);
    return ResponseEntity.ok(saved);
}

private String generarCodigoMovimiento() {
    return "MOV-" + System.currentTimeMillis();
}


}
