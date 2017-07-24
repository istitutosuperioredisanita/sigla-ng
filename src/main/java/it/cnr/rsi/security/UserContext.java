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

	@JsonIgnore
	private Utente currentUser;

	private Map<String, Serializable> attributes;

	public UserContext(Utente currentUser) {
		super();
		this.currentUser = currentUser;
		this.attributes = new HashMap<String, Serializable>();
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
		return Collections.singletonList(
				new SimpleGrantedAuthority("ROLE_USER")
		);
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
