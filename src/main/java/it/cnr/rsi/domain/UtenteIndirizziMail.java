package it.cnr.rsi.domain;

import it.cnr.rsi.domain.converter.BooleanToYNStringConverter;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;


/**
 * The persistent class for the UTENTE_GESTORE database table.
 */
@Entity
@Table(name = "UTENTE_INDIRIZZI_MAIL")
@NamedQuery(name = "UtenteIndirizziMail.findAll", query = "SELECT u FROM UtenteIndirizziMail u")
public class UtenteIndirizziMail implements Serializable {
    private static final long serialVersionUID = 1L;

    @EmbeddedId
    private UtenteIndirizziMailPK id;

    /**
     * Invia errore di mancata approvazione Variazioni al Bilancio dell'Ente
     */
    @Convert(converter = BooleanToYNStringConverter.class)
    @Column(name = "FL_ERR_APPR_VAR_BIL_CNR_RES")
    private Boolean erroreMancataApprovazioneVarBilancioRes;

    /**
     * Comunica avvenuta approvazione Variazioni allo Stanziamento Residuo
     */
    @Convert(converter = BooleanToYNStringConverter.class)
    @Column(name = "FL_COM_APP_VAR_STANZ_RES")
    private Boolean approvazioneVarStanziamentoResiduo;

    /**
     * Invia errore di mancata approvazione Variazioni al Bilancio dell'Ente generate da Variazioni alla Competenza
     */
    @Convert(converter = BooleanToYNStringConverter.class)
    @Column(name = "FL_ERR_APPR_VAR_BIL_CNR_COMP")
    private Boolean erroreMancataApprovazioneVarBilancioComp;

    /**
     * Comunica avvenuta approvazione Variazioni alla Competenza
     */
    @Convert(converter = BooleanToYNStringConverter.class)
    @Column(name = "FL_COM_APP_VAR_STANZ_COMP")
    private Boolean approvazioneVarStanziamentoCompetenza;

    /**
     * Comunicazione Via Mail dell'esito positivo della Fatturazione Elettronica attiva
     */
    @Convert(converter = BooleanToYNStringConverter.class)
    @Column(name = "FL_ESITO_POS_FATT_ELETTR")
    private Boolean esitoPositivoFattElettronicaAttiva;

    /**
     * Comunicazione Via Mail dell'esito negativo della Fatturazione Elettronica attiva
     */
    @Convert(converter = BooleanToYNStringConverter.class)
    @Column(name = "FL_ESITO_NEG_FATT_ELETTR")
    private Boolean esitoNegativoFattElettronicaAttiva;

    /**
     * Comunicazione Via Mail ricezione fattura passiva
     */
    @Convert(converter = BooleanToYNStringConverter.class)
    @Column(name = "FL_FEP_NOTIFICA_RICEZIONE")
    private Boolean notificaRicezioneFatturaPassiva;

    @Temporal(TemporalType.DATE)
    private Date dacr;

    @Temporal(TemporalType.DATE)
    private Date duva;

    @Column(name = "PG_VER_REC")
    private BigDecimal pgVerRec;

    private String utcr;

    private String utuv;

    //bi-directional many-to-one association to Utente
    @ManyToOne
    @JoinColumn(name = "CD_UTENTE", insertable = false, updatable = false)
    @JsonIgnore
    private Utente utente;

    public UtenteIndirizziMail() {
    }

    public UtenteIndirizziMailPK getId() {
        return this.id;
    }

    public void setId(UtenteIndirizziMailPK id) {
        this.id = id;
    }

    public Boolean getErroreMancataApprovazioneVarBilancioRes() {
        return erroreMancataApprovazioneVarBilancioRes;
    }

    public void setErroreMancataApprovazioneVarBilancioRes(Boolean erroreMancataApprovazioneVarBilancioRes) {
        this.erroreMancataApprovazioneVarBilancioRes = erroreMancataApprovazioneVarBilancioRes;
    }

    public Boolean getApprovazioneVarStanziamentoResiduo() {
        return approvazioneVarStanziamentoResiduo;
    }

    public void setApprovazioneVarStanziamentoResiduo(Boolean approvazioneVarStanziamentoResiduo) {
        this.approvazioneVarStanziamentoResiduo = approvazioneVarStanziamentoResiduo;
    }

    public Boolean getErroreMancataApprovazioneVarBilancioComp() {
        return erroreMancataApprovazioneVarBilancioComp;
    }

    public void setErroreMancataApprovazioneVarBilancioComp(Boolean erroreMancataApprovazioneVarBilancioComp) {
        this.erroreMancataApprovazioneVarBilancioComp = erroreMancataApprovazioneVarBilancioComp;
    }

    public Boolean getApprovazioneVarStanziamentoCompetenza() {
        return approvazioneVarStanziamentoCompetenza;
    }

    public void setApprovazioneVarStanziamentoCompetenza(Boolean approvazioneVarStanziamentoCompetenza) {
        this.approvazioneVarStanziamentoCompetenza = approvazioneVarStanziamentoCompetenza;
    }

    public Boolean getEsitoPositivoFattElettronicaAttiva() {
        return esitoPositivoFattElettronicaAttiva;
    }

    public void setEsitoPositivoFattElettronicaAttiva(Boolean esitoPositivoFattElettronicaAttiva) {
        this.esitoPositivoFattElettronicaAttiva = esitoPositivoFattElettronicaAttiva;
    }

    public Boolean getEsitoNegativoFattElettronicaAttiva() {
        return esitoNegativoFattElettronicaAttiva;
    }

    public void setEsitoNegativoFattElettronicaAttiva(Boolean esitoNegativoFattElettronicaAttiva) {
        this.esitoNegativoFattElettronicaAttiva = esitoNegativoFattElettronicaAttiva;
    }

    public Boolean getNotificaRicezioneFatturaPassiva() {
        return notificaRicezioneFatturaPassiva;
    }

    public void setNotificaRicezioneFatturaPassiva(Boolean notificaRicezioneFatturaPassiva) {
        this.notificaRicezioneFatturaPassiva = notificaRicezioneFatturaPassiva;
    }

    public Date getDacr() {
        return this.dacr;
    }

    public void setDacr(Date dacr) {
        this.dacr = dacr;
    }

    public Date getDuva() {
        return this.duva;
    }

    public void setDuva(Date duva) {
        this.duva = duva;
    }

    public BigDecimal getPgVerRec() {
        return this.pgVerRec;
    }

    public void setPgVerRec(BigDecimal pgVerRec) {
        this.pgVerRec = pgVerRec;
    }

    public String getUtcr() {
        return this.utcr;
    }

    public void setUtcr(String utcr) {
        this.utcr = utcr;
    }

    public String getUtuv() {
        return this.utuv;
    }

    public void setUtuv(String utuv) {
        this.utuv = utuv;
    }

    public Utente getUtente() {
        return this.utente;
    }

    public void setUtente(Utente utente) {
        this.utente = utente;
    }

}
