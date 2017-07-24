package it.cnr.rsi.domain;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;


/**
 * The persistent class for the UTENTE_UNITA_ACCESSO database table.
 *
 */
@Entity
@Table(name="UTENTE_UNITA_ACCESSO")
@NamedQuery(name="UtenteUnitaAccesso.findAll", query="SELECT u FROM UtenteUnitaAccesso u")
public class UtenteUnitaAccesso implements Serializable {
	private static final long serialVersionUID = 1L;

	@EmbeddedId
	private UtenteUnitaAccessoPK id;

	@Temporal(TemporalType.DATE)
	private Date dacr;

	@Temporal(TemporalType.DATE)
	private Date duva;

	@Column(name="PG_VER_REC")
	private BigDecimal pgVerRec;

	private String utcr;

	private String utuv;

	//bi-directional many-to-one association to Accesso
	@ManyToOne
	@JoinColumn(name="CD_ACCESSO", insertable=false, updatable=false)
	private Accesso accesso;

	//bi-directional many-to-one association to Utente
	@ManyToOne
	@JoinColumn(name="CD_UTENTE", insertable=false, updatable=false)
	private Utente utente;

	//bi-directional many-to-one association to UnitaOrganizzativa
	@ManyToOne
	@JoinColumn(name="CD_UNITA_ORGANIZZATIVA", insertable=false, updatable=false)
	private UnitaOrganizzativa unitaOrganizzativa;

	public UtenteUnitaAccesso() {
	}

	public UtenteUnitaAccessoPK getId() {
		return this.id;
	}

	public void setId(UtenteUnitaAccessoPK id) {
		this.id = id;
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

	public Accesso getAccesso() {
		return this.accesso;
	}

	public void setAccesso(Accesso accesso) {
		this.accesso = accesso;
	}

	public Utente getUtente() {
		return this.utente;
	}

	public void setUtente(Utente utente) {
		this.utente = utente;
	}

	public UnitaOrganizzativa getUnitaOrganizzativa() {
		return unitaOrganizzativa;
	}

	public void setUnitaOrganizzativa(UnitaOrganizzativa unitaOrganizzativa) {
		this.unitaOrganizzativa = unitaOrganizzativa;
	}

}
