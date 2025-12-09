
package com.hospital.inventario.controller;

import com.hospital.inventario.service.TransaccionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/transacciones")
public class TransaccionesController {
    
    @Autowired
    private TransaccionService transaccionService;
    
    @GetMapping
    public String transacciones(Model model) {
        model.addAttribute("pageTitle", "Transacciones - Inventarios JAMP");
        model.addAttribute("userName", "María González");
        model.addAttribute("userRole", "Administrador de Inventario");
        model.addAttribute("transacciones", transaccionService.findAll());
        
        return "transacciones";
    }
}
