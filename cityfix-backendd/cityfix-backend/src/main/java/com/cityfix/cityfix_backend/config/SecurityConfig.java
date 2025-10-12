package com.cityfix.cityfix_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/city-admins/add").hasRole("SUPER_ADMIN")
                        .requestMatchers("/api/city-admins/update/**").hasRole("SUPER_ADMIN")
                        .requestMatchers("/api/city-admins/delete/**").hasRole("SUPER_ADMIN")
                        .anyRequest().authenticated()
                )
                .httpBasic(httpBasic -> {}); // lambda style, avoids deprecation

        return http.build();
    }
}
