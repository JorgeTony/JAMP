package com.hospital.inventario.repository;

import com.hospital.inventario.model.Lote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface LoteRepository extends JpaRepository<Lote, Long> {

    @Query("""
           SELECT l FROM Lote l
           WHERE l.fechaVencimiento BETWEEN :hoy AND :hasta
             AND (l.estado IS NULL OR l.estado = 'ACTIVO')
           ORDER BY l.fechaVencimiento ASC
           """)
    List<Lote> findProximosAVencer(@Param("hoy") LocalDate hoy,
                                   @Param("hasta") LocalDate hasta);
}
