package it.cnr.rsi.domain;

import java.io.Serializable;
import javax.persistence.*;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;


/**
 * The persistent class for the ALBERO_MAIN database table.
 * 
 */
@Entity
@Table(name="ALBERO_MAIN")
@NamedQuery(name="AlberoMain.findAll", query="SELECT a FROM AlberoMain a")
public class AlberoMain implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name="CD_NODO")
	private String cdNodo;

	@Column(name="BUSINESS_PROCESS")
	private String businessProcess;

	@Column(name="CD_PROPRIO_NODO")
	private String cdProprioNodo;

	@Temporal(TemporalType.DATE)
	private Date dacr;

	@Column(name="DS_NODO")
	private String dsNodo;

	@Temporal(TemporalType.DATE)
	private Date duva;

	@Column(name="FL_TERMINALE")
	private String flTerminale;

	private BigDecimal livello;

	@Column(name="PG_ORDINAMENTO")
	private BigDecimal pgOrdinamento;

	@Column(name="PG_VER_REC")
	private BigDecimal pgVerRec;

	@Column(name="URL_ICONA")
	private String urlIcona;

	@Column(name="URL_ICONA_OPEN")
	private String urlIconaOpen;

	private String utcr;

	private String utuv;

	//bi-directional many-to-one association to Accesso
	@ManyToOne(fetch=FetchType.LAZY)
	@JoinColumn(name="CD_ACCESSO")
	private Accesso accesso;

	//bi-directional many-to-one association to AlberoMain
	@ManyToOne(fetch=FetchType.LAZY)
	@JoinColumn(name="CD_NODO_PADRE")
	private AlberoMain alberoMain;

	//bi-directional many-to-one association to AlberoMain
	@OneToMany(mappedBy="alberoMain", fetch=FetchType.LAZY)
	private List<AlberoMain> alberoMains;

	public AlberoMain() {
	}

	public String getCdNodo() {
		return this.cdNodo;
	}

	public void setCdNodo(String cdNodo) {
		this.cdNodo = cdNodo;
	}

	public String getBusinessProcess() {
		return this.businessProcess;
	}

	public void setBusinessProcess(String businessProcess) {
		this.businessProcess = businessProcess;
	}

	public String getCdProprioNodo() {
		return this.cdProprioNodo;
	}

	public void setCdProprioNodo(String cdProprioNodo) {
		this.cdProprioNodo = cdProprioNodo;
	}

	public Date getDacr() {
		return this.dacr;
	}

	public void setDacr(Date dacr) {
		this.dacr = dacr;
	}

	public String getDsNodo() {
		return this.dsNodo;
	}

	public void setDsNodo(String dsNodo) {
		this.dsNodo = dsNodo;
	}

	public Date getDuva() {
		return this.duva;
	}

	public void setDuva(Date duva) {
		this.duva = duva;
	}

	public String getFlTerminale() {
		return this.flTerminale;
	}

	public void setFlTerminale(String flTerminale) {
		this.flTerminale = flTerminale;
	}

	public BigDecimal getLivello() {
		return this.livello;
	}

	public void setLivello(BigDecimal livello) {
		this.livello = livello;
	}

	public BigDecimal getPgOrdinamento() {
		return this.pgOrdinamento;
	}

	public void setPgOrdinamento(BigDecimal pgOrdinamento) {
		this.pgOrdinamento = pgOrdinamento;
	}

	public BigDecimal getPgVerRec() {
		return this.pgVerRec;
	}

	public void setPgVerRec(BigDecimal pgVerRec) {
		this.pgVerRec = pgVerRec;
	}

	public String getUrlIcona() {
		return this.urlIcona;
	}

	public void setUrlIcona(String urlIcona) {
		this.urlIcona = urlIcona;
	}

	public String getUrlIconaOpen() {
		return this.urlIconaOpen;
	}

	public void setUrlIconaOpen(String urlIconaOpen) {
		this.urlIconaOpen = urlIconaOpen;
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

	public AlberoMain getAlberoMain() {
		return this.alberoMain;
	}

	public void setAlberoMain(AlberoMain alberoMain) {
		this.alberoMain = alberoMain;
	}

	public List<AlberoMain> getAlberoMains() {
		return this.alberoMains;
	}

	public void setAlberoMains(List<AlberoMain> alberoMains) {
		this.alberoMains = alberoMains;
	}

	public AlberoMain addAlberoMain(AlberoMain alberoMain) {
		getAlberoMains().add(alberoMain);
		alberoMain.setAlberoMain(this);

		return alberoMain;
	}

	public AlberoMain removeAlberoMain(AlberoMain alberoMain) {
		getAlberoMains().remove(alberoMain);
		alberoMain.setAlberoMain(null);

		return alberoMain;
	}

}