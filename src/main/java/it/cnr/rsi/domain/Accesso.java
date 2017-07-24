package it.cnr.rsi.domain;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;


/**
 * The persistent class for the ACCESSO database table.
 *
 */
@Entity
@NamedQuery(name="Accesso.findAll", query="SELECT a FROM Accesso a")
public class Accesso implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name="CD_ACCESSO")
	private String cdAccesso;

	@Temporal(TemporalType.DATE)
	private Date dacr;

	@Column(name="DS_ACCESSO")
	private String dsAccesso;

	@Temporal(TemporalType.DATE)
	private Date duva;

	@Column(name="PG_VER_REC")
	private BigDecimal pgVerRec;

	@Column(name="TI_ACCESSO")
	private String tiAccesso;

	private String utcr;

	private String utuv;

	//bi-directional many-to-one association to AlberoMain
	@OneToMany(mappedBy="accesso")
	private List<AlberoMain> alberoMains;

	//bi-directional many-to-one association to AssBpAccesso
	@OneToMany(mappedBy="accesso")
	private List<AssBpAccesso> assBpAccessos;

	//bi-directional many-to-one association to RuoloAccesso
	@OneToMany(mappedBy="accesso")
	private List<RuoloAccesso> ruoloAccessos;

	//bi-directional many-to-one association to UtenteUnitaAccesso
	@OneToMany(mappedBy="accesso")
	private List<UtenteUnitaAccesso> utenteUnitaAccessos;

	public Accesso() {
	}

	public String getCdAccesso() {
		return this.cdAccesso;
	}

	public void setCdAccesso(String cdAccesso) {
		this.cdAccesso = cdAccesso;
	}

	public Date getDacr() {
		return this.dacr;
	}

	public void setDacr(Date dacr) {
		this.dacr = dacr;
	}

	public String getDsAccesso() {
		return this.dsAccesso;
	}

	public void setDsAccesso(String dsAccesso) {
		this.dsAccesso = dsAccesso;
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

	public String getTiAccesso() {
		return this.tiAccesso;
	}

	public void setTiAccesso(String tiAccesso) {
		this.tiAccesso = tiAccesso;
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

	public List<AlberoMain> getAlberoMains() {
		return this.alberoMains;
	}

	public void setAlberoMains(List<AlberoMain> alberoMains) {
		this.alberoMains = alberoMains;
	}

	public AlberoMain addAlberoMain(AlberoMain alberoMain) {
		getAlberoMains().add(alberoMain);
		alberoMain.setAccesso(this);

		return alberoMain;
	}

	public AlberoMain removeAlberoMain(AlberoMain alberoMain) {
		getAlberoMains().remove(alberoMain);
		alberoMain.setAccesso(null);

		return alberoMain;
	}

	public List<AssBpAccesso> getAssBpAccessos() {
		return this.assBpAccessos;
	}

	public void setAssBpAccessos(List<AssBpAccesso> assBpAccessos) {
		this.assBpAccessos = assBpAccessos;
	}

	public AssBpAccesso addAssBpAccesso(AssBpAccesso assBpAccesso) {
		getAssBpAccessos().add(assBpAccesso);
		assBpAccesso.setAccesso(this);

		return assBpAccesso;
	}

	public AssBpAccesso removeAssBpAccesso(AssBpAccesso assBpAccesso) {
		getAssBpAccessos().remove(assBpAccesso);
		assBpAccesso.setAccesso(null);

		return assBpAccesso;
	}

	public List<RuoloAccesso> getRuoloAccessos() {
		return this.ruoloAccessos;
	}

	public void setRuoloAccessos(List<RuoloAccesso> ruoloAccessos) {
		this.ruoloAccessos = ruoloAccessos;
	}

	public RuoloAccesso addRuoloAccesso(RuoloAccesso ruoloAccesso) {
		getRuoloAccessos().add(ruoloAccesso);
		ruoloAccesso.setAccesso(this);

		return ruoloAccesso;
	}

	public RuoloAccesso removeRuoloAccesso(RuoloAccesso ruoloAccesso) {
		getRuoloAccessos().remove(ruoloAccesso);
		ruoloAccesso.setAccesso(null);

		return ruoloAccesso;
	}

	public List<UtenteUnitaAccesso> getUtenteUnitaAccessos() {
		return this.utenteUnitaAccessos;
	}

	public void setUtenteUnitaAccessos(List<UtenteUnitaAccesso> utenteUnitaAccessos) {
		this.utenteUnitaAccessos = utenteUnitaAccessos;
	}

	public UtenteUnitaAccesso addUtenteUnitaAccesso(UtenteUnitaAccesso utenteUnitaAccesso) {
		getUtenteUnitaAccessos().add(utenteUnitaAccesso);
		utenteUnitaAccesso.setAccesso(this);

		return utenteUnitaAccesso;
	}

	public UtenteUnitaAccesso removeUtenteUnitaAccesso(UtenteUnitaAccesso utenteUnitaAccesso) {
		getUtenteUnitaAccessos().remove(utenteUnitaAccesso);
		utenteUnitaAccesso.setAccesso(null);

		return utenteUnitaAccesso;
	}

}
