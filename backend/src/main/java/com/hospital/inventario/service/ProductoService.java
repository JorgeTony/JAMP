
package com.hospital.inventario.service;

import com.hospital.inventario.model.Producto;
import com.hospital.inventario.repository.ProductoRepository;
import com.hospital.inventario.decorator.ProductoDecorator;
import com.hospital.inventario.decorator.ProductoConDescuento;
import com.hospital.inventario.decorator.ProductoConAlerta;
import com.hospital.inventario.memento.ProductoCaretaker;
import com.hospital.inventario.memento.ProductoMemento;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {
    
    @Autowired
    private ProductoRepository productoRepository;
    
    @Autowired
    private ProductoCaretaker productoCaretaker;
    
    public List<Producto> findAll() {
        return productoRepository.findAll();
    }
    
    public Optional<Producto> findById(Long id) {
        return productoRepository.findById(id);
    }
    
    public Producto save(Producto producto) {
        // Patrón Memento - Guardar estado antes de modificar
        if (producto.getId() != null) {
            Optional<Producto> productoExistente = productoRepository.findById(producto.getId());
            if (productoExistente.isPresent()) {
                ProductoMemento memento = productoExistente.get().crearMemento("ACTUALIZACIÓN");
                productoCaretaker.guardarMemento(producto.getId(), memento);
            }
        }
        
        Producto productoGuardado = productoRepository.save(producto);
        
        // Guardar memento después de guardar
        if (productoGuardado.getId() != null) {
            ProductoMemento mementoNuevo = productoGuardado.crearMemento(
                producto.getId() == null ? "CREACIÓN" : "ACTUALIZACIÓN"
            );
            productoCaretaker.guardarMemento(productoGuardado.getId(), mementoNuevo);
        }
        
        return productoGuardado;
    }
    
    public void deleteById(Long id) {
        // Patrón Memento - Guardar estado antes de eliminar
        Optional<Producto> producto = productoRepository.findById(id);
        if (producto.isPresent()) {
            ProductoMemento memento = producto.get().crearMemento("ELIMINACIÓN");
            productoCaretaker.guardarMemento(id, memento);
        }
        
        productoRepository.deleteById(id);
    }
    
    public boolean existsByCodigo(String codigo) {
        return productoRepository.existsByCodigo(codigo);
    }
    
    public boolean existsByCodigoAndIdNot(String codigo, Long id) {
        return productoRepository.existsByCodigoAndIdNot(codigo, id);
    }
    
    public List<Producto> findByCategoria(String categoria) {
        return productoRepository.findByCategoria(categoria);
    }
    
    public List<Producto> buscarPorNombreOCodigo(String termino) {
        return productoRepository.buscarPorNombreOCodigo(termino);
    }
    
    public List<Producto> findProductosStockBajo() {
        return productoRepository.findProductosStockBajo();
    }
    
    public Long countProductosActivos() {
        return productoRepository.countProductosActivos();
    }
    
    public Double getValorTotalInventario() {
        Double valor = productoRepository.getValorTotalInventario();
        return valor != null ? valor : 0.0;
    }
    
    public Long countProductosStockBajo() {
        return productoRepository.countProductosStockBajo();
    }
    
    public List<Producto> searchProductos(String nombre, String categoria, String estado) {
        if ((nombre == null || nombre.trim().isEmpty()) && 
            (categoria == null || categoria.trim().isEmpty()) && 
            (estado == null || estado.trim().isEmpty())) {
            return productoRepository.findAll();
        }
        
        if (nombre != null && !nombre.trim().isEmpty()) {
            return productoRepository.buscarPorNombreOCodigo(nombre.trim());
        }
        
        if (categoria != null && !categoria.trim().isEmpty()) {
            return productoRepository.findByCategoria(categoria.trim());
        }
        
        return productoRepository.findAll();
    }
    
    public List<String> findAllCategorias() {
        List<Producto> productos = productoRepository.findAll();
        return productos.stream()
                .map(Producto::getCategoria)
                .filter(categoria -> categoria != null && !categoria.trim().isEmpty())
                .distinct()
                .sorted()
                .toList();
    }
    
    // ========== MÉTODOS PARA PATRONES DE DISEÑO ==========
    
    // Patrón State - Métodos para cambiar estados
    public Producto activarProducto(Long id) {
        Optional<Producto> productoOpt = productoRepository.findById(id);
        if (productoOpt.isPresent()) {
            Producto producto = productoOpt.get();
            producto.activar();
            return save(producto);
        }
        throw new RuntimeException("Producto no encontrado con ID: " + id);
    }
    
    public Producto desactivarProducto(Long id) {
        Optional<Producto> productoOpt = productoRepository.findById(id);
        if (productoOpt.isPresent()) {
            Producto producto = productoOpt.get();
            producto.desactivar();
            return save(producto);
        }
        throw new RuntimeException("Producto no encontrado con ID: " + id);
    }
    
    public Producto descontinuarProducto(Long id) {
        Optional<Producto> productoOpt = productoRepository.findById(id);
        if (productoOpt.isPresent()) {
            Producto producto = productoOpt.get();
            producto.descontinuar();
            return save(producto);
        }
        throw new RuntimeException("Producto no encontrado con ID: " + id);
    }
    
    public Producto reactivarProducto(Long id) {
        Optional<Producto> productoOpt = productoRepository.findById(id);
        if (productoOpt.isPresent()) {
            Producto producto = productoOpt.get();
            producto.reactivar();
            return save(producto);
        }
        throw new RuntimeException("Producto no encontrado con ID: " + id);
    }
    
    // Patrón Decorator - Métodos para decorar productos
    public ProductoConDescuento aplicarDescuento(Long id, Double porcentaje, String motivo) {
        Optional<Producto> productoOpt = productoRepository.findById(id);
        if (productoOpt.isPresent()) {
            return new ProductoConDescuento(productoOpt.get(), porcentaje, motivo);
        }
        throw new RuntimeException("Producto no encontrado con ID: " + id);
    }
    
    public ProductoConAlerta agregarAlerta(Long id, String tipoAlerta, String mensaje) {
        Optional<Producto> productoOpt = productoRepository.findById(id);
        if (productoOpt.isPresent()) {
            return new ProductoConAlerta(productoOpt.get(), tipoAlerta, mensaje);
        }
        throw new RuntimeException("Producto no encontrado con ID: " + id);
    }
    
    public List<ProductoConAlerta> getProductosConAlertaStockBajo() {
        List<Producto> productosStockBajo = findProductosStockBajo();
        return productosStockBajo.stream()
                .map(producto -> new ProductoConAlerta(
                    producto, 
                    "STOCK_BAJO", 
                    "Stock actual: " + producto.getStock() + " (Mínimo: " + producto.getStockMinimo() + ")"
                ))
                .toList();
    }
    
    // Patrón Memento - Métodos para gestionar historial
    public List<ProductoMemento> getHistorialProducto(Long id) {
        return productoCaretaker.getHistorial(id);
    }
    
    public ProductoMemento getUltimoMemento(Long id) {
        return productoCaretaker.getUltimoMemento(id);
    }
    
    public Producto restaurarProducto(Long id) {
        ProductoMemento mementoAnterior = productoCaretaker.getMementoAnterior(id);
        if (mementoAnterior != null) {
            Optional<Producto> productoOpt = productoRepository.findById(id);
            if (productoOpt.isPresent()) {
                Producto producto = productoOpt.get();
                producto.restaurarDesdeMemento(mementoAnterior);
                return save(producto);
            }
        }
        throw new RuntimeException("No se puede restaurar el producto con ID: " + id);
    }
    
    public List<ProductoMemento> getCambiosRecientes(int limite) {
        return productoCaretaker.getTodosLosCambiosRecientes(limite);
    }
    
    public void limpiarHistorialProducto(Long id) {
        productoCaretaker.limpiarHistorial(id);
    }
    
    // Métodos de análisis con patrones
    public List<Producto> getProductosQueNecesitanAtencion() {
        return productoRepository.findAll().stream()
                .filter(producto -> !producto.puedeVenderse() || producto.tieneStockBajo())
                .toList();
    }
    
    public String getEstadoDetalladoProducto(Long id) {
        Optional<Producto> productoOpt = productoRepository.findById(id);
        if (productoOpt.isPresent()) {
            Producto producto = productoOpt.get();
            return producto.getDescripcionEstado();
        }
        return "Producto no encontrado";
    }
}
