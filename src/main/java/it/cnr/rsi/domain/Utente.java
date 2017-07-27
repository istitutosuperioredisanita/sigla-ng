package it.cnr.rsi.domain;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;


/**
 * The persistent class for the UTENTE database table.
 *
 */
@Entity
@NamedQuery(name="Utente.findAll", query="SELECT u FROM Utente u")
public class Utente implements Serializable{
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name="CD_UTENTE")
	private String cdUtente;

	@Column(name="CD_CDR")
	private String cdCdr;

	@Column(name="CD_CDS_CONFIGURATORE")
	private String cdCdsConfiguratore;

	@Column(name="CD_DIPARTIMENTO")
	private String cdDipartimento;

	@Column(name="CD_GESTORE")
	private String cdGestore;

	@Column(name="CD_RUOLO_SUPERVISORE")
	private String cdRuoloSupervisore;

	@Column(name="CD_UTENTE_TEMPL")
	private String cdUtenteTempl;

	@Column(name="CD_UTENTE_UID")
	private String cdUtenteUid;

	private String cognome;

	@Temporal(TemporalType.DATE)
	private Date dacr;

	@Column(name="DS_UTENTE")
	private String dsUtente;

	@Temporal(TemporalType.DATE)
	@Column(name="DT_FINE_VALIDITA")
	private Date dtFineValidita;

	@Temporal(TemporalType.DATE)
	@Column(name="DT_INIZIO_VALIDITA")
	private Date dtInizioValidita;

	@Temporal(TemporalType.DATE)
	@Column(name="DT_ULTIMA_VAR_PASSWORD")
	private Date dtUltimaVarPassword;

	@Temporal(TemporalType.DATE)
	@Column(name="DT_ULTIMO_ACCESSO")
	private Date dtUltimoAccesso;

	@Temporal(TemporalType.DATE)
	private Date duva;

	@Column(name="FL_ALTRA_PROC")
	private String flAltraProc;

	@Column(name="FL_ATTIVA_BLOCCO")
	private String flAttivaBlocco;

	@Column(name="FL_AUTENTICAZIONE_LDAP")
	private String flAutenticazioneLdap;

	@Column(name="FL_PASSWORD_CHANGE")
	private String flPasswordChange;

	@Column(name="FL_SUPERVISORE")
	private String flSupervisore;

	@Column(name="FL_UTENTE_TEMPL")
	private String flUtenteTempl;

	private String indirizzo;

	private String nome;

	private String password;

	@Column(name="PG_VER_REC")
	private BigDecimal pgVerRec;

	@Column(name="TI_UTENTE")
	private String tiUtente;

	private String utcr;

	private String utuv;

	//bi-directional many-to-one association to UtenteGestore
	@OneToMany(mappedBy="utente1")
	private List<UtenteGestore> utenteGestores1;

	//bi-directional many-to-one association to UtenteGestore
	@OneToMany(mappedBy="utente2")
	private List<UtenteGestore> utenteGestores2;

	//bi-directional many-to-one association to UtenteUnitaAccesso
	@OneToMany(mappedBy="utente")
	private List<UtenteUnitaAccesso> utenteUnitaAccessos;

	//bi-directional many-to-one association to UtenteUnitaRuolo
	@OneToMany(mappedBy="utente")
	private List<UtenteUnitaRuolo> utenteUnitaRuolos;

	public Utente() {
	}

	public String getCdUtente() {
		return this.cdUtente;
	}

	public void setCdUtente(String cdUtente) {
		this.cdUtente = cdUtente;
	}

	public String getCdCdr() {
		return this.cdCdr;
	}

	public void setCdCdr(String cdCdr) {
		this.cdCdr = cdCdr;
	}

	public String getCdCdsConfiguratore() {
		return this.cdCdsConfiguratore;
	}

	public void setCdCdsConfiguratore(String cdCdsConfiguratore) {
		this.cdCdsConfiguratore = cdCdsConfiguratore;
	}

	public String getCdDipartimento() {
		return this.cdDipartimento;
	}

	public void setCdDipartimento(String cdDipartimento) {
		this.cdDipartimento = cdDipartimento;
	}

	public String getCdGestore() {
		return this.cdGestore;
	}

	public void setCdGestore(String cdGestore) {
		this.cdGestore = cdGestore;
	}

	public String getCdRuoloSupervisore() {
		return this.cdRuoloSupervisore;
	}

	public void setCdRuoloSupervisore(String cdRuoloSupervisore) {
		this.cdRuoloSupervisore = cdRuoloSupervisore;
	}

	public String getCdUtenteTempl() {
		return this.cdUtenteTempl;
	}

	public void setCdUtenteTempl(String cdUtenteTempl) {
		this.cdUtenteTempl = cdUtenteTempl;
	}

	public String getCdUtenteUid() {
		return this.cdUtenteUid;
	}

	public void setCdUtenteUid(String cdUtenteUid) {
		this.cdUtenteUid = cdUtenteUid;
	}

	public String getCognome() {
		return this.cognome;
	}

	public void setCognome(String cognome) {
		this.cognome = cognome;
	}

	public Date getDacr() {
		return this.dacr;
	}

	public void setDacr(Date dacr) {
		this.dacr = dacr;
	}

	public String getDsUtente() {
		return this.dsUtente;
	}

	public void setDsUtente(String dsUtente) {
		this.dsUtente = dsUtente;
	}

	public Date getDtFineValidita() {
		return this.dtFineValidita;
	}

	public void setDtFineValidita(Date dtFineValidita) {
		this.dtFineValidita = dtFineValidita;
	}

	public Date getDtInizioValidita() {
		return this.dtInizioValidita;
	}

	public void setDtInizioValidita(Date dtInizioValidita) {
		this.dtInizioValidita = dtInizioValidita;
	}

	public Date getDtUltimaVarPassword() {
		return this.dtUltimaVarPassword;
	}

	public void setDtUltimaVarPassword(Date dtUltimaVarPassword) {
		this.dtUltimaVarPassword = dtUltimaVarPassword;
	}

	public Date getDtUltimoAccesso() {
		return this.dtUltimoAccesso;
	}

	public void setDtUltimoAccesso(Date dtUltimoAccesso) {
		this.dtUltimoAccesso = dtUltimoAccesso;
	}

	public Date getDuva() {
		return this.duva;
	}

	public void setDuva(Date duva) {
		this.duva = duva;
	}

	public String getFlAltraProc() {
		return this.flAltraProc;
	}

	public void setFlAltraProc(String flAltraProc) {
		this.flAltraProc = flAltraProc;
	}

	public String getFlAttivaBlocco() {
		return this.flAttivaBlocco;
	}

	public void setFlAttivaBlocco(String flAttivaBlocco) {
		this.flAttivaBlocco = flAttivaBlocco;
	}

	public String getFlAutenticazioneLdap() {
		return this.flAutenticazioneLdap;
	}

	public void setFlAutenticazioneLdap(String flAutenticazioneLdap) {
		this.flAutenticazioneLdap = flAutenticazioneLdap;
	}

	public String getFlPasswordChange() {
		return this.flPasswordChange;
	}

	public void setFlPasswordChange(String flPasswordChange) {
		this.flPasswordChange = flPasswordChange;
	}

	public String getFlSupervisore() {
		return this.flSupervisore;
	}

	public void setFlSupervisore(String flSupervisore) {
		this.flSupervisore = flSupervisore;
	}

	public String getFlUtenteTempl() {
		return this.flUtenteTempl;
	}

	public void setFlUtenteTempl(String flUtenteTempl) {
		this.flUtenteTempl = flUtenteTempl;
	}

	public String getIndirizzo() {
		return this.indirizzo;
	}

	public void setIndirizzo(String indirizzo) {
		this.indirizzo = indirizzo;
	}

	public String getNome() {
		return this.nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public String getPassword() {
		return this.password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public BigDecimal getPgVerRec() {
		return this.pgVerRec;
	}

	public void setPgVerRec(BigDecimal pgVerRec) {
		this.pgVerRec = pgVerRec;
	}

	public String getTiUtente() {
		return this.tiUtente;
	}

	public void setTiUtente(String tiUtente) {
		this.tiUtente = tiUtente;
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

	public List<UtenteGestore> getUtenteGestores1() {
		return this.utenteGestores1;
	}

	public void setUtenteGestores1(List<UtenteGestore> utenteGestores1) {
		this.utenteGestores1 = utenteGestores1;
	}

	public UtenteGestore addUtenteGestores1(UtenteGestore utenteGestores1) {
		getUtenteGestores1().add(utenteGestores1);
		utenteGestores1.setUtente1(this);

		return utenteGestores1;
	}

	public UtenteGestore removeUtenteGestores1(UtenteGestore utenteGestores1) {
		getUtenteGestores1().remove(utenteGestores1);
		utenteGestores1.setUtente1(null);

		return utenteGestores1;
	}

	public List<UtenteGestore> getUtenteGestores2() {
		return this.utenteGestores2;
	}

	public void setUtenteGestores2(List<UtenteGestore> utenteGestores2) {
		this.utenteGestores2 = utenteGestores2;
	}

	public UtenteGestore addUtenteGestores2(UtenteGestore utenteGestores2) {
		getUtenteGestores2().add(utenteGestores2);
		utenteGestores2.setUtente2(this);

		return utenteGestores2;
	}

	public UtenteGestore removeUtenteGestores2(UtenteGestore utenteGestores2) {
		getUtenteGestores2().remove(utenteGestores2);
		utenteGestores2.setUtente2(null);

		return utenteGestores2;
	}

	public List<UtenteUnitaAccesso> getUtenteUnitaAccessos() {
		return this.utenteUnitaAccessos;
	}

	public void setUtenteUnitaAccessos(List<UtenteUnitaAccesso> utenteUnitaAccessos) {
		this.utenteUnitaAccessos = utenteUnitaAccessos;
	}

	public UtenteUnitaAccesso addUtenteUnitaAccesso(UtenteUnitaAccesso utenteUnitaAccesso) {
		getUtenteUnitaAccessos().add(utenteUnitaAccesso);
		utenteUnitaAccesso.setUtente(this);

		return utenteUnitaAccesso;
	}

	public UtenteUnitaAccesso removeUtenteUnitaAccesso(UtenteUnitaAccesso utenteUnitaAccesso) {
		getUtenteUnitaAccessos().remove(utenteUnitaAccesso);
		utenteUnitaAccesso.setUtente(null);

		return utenteUnitaAccesso;
	}

	public List<UtenteUnitaRuolo> getUtenteUnitaRuolos() {
		return this.utenteUnitaRuolos;
	}

	public void setUtenteUnitaRuolos(List<UtenteUnitaRuolo> utenteUnitaRuolos) {
		this.utenteUnitaRuolos = utenteUnitaRuolos;
	}

	public UtenteUnitaRuolo addUtenteUnitaRuolo(UtenteUnitaRuolo utenteUnitaRuolo) {
		getUtenteUnitaRuolos().add(utenteUnitaRuolo);
		utenteUnitaRuolo.setUtente(this);

		return utenteUnitaRuolo;
	}

	public UtenteUnitaRuolo removeUtenteUnitaRuolo(UtenteUnitaRuolo utenteUnitaRuolo) {
		getUtenteUnitaRuolos().remove(utenteUnitaRuolo);
		utenteUnitaRuolo.setUtente(null);

		return utenteUnitaRuolo;
	}

	public boolean isUtenteSupervisore() {
		return getFlSupervisore().equalsIgnoreCase("Y");
	}

    @Override
    public String toString() {
        return "Utente{" +
            "cdUtente='" + cdUtente + '\'' +
            ", cdCdr='" + cdCdr + '\'' +
            ", cdCdsConfiguratore='" + cdCdsConfiguratore + '\'' +
            ", cdDipartimento='" + cdDipartimento + '\'' +
            ", cdGestore='" + cdGestore + '\'' +
            ", cdRuoloSupervisore='" + cdRuoloSupervisore + '\'' +
            ", cdUtenteTempl='" + cdUtenteTempl + '\'' +
            ", cdUtenteUid='" + cdUtenteUid + '\'' +
            ", cognome='" + cognome + '\'' +
            ", dacr=" + dacr +
            ", dsUtente='" + dsUtente + '\'' +
            ", dtFineValidita=" + dtFineValidita +
            ", dtInizioValidita=" + dtInizioValidita +
            ", dtUltimaVarPassword=" + dtUltimaVarPassword +
            ", dtUltimoAccesso=" + dtUltimoAccesso +
            ", duva=" + duva +
            ", flAltraProc='" + flAltraProc + '\'' +
            ", flAttivaBlocco='" + flAttivaBlocco + '\'' +
            ", flAutenticazioneLdap='" + flAutenticazioneLdap + '\'' +
            ", flPasswordChange='" + flPasswordChange + '\'' +
            ", flSupervisore='" + flSupervisore + '\'' +
            ", flUtenteTempl='" + flUtenteTempl + '\'' +
            ", indirizzo='" + indirizzo + '\'' +
            ", nome='" + nome + '\'' +
            ", password='" + password + '\'' +
            ", pgVerRec=" + pgVerRec +
            ", tiUtente='" + tiUtente + '\'' +
            ", utcr='" + utcr + '\'' +
            ", utuv='" + utuv + '\'' +
            '}';
    }
}
