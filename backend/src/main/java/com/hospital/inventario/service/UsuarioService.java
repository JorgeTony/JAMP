package com.hospital.inventario.service;

import com.hospital.inventario.model.Usuario;
import com.hospital.inventario.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UsuarioService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));

        usuario.setUltimoAcceso(LocalDateTime.now());
        usuarioRepository.save(usuario);

        return usuario;
    }

    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> findById(Long id) {
        return usuarioRepository.findById(id);
    }

    public Optional<Usuario> findByEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

   public Usuario save(Usuario usuario) {
    boolean esNuevo = (usuario.getId() == null);

    // Encriptar contraseña si viene en texto plano
    if (usuario.getPassword() != null && !usuario.getPassword().startsWith("$2a$")) {
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
    }

    // Normalizar rol (solo quitar espacios, sin cambiar mayúsculas/minúsculas)
    if (usuario.getRol() != null) {
        usuario.setRol(usuario.getRol().trim());
    }

    // Evitar NOT NULL en 'codigo' en el primer insert
    if (esNuevo && (usuario.getCodigo() == null || usuario.getCodigo().isBlank())) {
        usuario.setCodigo("TMP-" + java.util.UUID.randomUUID());
    }

    Usuario guardado = usuarioRepository.save(usuario);

    // Una vez que tenemos ID, generamos código definitivo
    if (esNuevo) {
        String codigoGenerado = String.format("USR%03d", guardado.getId());
        guardado.setCodigo(codigoGenerado);
        guardado = usuarioRepository.save(guardado);
    }

    return guardado;
}


    /** Borrado físico (por si lo usas en otros lados) */
    public void deleteById(Long id) {
        usuarioRepository.deleteById(id);
    }

    /** Borrado lógico: estado = INACTIVO */
    public void desactivarUsuario(Long id) {
        usuarioRepository.findById(id).ifPresent(u -> {
            u.setEstado("INACTIVO");
            usuarioRepository.save(u);
        });
    }

    public boolean existsByEmail(String email) {
        return usuarioRepository.existsByEmail(email);
    }

    public List<Usuario> findUsuariosActivos() {
        return usuarioRepository.findUsuariosActivos();
    }

    public List<Usuario> findByRol(String rol) {
        return usuarioRepository.findByRol(rol);
    }

    public List<Usuario> buscarUsuarios(String termino) {
        if (termino == null || termino.trim().isEmpty()) {
            return usuarioRepository.findAll();
        }
        return usuarioRepository.buscarPorNombreEmailOApellidos(termino.trim());
    }

    public Long countUsuariosActivos() {
        return usuarioRepository.countUsuariosActivos();
    }

    public boolean validarCredenciales(String email, String password) {
        Optional<Usuario> usuario = usuarioRepository.findByEmail(email);
        if (usuario.isPresent() && "ACTIVO".equals(usuario.get().getEstado())) {
            return passwordEncoder.matches(password, usuario.get().getPassword());
        }
        return false;
    }
}
