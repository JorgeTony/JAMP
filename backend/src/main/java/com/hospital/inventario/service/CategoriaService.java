package com.hospital.inventario.service;

import com.hospital.inventario.model.Categoria;
import com.hospital.inventario.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    public List<Categoria> findAll() {
        return categoriaRepository.findAll();
    }

    public Optional<Categoria> findById(Long id) {
        return categoriaRepository.findById(id);
    }

    public Categoria save(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    public void deleteById(Long id) {
        categoriaRepository.deleteById(id);
    }

    public boolean existsByNombre(String nombre) {
        return categoriaRepository.existsByNombre(nombre);
    }

    public boolean existsByNombreAndIdNot(String nombre, Long id) {
        return categoriaRepository.existsByNombreAndIdNot(nombre, id);
    }

    public List<Categoria> findByEstado(String estado) {
        return categoriaRepository.findByEstado(estado);
    }

    public List<Categoria> buscar(String termino) {
        if (termino == null || termino.trim().isEmpty()) {
            return categoriaRepository.findAll();
        }
        return categoriaRepository.buscarPorNombreODescripcion(termino.trim());
    }
}
