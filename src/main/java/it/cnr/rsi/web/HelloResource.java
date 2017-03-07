package it.cnr.rsi.web;

import it.cnr.rsi.domain.Hello;
import it.cnr.rsi.repository.HelloRepository;
import it.cnr.rsi.service.HelloService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Created by francesco on 07/03/17.
 */

@RestController
public class HelloResource {

    private static final Logger LOGGER = LoggerFactory.getLogger(HelloResource.class);

    public static final String API_HELLO = "/api/hello";

    private HelloRepository helloRepository;

    private HelloService helloService;

    public HelloResource(HelloRepository helloRepository, HelloService helloService) {
        this.helloRepository = helloRepository;
        this.helloService = helloService;
    }


    @GetMapping(API_HELLO)
    public List<String> hello(){
        LOGGER.info("hello");
        return helloService.hello();
    }

    @PostMapping(value = "/api/hello", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Hello helloPost(@RequestBody Hello hello) {
        return helloRepository.saveAndFlush(hello);
    }

}
