package it.cnr.rsi.security;

import it.cnr.rsi.domain.Utente;

import java.io.Serializable;
import java.util.Collection;
import java.util.Collections;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnore;

public class UserContext implements UserDetails {
	private static final long serialVersionUID = 1L;
	
	@JsonIgnore
	private Utente currentUser;

	private Map<String, Serializable> attributes;	
		
	public UserContext(Utente currentUser) {
		super();
		this.currentUser = currentUser;
	}

	public Serializable addAttribute(String key, Serializable value) {
		return attributes.put(key, value);
	}
	
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return Collections.emptyList();
	}

	@Override
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

}
