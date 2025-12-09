package com.hospital.inventario.controller;

import com.hospital.inventario.service.InventarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/inventario")
public class InventarioController {

    @Autowired
    private InventarioService inventarioService;

    @GetMapping
    public String inventario(Model model) {
        model.addAttribute("pageTitle", "Inventario - Inventarios JAMP");
        model.addAttribute("userName", "María González");
        model.addAttribute("userRole", "Administrador de Inventario");
        model.addAttribute("inventarios", inventarioService.findAll());
        return "inventario";
    }
}
