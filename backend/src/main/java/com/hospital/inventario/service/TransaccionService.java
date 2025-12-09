package com.hospital.inventario.service;

import com.hospital.inventario.model.Transaccion;
import com.hospital.inventario.repository.TransaccionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TransaccionService {

    private final TransaccionRepository transaccionRepository;

    public TransaccionService(TransaccionRepository transaccionRepository) {
        this.transaccionRepository = transaccionRepository;
    }

    public List<Transaccion> findAll() {
        return transaccionRepository.findAllByOrderByFechaDesc();

    }

    public Optional<Transaccion> findById(Long id) {
        return transaccionRepository.findById(id);
    }

    public Transaccion save(Transaccion transaccion) {
        if (transaccion.getFecha() == null) {
            transaccion.setFecha(LocalDateTime.now());
        }
        return transaccionRepository.save(transaccion);
    }

    public void deleteById(Long id) {
        transaccionRepository.deleteById(id);
    }
}
