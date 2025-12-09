package com.hospital.inventario.controller;

import com.hospital.inventario.service.KardexService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/kardex")
public class KardexController {

    @Autowired
    private KardexService kardexService;

    @GetMapping
    public String kardex(Model model) {
        model.addAttribute("pageTitle", "Kardex - Inventarios JAMP");
        model.addAttribute("userName", "María González");
        model.addAttribute("userRole", "Administrador de Inventario");
        model.addAttribute("movimientos", kardexService.findAll());
        return "kardex";
    }
}
