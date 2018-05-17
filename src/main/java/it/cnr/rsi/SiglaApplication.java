package it.cnr.rsi;

import org.apache.catalina.connector.Connector;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.embedded.EmbeddedServletContainerFactory;
import org.springframework.boot.context.embedded.tomcat.TomcatEmbeddedServletContainerFactory;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SiglaApplication {

	public static void main(String[] args) {
		SpringApplication.run(SiglaApplication.class, args);
	}
    @Value("${tomcatAjp.protocol}")
    String ajpProtocol;

    @Value("${tomcatAjp.port}")
    String ajpPort;

    @Value("${tomcatAjp.enabled}")
    String ajpEnabled;

    @Value("${tomcatAjp.scheme}")
    String ajpScheme;
    @Bean
    public EmbeddedServletContainerFactory servletContainer() {

        Integer ajpPortInt = Integer.parseInt(ajpPort);
        Boolean ajpEnabledBool = Boolean.valueOf(ajpEnabled);

        TomcatEmbeddedServletContainerFactory tomcat = new TomcatEmbeddedServletContainerFactory();
        if (ajpEnabledBool)
        {
            Connector ajpConnector = new Connector(ajpProtocol);
            ajpConnector.setPort(ajpPortInt);
            ajpConnector.setSecure(false);
            ajpConnector.setAllowTrace(false);
            ajpConnector.setScheme(ajpScheme);
            tomcat.addAdditionalTomcatConnectors(ajpConnector);
        }

        return tomcat;
    }

}
