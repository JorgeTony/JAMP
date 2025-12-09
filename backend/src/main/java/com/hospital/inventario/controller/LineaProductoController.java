
package com.hospital.inventario.controller;

import com.hospital.inventario.service.LineaProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/linea-producto")
public class LineaProductoController {
    
    @Autowired
    private LineaProductoService lineaProductoService;
    
    @GetMapping
    public String lineaProducto(Model model) {
        model.addAttribute("pageTitle", "Líneas de Producto - Inventarios JAMP");
        model.addAttribute("userName", "María González");
        model.addAttribute("userRole", "Administrador de Inventario");
        model.addAttribute("lineas", lineaProductoService.findAll());
        
        return "linea-producto";
    }
}
