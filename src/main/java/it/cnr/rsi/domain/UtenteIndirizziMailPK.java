package it.cnr.rsi.domain;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import java.io.Serializable;

/**
 * The primary key class for the UTENTE_INDIRIZZI_MAIL database table.
 */
@Embeddable
public class UtenteIndirizziMailPK implements Serializable {
    //default serial version id, required for serializable classes.
    private static final long serialVersionUID = 1L;

    @Column(name = "CD_UTENTE")
    private String cdUtente;

    @Column(name = "INDIRIZZO_MAIL")
    private String indirizzoMail;

    public UtenteIndirizziMailPK() {
    }

    public UtenteIndirizziMailPK(String cdUtente, String indirizzoMail) {
        this.cdUtente = cdUtente;
        this.indirizzoMail = indirizzoMail;
    }

    public String getCdUtente() {
        return this.cdUtente;
    }

    public void setCdUtente(String cdUtente) {
        this.cdUtente = cdUtente;
    }

    public String getIndirizzoMail() {
        return this.indirizzoMail;
    }

    public void setIndirizzoMail(String indirizzoMail) {
        this.indirizzoMail = indirizzoMail;
    }

    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof UtenteIndirizziMailPK)) {
            return false;
        }
        UtenteIndirizziMailPK castOther = (UtenteIndirizziMailPK) other;
        return
            this.cdUtente.equals(castOther.cdUtente)
                && this.indirizzoMail.equals(castOther.indirizzoMail);
    }

    public int hashCode() {
        final int prime = 31;
        int hash = 17;
        hash = hash * prime + this.cdUtente.hashCode();
        hash = hash * prime + this.indirizzoMail.hashCode();

        return hash;
    }
}
