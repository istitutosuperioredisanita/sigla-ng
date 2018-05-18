package it.cnr.rsi.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Created by francesco on 07/03/17.
 */

@ConfigurationProperties("cnr.hazelcast")
public class HazelcastConfigurationProperties {
    private int port;
    private String instanceName;
    private int timeToLiveSeconds;
    private int backupCount;

    public int getPort() {
        return port;
    }

    public void setPort(int port) {
        this.port = port;
    }

    public String getInstanceName() {
        return instanceName;
    }

    public void setInstanceName(String instanceName) {
        this.instanceName = instanceName;
    }

    public int getTimeToLiveSeconds() {
        return timeToLiveSeconds;
    }

    public void setTimeToLiveSeconds(int timeToLiveSeconds) {
        this.timeToLiveSeconds = timeToLiveSeconds;
    }

    public int getBackupCount() {
        return backupCount;
    }

    public void setBackupCount(int backupCount) {
        this.backupCount = backupCount;
    }

    @Override
    public String toString() {
        return "HazelcastConfigurationProperties{" +
            "port=" + port +
            ", instanceName='" + instanceName + '\'' +
            ", timeToLiveSeconds=" + timeToLiveSeconds +
            ", backupCount=" + backupCount +
            '}';
    }
}
