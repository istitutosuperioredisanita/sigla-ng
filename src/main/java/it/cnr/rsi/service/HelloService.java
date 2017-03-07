package it.cnr.rsi.service;

import it.cnr.rsi.domain.Hello;
import it.cnr.rsi.repository.HelloRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

import static java.util.stream.Collectors.toList;

/**
 * Created by francesco on 07/03/17.
 */

@Service
public class HelloService {

    private static final Logger LOGGER = LoggerFactory.getLogger(HelloService.class);


    private HelloRepository helloRepository;

    public HelloService(HelloRepository helloRepository) {
        this.helloRepository = helloRepository;
    }


    @Cacheable("hello")
    public List<String> hello() {

        LOGGER.info("hello");

        return helloRepository
                .findAll()
                .stream()
                .map(Hello::getName)
                .collect(toList());

    }

}
