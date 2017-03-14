package it.cnr.rsi.domain;

import java.io.Serializable;
import javax.persistence.*;
import java.math.BigDecimal;
import java.util.Date;


/**
 * The persistent class for the RUOLO_ACCESSO database table.
 * 
 */
@Entity
@Table(name="RUOLO_ACCESSO")
@NamedQuery(name="RuoloAccesso.findAll", query="SELECT r FROM RuoloAccesso r")
public class RuoloAccesso implements Serializable {
	private static final long serialVersionUID = 1L;

	@EmbeddedId
	private RuoloAccessoPK id;

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

	//bi-directional many-to-one association to Ruolo
	@ManyToOne
	@JoinColumn(name="CD_RUOLO", insertable=false, updatable=false)
	private Ruolo ruolo;

	public RuoloAccesso() {
	}

	public RuoloAccessoPK getId() {
		return this.id;
	}

	public void setId(RuoloAccessoPK id) {
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

	public Ruolo getRuolo() {
		return this.ruolo;
	}

	public void setRuolo(Ruolo ruolo) {
		this.ruolo = ruolo;
	}

}