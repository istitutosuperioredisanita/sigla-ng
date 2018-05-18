package it.cnr.rsi.config;


import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.web.SessionListener;
import com.hazelcast.web.spring.SpringAwareWebFilter;
import org.apache.catalina.connector.Connector;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.embedded.EmbeddedServletContainerFactory;
import org.springframework.boot.context.embedded.tomcat.TomcatEmbeddedServletContainerFactory;
import org.springframework.boot.web.servlet.ServletContextInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.servlet.DispatcherType;
import javax.servlet.FilterRegistration;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;


/**
 * Configuration of web application with Servlet 3.0 APIs.
 */
@Configuration
public class WebConfigurer implements ServletContextInitializer {

    private final Logger log = LoggerFactory.getLogger(WebConfigurer.class);
    private final HazelcastInstance hazelcastInstance;
    @Value("${tomcatAjp.protocol}")
    String ajpProtocol;
    @Value("${tomcatAjp.port}")
    String ajpPort;
    @Value("${tomcatAjp.enabled}")
    String ajpEnabled;
    @Value("${tomcatAjp.scheme}")
    String ajpScheme;

    public WebConfigurer(HazelcastInstance hazelcastInstance) {
        this.hazelcastInstance = hazelcastInstance;
    }

    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {
        EnumSet<DispatcherType> disps = EnumSet.of(DispatcherType.REQUEST, DispatcherType.FORWARD, DispatcherType.ASYNC);

        log.warn("enable clustered sessions");

//        initClusteredHttpSessionFilter(servletContext, disps);
        log.info("Web application fully configured");
    }

    /**
     * Initializes the Clustered Http Session filter
     */
    private void initClusteredHttpSessionFilter(ServletContext servletContext, EnumSet<DispatcherType> disps) {
        log.debug("Registering Clustered Http Session Filter");
        servletContext.addListener(new SessionListener());

        FilterRegistration.Dynamic hazelcastWebFilter = servletContext.addFilter("hazelcastWebFilter", new SpringAwareWebFilter());
        Map<String, String> parameters = new HashMap<>();
        parameters.put("instance-name", hazelcastInstance.getName());
        // Name of the distributed map storing your web session objects
        parameters.put("map-name", "clustered-http-sessions");

        // How is your load-balancer configured?
        // Setting "sticky-session" to "true" means all requests of a session
        // are routed to the node where the session is first created.
        // This is excellent for performance.
        // If "sticky-session" is set to "false", then when a session is updated
        // on a node, entries for this session on all other nodes are invalidated.
        // You have to know how your load-balancer is configured before
        // setting this parameter. Default is true.
        parameters.put("sticky-session", "true");

        // Name of session id cookie
        parameters.put("cookie-name", "hazelcast.sessionId");


        // Do you want to shutdown HazelcastInstance during
        // web application undeploy process?
        // Default is true.
        parameters.put("shutdown-on-destroy", "true");

        hazelcastWebFilter.setInitParameters(parameters);
        hazelcastWebFilter.addMappingForUrlPatterns(disps, true, "/*");
        hazelcastWebFilter.setAsyncSupported(true);
    }

    @Bean
    public EmbeddedServletContainerFactory servletContainer() {

        Integer ajpPortInt = Integer.parseInt(ajpPort);
        Boolean ajpEnabledBool = Boolean.valueOf(ajpEnabled);

        TomcatEmbeddedServletContainerFactory tomcat = new TomcatEmbeddedServletContainerFactory();
        if (ajpEnabledBool) {
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
