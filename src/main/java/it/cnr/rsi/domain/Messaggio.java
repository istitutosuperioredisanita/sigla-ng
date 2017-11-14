package it.cnr.rsi.domain;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;


/**
 * The persistent class for the MESSAGGIO database table.
 */
@Entity
@NamedQuery(name = "Messaggio.findAll", query = "SELECT m FROM Messaggio m")
public class Messaggio implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "PG_MESSAGGIO")
    private Long pgMessaggio;

    // CD_UTENTE VARCHAR(20)
    @Column(name = "CD_UTENTE")
    private java.lang.String cdUtente;

    // CORPO VARCHAR(4000)
    private java.lang.String corpo;

    // DS_MESSAGGIO VARCHAR(200)
    @Column(name = "DS_MESSAGGIO")
    private java.lang.String dsMessaggio;

    // DT_FINE_VALIDITA TIMESTAMP
    @Temporal(TemporalType.DATE)
    @Column(name = "DT_FINE_VALIDITA")
    private Date dtFineValidita;

    // DT_INIZIO_VALIDITA TIMESTAMP
    @Temporal(TemporalType.DATE)
    @Column(name = "DT_INIZIO_VALIDITA")
    private Date dtInizioValidita;

    // PRIORITA DECIMAL(1,0) NOT NULL
    private java.lang.Integer priorita;

    // SERVER_URL VARCHAR(30)
    @Column(name = "SERVER_URL")
    private java.lang.String serverUrl;

    // SOGGETTO VARCHAR(200) NOT NULL
    private java.lang.String soggetto;

    @Temporal(TemporalType.DATE)
    private Date dacr;

    @Temporal(TemporalType.DATE)
    private Date duva;

    @Column(name = "PG_VER_REC")
    private BigDecimal pgVerRec;

    private String utcr;

    private String utuv;

    public Messaggio() {
    }

    public Messaggio(Long pgMessaggio) {
        this.pgMessaggio = pgMessaggio;
    }

    public Long getPgMessaggio() {
        return pgMessaggio;
    }

    public void setPgMessaggio(Long pgMessaggio) {
        this.pgMessaggio = pgMessaggio;
    }

    public String getCdUtente() {
        return cdUtente;
    }

    public void setCdUtente(String cdUtente) {
        this.cdUtente = cdUtente;
    }

    public String getCorpo() {
        return corpo;
    }

    public void setCorpo(String corpo) {
        this.corpo = corpo;
    }

    public String getDsMessaggio() {
        return dsMessaggio;
    }

    public void setDsMessaggio(String dsMessaggio) {
        this.dsMessaggio = dsMessaggio;
    }

    public Date getDtFineValidita() {
        return dtFineValidita;
    }

    public void setDtFineValidita(Date dtFineValidita) {
        this.dtFineValidita = dtFineValidita;
    }

    public Date getDtInizioValidita() {
        return dtInizioValidita;
    }

    public void setDtInizioValidita(Date dtInizioValidita) {
        this.dtInizioValidita = dtInizioValidita;
    }

    public Integer getPriorita() {
        return priorita;
    }

    public void setPriorita(Integer priorita) {
        this.priorita = priorita;
    }

    public String getServerUrl() {
        return serverUrl;
    }

    public void setServerUrl(String serverUrl) {
        this.serverUrl = serverUrl;
    }

    public String getSoggetto() {
        return soggetto;
    }

    public void setSoggetto(String soggetto) {
        this.soggetto = soggetto;
    }

    public Date getDacr() {
        return dacr;
    }

    public void setDacr(Date dacr) {
        this.dacr = dacr;
    }

    public Date getDuva() {
        return duva;
    }

    public void setDuva(Date duva) {
        this.duva = duva;
    }

    public BigDecimal getPgVerRec() {
        return pgVerRec;
    }

    public void setPgVerRec(BigDecimal pgVerRec) {
        this.pgVerRec = pgVerRec;
    }

    public String getUtcr() {
        return utcr;
    }

    public void setUtcr(String utcr) {
        this.utcr = utcr;
    }

    public String getUtuv() {
        return utuv;
    }

    public void setUtuv(String utuv) {
        this.utuv = utuv;
    }
}
