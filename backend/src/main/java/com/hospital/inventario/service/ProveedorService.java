package com.hospital.inventario.service;

import com.hospital.inventario.model.Proveedor;
import com.hospital.inventario.repository.ProveedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class ProveedorService {

    @Autowired
    private ProveedorRepository proveedorRepository;

    public List<Proveedor> findAll() {
        return proveedorRepository.findAll();
    }

    public Optional<Proveedor> findById(Long id) {
        return proveedorRepository.findById(id);
    }

    public Proveedor save(Proveedor proveedor) {
        return proveedorRepository.save(proveedor);
    }

    public void deleteById(Long id) {
        proveedorRepository.deleteById(id);
    }

    public boolean existsByCodigo(String codigo) {
        return proveedorRepository.existsByCodigo(codigo);
    }

    public boolean existsByCodigoAndIdNot(String codigo, Long id) {
        return proveedorRepository.existsByCodigoAndIdNot(codigo, id);
    }

    public List<Proveedor> buscar(String termino) {
        if (termino == null || termino.trim().isEmpty()) {
            return proveedorRepository.findAll();
        }
        return proveedorRepository.buscarPorNombreCodigoOContacto(termino.trim());
    }

    /** Genera PROV001, PROV002, ... usando el mayor código actual */
    public String generarNuevoCodigo() {
        List<Proveedor> proveedores = proveedorRepository.findAll();

        int maxNumero = proveedores.stream()
            .map(Proveedor::getCodigo)
            .filter(c -> c != null && c.startsWith("PROV"))
            .map(c -> {
                try {
                    return Integer.parseInt(c.substring(4));
                } catch (NumberFormatException e) {
                    return 0;
                }
            })
            .max(Comparator.naturalOrder())
            .orElse(0);

        int siguiente = maxNumero + 1;
        return String.format("PROV%03d", siguiente);
    }
}
