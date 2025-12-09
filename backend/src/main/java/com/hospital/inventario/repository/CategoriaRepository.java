package com.hospital.inventario.repository;

import com.hospital.inventario.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    boolean existsByNombre(String nombre);

    boolean existsByNombreAndIdNot(String nombre, Long id);

    List<Categoria> findByEstado(String estado);

    Optional<Categoria> findByNombre(String nombre);

    @Query("SELECT c FROM Categoria c WHERE " +
           "LOWER(c.nombre) LIKE LOWER(CONCAT('%', ?1, '%')) " +
           "OR LOWER(c.descripcion) LIKE LOWER(CONCAT('%', ?1, '%'))")
    List<Categoria> buscarPorNombreODescripcion(String termino);
}
