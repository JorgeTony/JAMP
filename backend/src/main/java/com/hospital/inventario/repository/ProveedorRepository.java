package com.hospital.inventario.repository;

import com.hospital.inventario.model.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {

    boolean existsByCodigo(String codigo);

    boolean existsByCodigoAndIdNot(String codigo, Long id);

    @Query("SELECT p FROM Proveedor p WHERE " +
           "LOWER(p.nombre) LIKE LOWER(CONCAT('%', ?1, '%')) OR " +
           "LOWER(p.codigo) LIKE LOWER(CONCAT('%', ?1, '%')) OR " +
           "LOWER(p.contacto) LIKE LOWER(CONCAT('%', ?1, '%'))")
    List<Proveedor> buscarPorNombreCodigoOContacto(String termino);

    Optional<Proveedor> findByCodigo(String codigo);
}
