package com.cityfix.cityfix_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SuperAdminConfig {

    private final PasswordEncoder passwordEncoder;

    public SuperAdminConfig(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public UserDetailsService users() {
        UserDetails superAdmin = User.builder()
                .username("superadmin@google.com")
                .password(passwordEncoder.encode("Temp@123"))
                .roles("SUPER_ADMIN")
                .build();

        return new InMemoryUserDetailsManager(superAdmin);
    }
}
