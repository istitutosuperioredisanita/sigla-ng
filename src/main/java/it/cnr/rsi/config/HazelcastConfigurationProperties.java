/*
 * Copyright (C) 2019  Consiglio Nazionale delle Ricerche
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as
 *     published by the Free Software Foundation, either version 3 of the
 *     License, or (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

package it.cnr.rsi.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Created by francesco on 07/03/17.
 */

@ConfigurationProperties("cnr.hazelcast")
public class HazelcastConfigurationProperties {
    private int port = 5701;
    private String instanceName;
    private int timeToLiveSeconds;
    private int backupCount;
    private String members;
    private Integer multicastport;
    private String publicadress;

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

    public String getMembers() {
        return members;
    }

    public Integer getMulticastport() {
        return multicastport;
    }

    public void setMulticastport(Integer multicastport) {
        this.multicastport = multicastport;
    }

    public String getPublicadress() {
        return publicadress;
    }

    public void setPublicadress(String publicadress) {
        this.publicadress = publicadress;
    }

    public HazelcastConfigurationProperties setMembers(String members) {
        this.members = members;
        return this;
    }

    @Override
    public String toString() {
        return "HazelcastConfigurationProperties{" +
            "port=" + port +
            ", instanceName='" + instanceName + '\'' +
            ", timeToLiveSeconds=" + timeToLiveSeconds +
            ", backupCount=" + backupCount +
            ", members='" + members + '\'' +
            ", multicastport=" + multicastport +
            ", publicadress='" + publicadress + '\'' +
            '}';
    }
}
