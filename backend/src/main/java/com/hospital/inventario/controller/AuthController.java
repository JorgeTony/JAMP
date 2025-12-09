package com.hospital.inventario.controller;

import com.hospital.inventario.model.Usuario;
import com.hospital.inventario.security.JwtUtil;
import com.hospital.inventario.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UsuarioService usuarioService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            // Autenticar usuario
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(), 
                    loginRequest.getPassword()
                )
            );
            
            // Cargar detalles del usuario
            UserDetails userDetails = usuarioService.loadUserByUsername(loginRequest.getEmail());
            Usuario usuario = usuarioService.findByEmail(loginRequest.getEmail()).orElse(null);
            
            if (usuario == null || !"ACTIVO".equals(usuario.getEstado())) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Usuario inactivo o no encontrado"));
            }
            
            // Generar token JWT
            Map<String, Object> claims = new HashMap<>();
            claims.put("rol", usuario.getRol());
            claims.put("nombre", usuario.getNombreCompleto());
            claims.put("id", usuario.getId());
            
            String token = jwtUtil.generateToken(userDetails, claims);
            
            // Respuesta exitosa
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("usuario", Map.of(
                "id", usuario.getId(),
                "email", usuario.getEmail(),
                "nombre", usuario.getNombreCompleto(),
                "rol", usuario.getRol(),
                "departamento", usuario.getDepartamento() != null ? usuario.getDepartamento() : ""
            ));
            response.put("message", "Login exitoso");
            
            return ResponseEntity.ok(response);
            
        } catch (BadCredentialsException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Credenciales inválidas"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Error en el login: " + e.getMessage()));
        }
    }
    
    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String email = jwtUtil.extractUsername(token);
                
                if (email != null && jwtUtil.validateToken(token)) {
                    Usuario usuario = usuarioService.findByEmail(email).orElse(null);
                    if (usuario != null && "ACTIVO".equals(usuario.getEstado())) {
                        return ResponseEntity.ok(Map.of(
                            "valid", true,
                            "usuario", Map.of(
                                "id", usuario.getId(),
                                "email", usuario.getEmail(),
                                "nombre", usuario.getNombreCompleto(),
                                "rol", usuario.getRol()
                            )
                        ));
                    }
                }
            }
            return ResponseEntity.badRequest().body(Map.of("valid", false));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "error", e.getMessage()));
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // En JWT stateless, el logout se maneja en el frontend eliminando el token
        return ResponseEntity.ok(Map.of("message", "Logout exitoso"));
    }
    
    // Clase interna para el request de login
    public static class LoginRequest {
        private String email;
        private String password;
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}