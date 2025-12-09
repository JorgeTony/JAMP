package com.hospital.inventario.repository;

import com.hospital.inventario.model.Almacen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlmacenRepository extends JpaRepository<Almacen, Long> {
    
    boolean existsByCodigo(String codigo);
    
    boolean existsByCodigoAndIdNot(String codigo, Long id);
    
    List<Almacen> findByEstado(String estado);
    
    Long countByEstado(String estado);
    
    @Query("SELECT a FROM Almacen a WHERE a.nombre LIKE %?1% OR a.codigo LIKE %?1% OR a.responsable LIKE %?1%")
    List<Almacen> buscarPorNombreCodigoOResponsable(String termino);
    
    @Query("SELECT a FROM Almacen a WHERE a.porcentajeOcupacion >= ?1")
    List<Almacen> findByPorcentajeOcupacionGreaterThanEqual(Integer porcentaje);
    
    Optional<Almacen> findByCodigo(String codigo);
    
    List<Almacen> findByNombreContainingIgnoreCase(String nombre);
    
    @Query("SELECT COUNT(a) FROM Almacen a WHERE a.estado = 'ACTIVO'")
    Long countAlmacenesActivos();
    
    @Query("SELECT AVG(a.porcentajeOcupacion) FROM Almacen a WHERE a.estado = 'ACTIVO'")
    Double getPromedioOcupacion();
}
