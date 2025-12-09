package com.hospital.inventario.repository;

import com.hospital.inventario.model.Transaccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransaccionRepository extends JpaRepository<Transaccion, Long> {

    // Obtener todas las transacciones ordenadas por fecha descendente
    List<Transaccion> findAllByOrderByFechaDesc();

    // Buscar por tipo y rango de fechas (tipo es String porque tu columna es varchar)
    List<Transaccion> findByTipoAndFechaBetween(String tipo,
                                                LocalDateTime inicio,
                                                LocalDateTime fin);
}
