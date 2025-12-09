package com.hospital.inventario.service;

import com.hospital.inventario.model.Almacen;
import com.hospital.inventario.repository.AlmacenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class AlmacenService {
    
    @Autowired
    private AlmacenRepository almacenRepository;
    
    public List<Almacen> findAll() {
        return almacenRepository.findAll();
    }
    
    public Optional<Almacen> findById(Long id) {
        return almacenRepository.findById(id);
    }
    
    public Almacen save(Almacen almacen) {
        return almacenRepository.save(almacen);
    }
    
    public void deleteById(Long id) {
        almacenRepository.deleteById(id);
    }
    
    public boolean existsByCodigo(String codigo) {
        return almacenRepository.existsByCodigo(codigo);
    }
    
    public boolean existsByCodigoAndIdNot(String codigo, Long id) {
        return almacenRepository.existsByCodigoAndIdNot(codigo, id);
    }
    
    public List<Almacen> findByEstado(String estado) {
        return almacenRepository.findByEstado(estado);
    }
    
    public List<Almacen> findAlmacenesActivos() {
        return almacenRepository.findByEstado("ACTIVO");
    }
    
    public Long countAlmacenesActivos() {
        return almacenRepository.countByEstado("ACTIVO");
    }
    
    public List<Almacen> buscarAlmacenes(String termino) {
        if (termino == null || termino.trim().isEmpty()) {
            return almacenRepository.findAll();
        }
        return almacenRepository.buscarPorNombreCodigoOResponsable(termino.trim());
    }
    
    public List<Almacen> findAlmacenesConMayorOcupacion() {
        return almacenRepository.findAll()
            .stream()
            .filter(a -> a.getPorcentajeOcupacion() != null)
            .sorted((a1, a2) -> Integer.compare(a2.getPorcentajeOcupacion(), a1.getPorcentajeOcupacion()))
            .limit(5)
            .toList();
    }
    
    public Double getOcupacionPromedio() {
        List<Almacen> almacenes = almacenRepository.findAll();
        return almacenes.stream()
            .filter(a -> a.getPorcentajeOcupacion() != null)
            .mapToInt(Almacen::getPorcentajeOcupacion)
            .average()
            .orElse(0.0);
    }
}
