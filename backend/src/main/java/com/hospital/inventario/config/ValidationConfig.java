package com.hospital.inventario.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.validation.beanvalidation.MethodValidationPostProcessor;

import jakarta.validation.Validator;

/**
 * Configuración de Validación para el Inventarios JAMP
 * 
 * Esta configuración habilita y configura Bean Validation (JSR 380) para:
 * 1. Validación automática de entidades JPA antes de persistencia
 * 2. Validación de parámetros de métodos en controladores
 * 3. Validación de objetos de transferencia de datos (DTOs)
 * 4. Mensajes de error personalizados y localizados
 * 
 * Referencias:
 * - JSR 380 Bean Validation 2.0: https://beanvalidation.org/2.0/spec/
 * - Spring Validation: https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#validation
 * - Hibernate Validator: https://hibernate.org/validator/
 */
@Configuration
public class ValidationConfig {

    /**
     * Configuración del validador principal de Bean Validation
     * 
     * Este bean configura el validador que será utilizado por:
     * - JPA/Hibernate para validar entidades antes de persistencia
     * - Spring MVC para validar objetos en controladores
     * - Validación manual programática cuando sea necesaria
     * 
     * Características implementadas:
     * - Soporte para mensajes de error localizados
     * - Validación en cascada para objetos anidados
     * - Integración con el contexto de Spring
     * 
     * @return LocalValidatorFactoryBean configurado
     */
    @Bean
    public LocalValidatorFactoryBean validator() {
        LocalValidatorFactoryBean validatorFactoryBean = new LocalValidatorFactoryBean();
        
        // Configuración de mensajes de validación personalizados
        // Los mensajes se pueden localizar creando archivos ValidationMessages_es.properties
        validatorFactoryBean.setValidationMessageSource(messageSource());
        
        return validatorFactoryBean;
    }

    /**
     * Configuración de validación de métodos
     * 
     * Habilita la validación automática de parámetros y valores de retorno
     * en métodos anotados con @Validated. Esto es especialmente útil para:
     * - Servicios de negocio que requieren validación de entrada
     * - Controladores REST con validación de parámetros
     * - Métodos que procesan datos críticos del sistema
     * 
     * @return MethodValidationPostProcessor configurado
     */
    @Bean
    public MethodValidationPostProcessor methodValidationPostProcessor() {
        MethodValidationPostProcessor processor = new MethodValidationPostProcessor();
        processor.setValidator(validator());
        return processor;
    }

    /**
     * Fuente de mensajes para validación localizada
     * 
     * Configura la fuente de mensajes que será utilizada para mostrar
     * errores de validación en el idioma apropiado. Los mensajes se
     * definen en archivos de propiedades según el estándar i18n.
     * 
     * Archivos de mensajes soportados:
     * - ValidationMessages.properties (por defecto)
     * - ValidationMessages_es.properties (español)
     * - ValidationMessages_en.properties (inglés)
     * 
     * @return ReloadableResourceBundleMessageSource configurado
     */
    @Bean
    public org.springframework.context.support.ReloadableResourceBundleMessageSource messageSource() {
        org.springframework.context.support.ReloadableResourceBundleMessageSource messageSource = 
            new org.springframework.context.support.ReloadableResourceBundleMessageSource();
        
        // Ubicación de los archivos de mensajes de validación
        messageSource.setBasename("classpath:ValidationMessages");
        
        // Configuración de encoding para caracteres especiales (ñ, acentos, etc.)
        messageSource.setDefaultEncoding("UTF-8");
        
        // Tiempo de cache para los mensajes (en segundos)
        // -1 = cache permanente, 0 = sin cache, >0 = cache temporal
        messageSource.setCacheSeconds(3600); // 1 hora de cache
        
        return messageSource;
    }

    /**
     * Bean de validador para inyección directa
     * 
     * Proporciona acceso directo al validador para casos donde se requiere
     * validación programática manual, como en servicios de negocio complejos
     * o procesamiento de datos en lotes.
     * 
     * Ejemplo de uso:
     * <pre>
     * {@code
     * @Autowired
     * private Validator validator;
     * 
     * public void validarProducto(Producto producto) {
     *     Set<ConstraintViolation<Producto>> violations = validator.validate(producto);
     *     if (!violations.isEmpty()) {
     *         // Manejar errores de validación
     *     }
     * }
     * }
     * </pre>
     * 
     * @return Validator configurado para validación programática
     */
    @Bean
    public Validator programmaticValidator() {
        return validator().getValidator();
    }
}