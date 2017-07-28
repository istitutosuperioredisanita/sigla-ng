package it.cnr.rsi.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import it.cnr.rsi.domain.Utente;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serializable;
import java.util.*;
import java.util.stream.Collectors;

public class UserContext implements UserDetails {
	private static final long serialVersionUID = 1L;
    public static final GrantedAuthority ROLE_USER = new SimpleGrantedAuthority("ROLE_USER");
    public static final GrantedAuthority ROLE_SUPERUSER = new SimpleGrantedAuthority("ROLE_SUPERUSER");
    public static final GrantedAuthority ROLE_ADMIN = new SimpleGrantedAuthority("ROLE_ADMIN");

	@JsonIgnore
	private Utente currentUser;

	private String username;
    private Collection<? extends GrantedAuthority> authorities;

	private Map<String, Serializable> attributes;
    private Map<String, List<GrantedAuthority>> roles;
    private List<UserContext> users;
    private Boolean utenteMultiplo;

	public UserContext(Utente currentUser) {
		super();
        this.roles = new HashMap<String, List<GrantedAuthority>>();
        this.roles.put("U", Arrays.asList(ROLE_USER));
        this.roles.put("A", Arrays.asList(ROLE_USER, ROLE_SUPERUSER));
        this.roles.put("S", Arrays.asList(ROLE_USER, ROLE_ADMIN));

		this.currentUser = currentUser;
		this.username = currentUser.getCdUtente();
		this.utenteMultiplo = Boolean.FALSE;
        this.authorities = Optional.ofNullable(currentUser)
            .map(Utente::getTiUtente)
            .map(s -> roles.get(s))
            .orElse(Arrays.asList(ROLE_USER));
		this.attributes = new HashMap<String, Serializable>();

	}

	public Serializable addAttribute(String key, Serializable value) {
		return attributes.put(key, value);
	}

	public Serializable getAttribute(String key) {
		return attributes.get(key);
	}

    public void setAuthorities(Collection<? extends GrantedAuthority> authorities) {
        this.authorities = authorities;
    }

    @Override
	@JsonIgnore
	public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
	}

	@JsonProperty("authorities")
	public Collection<String> getAuthoritiesHipster() {
		return getAuthorities()
				.stream()
				.map(x -> x.getAuthority())
				.collect(Collectors.toList());
	}

	@Override
	@JsonIgnore
	public String getPassword() {
		return currentUser.getPassword();
	}

	@Override
	public String getUsername() {
		return username;
	}

    public UserContext changeUsernameAndAuthority(String username) {
        this.username = username;
        this.setAuthorities(
            this.users.stream()
                .filter(userContext -> userContext.getUsername().equals(username))
                .findAny()
                .map(userContext -> userContext.getAuthorities())
                .get()
        );
        this.utenteMultiplo = Boolean.TRUE;
        return this;
    }

    @Override
	public boolean isAccountNonExpired() {
		// TODO Auto-generated method stub
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		// TODO Auto-generated method stub
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		// TODO Auto-generated method stub
		return true;
	}

	@Override
	public boolean isEnabled() {
		// TODO Auto-generated method stub
		return true;
	}

    public Long getId() {
        return 0L;
    }

    public String getLogin() {
        return Optional.ofNullable((String)attributes.get("login")).orElse(currentUser.getCdUtente());
    }

    public String getFirstName() {
        return Optional.ofNullable((String)attributes.get("firstName")).orElse(currentUser.getNome());
    }

    public String getLastName() {
        return Optional.ofNullable((String)attributes.get("lastName")).orElse(currentUser.getCognome());
    }

    public String getEmail() {
        return Optional.ofNullable((String)attributes.get("email")).orElse("");
    }

    public String getLangKey() {
    	return Locale.ITALIAN.getLanguage();
    }

    public Integer getEsercizio() {
        return Optional.ofNullable((Integer)attributes.get("esercizio")).orElse(null);
    }
    public String getCds() {
        return Optional.ofNullable((String)attributes.get("cds")).orElse(null);
    }
    public String getUo() {
        return Optional.ofNullable((String)attributes.get("uo")).orElse(null);
    }
    public String getCdr() {
        return Optional.ofNullable((String)attributes.get("cdr")).orElse(null);
    }

    public List<UserContext> getUsers() {
        return users;
    }

    public void setUsers(List<UserContext> users) {
        this.users = users;
    }

    public UserContext users(List<UserContext> users) {
        this.users = users;
        return this;
    }

    public String getDsUtente() {
	    return Optional.ofNullable(currentUser)
            .map(Utente::getDsUtente)
            .orElse(null);
    }

    public Boolean getUtenteMultiplo() {
        return utenteMultiplo;
    }

    public void setUtenteMultiplo(Boolean utenteMultiplo) {
        this.utenteMultiplo = utenteMultiplo;
    }
}
