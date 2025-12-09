package com.hospital.inventario.repository;

import com.hospital.inventario.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    
    boolean existsByCodigo(String codigo);
    
    boolean existsByCodigoAndIdNot(String codigo, Long id);
    
    List<Producto> findByCategoria(String categoria);
    
    List<Producto> findByEstado(String estado);
    
    @Query("SELECT p FROM Producto p WHERE p.nombre LIKE %?1% OR p.codigo LIKE %?1%")
    List<Producto> buscarPorNombreOCodigo(String termino);
    
    @Query("SELECT p FROM Producto p WHERE p.stock <= p.stockMinimo")
    List<Producto> findProductosStockBajo();
    
    @Query("SELECT COUNT(p) FROM Producto p WHERE p.estado = 'ACTIVO'")
    Long countProductosActivos();
    
    @Query("SELECT SUM(p.precio * p.stock) FROM Producto p WHERE p.estado = 'ACTIVO'")
    Double getValorTotalInventario();
    
    @Query("SELECT COUNT(p) FROM Producto p WHERE p.stock <= p.stockMinimo")
    Long countProductosStockBajo();
    
    @Query("SELECT DISTINCT p.categoria FROM Producto p WHERE p.categoria IS NOT NULL ORDER BY p.categoria")
    List<String> findAllCategorias();
    
    @Query("SELECT p FROM Producto p WHERE p.proveedor LIKE %?1%")
    List<Producto> findByProveedorContaining(String proveedor);
    
    @Query("SELECT p FROM Producto p WHERE p.precio BETWEEN ?1 AND ?2")
    List<Producto> findByPrecioBetween(BigDecimal precioMin, BigDecimal precioMax);

     List<Producto> findByFechaVencimientoBetweenAndEstado(
            LocalDate desde,
            LocalDate hasta,
            String estado
    );

}
