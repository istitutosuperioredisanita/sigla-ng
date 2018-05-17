package it.cnr.rsi.config;

import org.apache.catalina.connector.Connector;
import org.apache.catalina.valves.RemoteIpValve;
import org.apache.coyote.ProtocolHandler;
import org.apache.coyote.ajp.AjpNioProtocol;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.embedded.EmbeddedServletContainerFactory;
import org.springframework.boot.context.embedded.tomcat.TomcatEmbeddedServletContainerFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Created by francesco on 03/07/15.
 */

@Configuration
@ConditionalOnProperty(prefix = "cnr.ajp", name = {"port", "timeout"})
@EnableConfigurationProperties(AjpConfigurationProperties.class)
public class AjpConfiguration {

    private static final Logger log = LoggerFactory.getLogger(AjpConfiguration.class);

    @Bean
    public EmbeddedServletContainerFactory servletContainer(AjpConfigurationProperties ajpConfigurationProperties) {
        TomcatEmbeddedServletContainerFactory tomcat = new TomcatEmbeddedServletContainerFactory();

        Connector connector = new Connector("AJP/1.3");
        connector.setPort(ajpConfigurationProperties.getPort());

        ProtocolHandler p = connector.getProtocolHandler();

        if (p instanceof AjpNioProtocol) {
            log.info("set ajp timeout to " + ajpConfigurationProperties.getTimeout());
            AjpNioProtocol a = (AjpNioProtocol) p;
            a.setConnectionTimeout(ajpConfigurationProperties.getTimeout());
        } else {
            log.warn("error setting AJP connection timeout, using default");
        }

        tomcat.addAdditionalTomcatConnectors(connector);
        tomcat.addContextValves(AjpConfiguration.createRemoteIpValves());
        return tomcat;
    }

    private static RemoteIpValve createRemoteIpValves() {
        RemoteIpValve remoteIpValve = new RemoteIpValve();
        remoteIpValve.setRemoteIpHeader("x-forwarded-for");
        remoteIpValve.setProtocolHeader("x-forwarded-proto");
        return remoteIpValve;
    }


}
