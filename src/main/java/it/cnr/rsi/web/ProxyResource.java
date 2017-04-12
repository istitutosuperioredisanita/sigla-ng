package it.cnr.rsi.web;

import it.cnr.rsi.security.UserContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.InputStream;

@RestController
@RequestMapping("/api/sigla")
public class ProxyResource {
	private static final Logger LOGGER = LoggerFactory.getLogger(ProxyResource.class);

    @GetMapping(value ="/invoke", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<InputStreamResource> html(String nodoid){
    	UserContext userDetails = ContextResource.getUserDetails();
    	LOGGER.debug("Invoke proxy with userDetails: {}", userDetails);
        ResponseEntity<InputStreamResource> responseEntity;
        try {
            InputStream inputStream = new ClassPathResource("/test.html").getInputStream();
            InputStreamResource inputStreamResource = new InputStreamResource(inputStream);
            responseEntity = ResponseEntity.ok(inputStreamResource);
        } catch (IOException e) {
            LOGGER.error("unable to get resource", e);
            responseEntity =ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

        return responseEntity;
    }
}
