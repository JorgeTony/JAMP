package com.hospital.inventario.service;

import com.hospital.inventario.model.Producto;
import com.hospital.inventario.repository.ProductoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class VencimientoService {

    private final ProductoRepository productoRepository;

    public VencimientoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public List<Producto> getProductosProximosAVencer(int dias) {
        LocalDate hoy = LocalDate.now();
        LocalDate hasta = hoy.plusDays(dias);
        return productoRepository.findByFechaVencimientoBetweenAndEstado(
                hoy,
                hasta,
                "ACTIVO"
        );
    }
}
