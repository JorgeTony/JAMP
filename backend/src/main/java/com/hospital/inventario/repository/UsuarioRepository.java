package com.hospital.inventario.repository;

import com.hospital.inventario.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    Optional<Usuario> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    List<Usuario> findByEstado(String estado);
    
    List<Usuario> findByRol(String rol);
    
    @Query("SELECT u FROM Usuario u WHERE u.estado = 'ACTIVO'")
    List<Usuario> findUsuariosActivos();
    
    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.estado = 'ACTIVO'")
    Long countUsuariosActivos();
    
    @Query("SELECT u FROM Usuario u WHERE u.nombre LIKE %?1% OR u.apellidos LIKE %?1% OR u.email LIKE %?1%")
    List<Usuario> buscarPorNombreEmailOApellidos(String termino);
}