package it.cnr.rsi.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Created by francesco on 26/06/17.
 */

@ConfigurationProperties(prefix = "cnr.ajp")
public class AjpConfigurationProperties {

    private Integer timeout = 120_000;
    private Integer port = 8009;

    public Integer getPort() {
        return port;
    }

    public void setPort(Integer port) {
        this.port = port;
    }

    public Integer getTimeout() {
        return timeout;
    }

    public void setTimeout(Integer timeout) {
        this.timeout = timeout;
    }
}
