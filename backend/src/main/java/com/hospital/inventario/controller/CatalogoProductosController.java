
package com.hospital.inventario.controller;

import com.hospital.inventario.model.Producto;
import com.hospital.inventario.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/catalogo-productos")
@CrossOrigin(origins = "http://localhost:5173")
public class CatalogoProductosController {
    
    @Autowired
    private ProductoService productoService;
    
    @GetMapping
    public String catalogoProductos(Model model) {
        model.addAttribute("pageTitle", "Catálogo de Productos - Inventarios JAMP");
        model.addAttribute("userName", "María González");
        model.addAttribute("userRole", "Administrador de Inventario");
        
        return "catalogo-productos";
    }
    
    // API REST Endpoints
    @GetMapping("/api")
    @ResponseBody
    public ResponseEntity<List<Producto>> getAllProductos() {
        try {
            List<Producto> productos = productoService.findAll();
            System.out.println("Productos encontrados: " + productos.size());
            return ResponseEntity.ok(productos);
        } catch (Exception e) {
            System.err.println("Error al obtener productos: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/api")
    @ResponseBody
    public ResponseEntity<Producto> createProducto(@RequestBody Producto producto) {
        try {
            System.out.println("Creando producto: " + producto.getNombre());
            System.out.println("Código: " + producto.getCodigo());
            System.out.println("Categoría: " + producto.getCategoria());
            System.out.println("Precio: " + producto.getPrecio());
            
            Producto nuevoProducto = productoService.save(producto);
            System.out.println("Producto creado con ID: " + nuevoProducto.getId());
            
            return ResponseEntity.ok(nuevoProducto);
        } catch (Exception e) {
            System.err.println("Error al crear producto: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/api/{id}")
    @ResponseBody
    public ResponseEntity<Producto> updateProducto(@PathVariable Long id, @RequestBody Producto producto) {
        try {
            System.out.println("Actualizando producto ID: " + id);
            Optional<Producto> productoExistente = productoService.findById(id);
            if (productoExistente.isPresent()) {
                producto.setId(id);
                Producto productoActualizado = productoService.save(producto);
                System.out.println("Producto actualizado: " + productoActualizado.getNombre());
                return ResponseEntity.ok(productoActualizado);
            } else {
                System.err.println("Producto no encontrado con ID: " + id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error al actualizar producto: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/api/{id}")
    @ResponseBody
    public ResponseEntity<Void> deleteProducto(@PathVariable Long id) {
        try {
            System.out.println("Eliminando producto ID: " + id);
            if (productoService.findById(id).isPresent()) {
                productoService.deleteById(id);
                System.out.println("Producto eliminado exitosamente");
                return ResponseEntity.ok().build();
            } else {
                System.err.println("Producto no encontrado con ID: " + id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error al eliminar producto: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/api/search")
    @ResponseBody
    public ResponseEntity<List<Producto>> searchProductos(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String estado) {
        
        try {
            List<Producto> productos = productoService.searchProductos(nombre, categoria, estado);
            return ResponseEntity.ok(productos);
        } catch (Exception e) {
            System.err.println("Error en búsqueda: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/api/categorias")
    @ResponseBody
    public ResponseEntity<List<String>> getCategorias() {
        try {
            List<String> categorias = productoService.findAllCategorias();
            return ResponseEntity.ok(categorias);
        } catch (Exception e) {
            System.err.println("Error al obtener categorías: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
