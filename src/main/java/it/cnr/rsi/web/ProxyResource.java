package it.cnr.rsi.web;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.stream.Collectors;

import it.cnr.rsi.security.UserContext;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sigla")
public class ProxyResource {
	private static final Logger LOGGER = LoggerFactory.getLogger(ProxyResource.class);
	
    @GetMapping("/invoke")
    public String html(String nodoid){
    	UserContext userDetails = ContextResource.getUserDetails();
    	LOGGER.debug("Invoke proxy with userDetails: {}", userDetails);
    	return new BufferedReader(new InputStreamReader(this.getClass().getResourceAsStream("/test.html")))
    	  .lines().collect(Collectors.joining("\n"));
    }
}
