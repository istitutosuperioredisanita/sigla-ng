package it.cnr.rsi.domain;

import java.io.Serializable;
import javax.persistence.*;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;


/**
 * The persistent class for the RUOLO database table.
 * 
 */
@Entity
@NamedQuery(name="Ruolo.findAll", query="SELECT r FROM Ruolo r")
public class Ruolo implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name="CD_RUOLO")
	private String cdRuolo;

	@Temporal(TemporalType.DATE)
	private Date dacr;

	@Column(name="DS_RUOLO")
	private String dsRuolo;

	@Temporal(TemporalType.DATE)
	private Date duva;

	@Column(name="PG_VER_REC")
	private BigDecimal pgVerRec;

	private String tipo;

	private String utcr;

	private String utuv;

	//bi-directional many-to-one association to UnitaOrganizzativa
	@ManyToOne
	@JoinColumn(name="CD_CDS")
	private UnitaOrganizzativa unitaOrganizzativa;

	//bi-directional many-to-one association to RuoloAccesso
	@OneToMany(mappedBy="ruolo")
	private List<RuoloAccesso> ruoloAccessos;

	//bi-directional many-to-one association to UtenteUnitaRuolo
	@OneToMany(mappedBy="ruolo")
	private List<UtenteUnitaRuolo> utenteUnitaRuolos;

	public Ruolo() {
	}

	public String getCdRuolo() {
		return this.cdRuolo;
	}

	public void setCdRuolo(String cdRuolo) {
		this.cdRuolo = cdRuolo;
	}

	public Date getDacr() {
		return this.dacr;
	}

	public void setDacr(Date dacr) {
		this.dacr = dacr;
	}

	public String getDsRuolo() {
		return this.dsRuolo;
	}

	public void setDsRuolo(String dsRuolo) {
		this.dsRuolo = dsRuolo;
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

	public String getTipo() {
		return this.tipo;
	}

	public void setTipo(String tipo) {
		this.tipo = tipo;
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

	public UnitaOrganizzativa getUnitaOrganizzativa() {
		return this.unitaOrganizzativa;
	}

	public void setUnitaOrganizzativa(UnitaOrganizzativa unitaOrganizzativa) {
		this.unitaOrganizzativa = unitaOrganizzativa;
	}

	public List<RuoloAccesso> getRuoloAccessos() {
		return this.ruoloAccessos;
	}

	public void setRuoloAccessos(List<RuoloAccesso> ruoloAccessos) {
		this.ruoloAccessos = ruoloAccessos;
	}

	public RuoloAccesso addRuoloAccesso(RuoloAccesso ruoloAccesso) {
		getRuoloAccessos().add(ruoloAccesso);
		ruoloAccesso.setRuolo(this);

		return ruoloAccesso;
	}

	public RuoloAccesso removeRuoloAccesso(RuoloAccesso ruoloAccesso) {
		getRuoloAccessos().remove(ruoloAccesso);
		ruoloAccesso.setRuolo(null);

		return ruoloAccesso;
	}

	public List<UtenteUnitaRuolo> getUtenteUnitaRuolos() {
		return this.utenteUnitaRuolos;
	}

	public void setUtenteUnitaRuolos(List<UtenteUnitaRuolo> utenteUnitaRuolos) {
		this.utenteUnitaRuolos = utenteUnitaRuolos;
	}

	public UtenteUnitaRuolo addUtenteUnitaRuolo(UtenteUnitaRuolo utenteUnitaRuolo) {
		getUtenteUnitaRuolos().add(utenteUnitaRuolo);
		utenteUnitaRuolo.setRuolo(this);

		return utenteUnitaRuolo;
	}

	public UtenteUnitaRuolo removeUtenteUnitaRuolo(UtenteUnitaRuolo utenteUnitaRuolo) {
		getUtenteUnitaRuolos().remove(utenteUnitaRuolo);
		utenteUnitaRuolo.setRuolo(null);

		return utenteUnitaRuolo;
	}

}