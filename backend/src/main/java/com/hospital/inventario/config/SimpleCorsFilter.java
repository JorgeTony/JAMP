package com.hospital.inventario.config;

import java.io.IOException;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SimpleCorsFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        // 🔹 Origen permitido por defecto (frontend en Railway)
        String allowedOrigin = "https://jamp-production.up.railway.app";

        // Si el Origin es uno de los que conocemos, lo devolvemos tal cual
        String origin = request.getHeader("Origin");
        if (origin != null && (
                origin.equals("https://jamp-production.up.railway.app") ||
                origin.equals("http://localhost:5173")
        )) {
            allowedOrigin = origin;
        }

        response.setHeader("Access-Control-Allow-Origin", allowedOrigin);
        response.setHeader("Vary", "Origin");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
        response.setHeader("Access-Control-Max-Age", "3600");

        // Si es preflight (OPTIONS), respondemos aquí mismo
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
        } else {
            chain.doFilter(req, res);
        }
    }
}
