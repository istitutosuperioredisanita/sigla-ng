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

	private Map<String, Serializable> attributes;
    private Map<String, List<GrantedAuthority>> roles;

	public UserContext(Utente currentUser) {
		super();
		this.currentUser = currentUser;
		this.attributes = new HashMap<String, Serializable>();
		this.roles = new HashMap<String, List<GrantedAuthority>>();
        this.roles.put("U", Arrays.asList(ROLE_USER));
        this.roles.put("A", Arrays.asList(ROLE_USER, ROLE_SUPERUSER));
        this.roles.put("S", Arrays.asList(ROLE_USER, ROLE_ADMIN));
	}

	public Serializable addAttribute(String key, Serializable value) {
		return attributes.put(key, value);
	}

	public Serializable getAttribute(String key) {
		return attributes.get(key);
	}

	@Override
	@JsonIgnore
	public Collection<? extends GrantedAuthority> getAuthorities() {
        return Optional.ofNullable(currentUser)
            .map(Utente::getTiUtente)
            .map(s -> roles.get(s))
            .orElse(Arrays.asList(ROLE_USER));
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
		return currentUser.getCdUtente();
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

}
