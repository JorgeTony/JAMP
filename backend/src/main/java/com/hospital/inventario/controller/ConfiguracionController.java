
package com.hospital.inventario.controller;

import com.hospital.inventario.service.ConfiguracionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/configuracion")
public class ConfiguracionController {
    
    @Autowired
    private ConfiguracionService configuracionService;
    
    @GetMapping
    public String configuracion(Model model) {
        model.addAttribute("pageTitle", "Configuración - Inventarios JAMP");
        model.addAttribute("userName", "María González");
        model.addAttribute("userRole", "Administrador de Inventario");
        model.addAttribute("configuraciones", configuracionService.getConfiguraciones());
        
        return "configuracion";
    }
}
