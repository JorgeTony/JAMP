
package com.hospital.inventario.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/dashboard")
public class DashboardController {
    
    @GetMapping
    public String dashboard(Model model) {
        model.addAttribute("pageTitle", "Dashboard - Inventarios JAMP");
        model.addAttribute("userName", "María González");
        model.addAttribute("userRole", "Administrador de Inventario");
        
        // Datos para las métricas del dashboard
        model.addAttribute("totalProductos", 1247);
        model.addAttribute("stockBajo", 23);
        model.addAttribute("transaccionesHoy", 156);
        model.addAttribute("valorInventario", "S/ 2,847,392");
        
        return "dashboard";
    }
}
