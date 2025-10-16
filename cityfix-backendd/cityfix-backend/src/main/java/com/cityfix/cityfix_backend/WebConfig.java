package com.cityfix.cityfix_backend; // make sure this matches your main package

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded citizen profile pictures
        registry.addResourceHandler("/uploads/citizens/**")
                .addResourceLocations("file:uploads/citizens/");

        // Serve uploaded department logos
        registry.addResourceHandler("/uploads/department/**")
                .addResourceLocations("file:uploads/department/");
    }
}
