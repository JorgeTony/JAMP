package com.hospital.inventario.service;

import com.hospital.inventario.model.Producto;
import com.hospital.inventario.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InventarioService {

    @Autowired
    private ProductoRepository productoRepository;

    public List<Producto> findAll() {
        // Devuelve los productos reales del inventario
        return productoRepository.findAll();
    }
}
