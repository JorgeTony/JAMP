package com.hospital.inventario.config;

import com.hospital.inventario.security.JwtAuthenticationFilter;
import com.hospital.inventario.service.UsuarioService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// 👇 IMPORTS PARA CORS
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(UsuarioService usuarioService,
                                                            PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(usuarioService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   JwtAuthenticationFilter jwtAuthenticationFilter,
                                                   DaoAuthenticationProvider authenticationProvider) throws Exception {

        http
            // 🔥 Activar CORS usando la configuración de abajo
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz

                // ✅ Dejar pasar TODOS los OPTIONS (preflight)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // --- Rutas públicas ---
                .requestMatchers("/auth/**", "/login", "/error").permitAll()
                .requestMatchers("/css/**", "/js/**", "/images/**").permitAll()

                // Lo que ya tenías
                .requestMatchers("/transacciones/api/**").permitAll()

                .requestMatchers("/configuracion/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPERVISOR")

                .requestMatchers("/reportes/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPERVISOR", "ROLE_OPERADOR")

                .requestMatchers("/productos/**", "/almacenes/**", "/inventario/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_SUPERVISOR", "ROLE_OPERADOR")

                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 👇 ESTA ES LA CONFIGURACIÓN CORS QUE DEBE USAR SPRING SECURITY
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Orígenes permitidos (PRODUCCIÓN + LOCAL)
        config.setAllowedOrigins(List.of(
            "https://jamp-production.up.railway.app", // frontend en Railway
            "http://localhost:5173"                   // Vite en local
        ));

        // Métodos HTTP permitidos
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Headers permitidos
        config.setAllowedHeaders(List.of(
            "Authorization",
            "Content-Type",
            "X-Requested-With",
            "Accept",
            "Origin"
        ));

        // Si usas JWT/cookies
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Aplicar a TODAS las rutas
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
