package com.magda.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Em produção o Spring Boot serve o frontend React (build estático).
 * Qualquer rota que não seja /api/** redireciona para o index.html do React.
 */
@Controller
public class SpaController {

    @RequestMapping(value = {
        "/", "/history", "/evaluate"
    })
    public String index() {
        return "forward:/index.html";
    }
}
