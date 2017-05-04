package it.cnr.rsi.service;

import it.cnr.rsi.repository.UtenteRepository;
import it.cnr.rsi.security.UserContext;

import java.util.Optional;

import javax.transaction.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UtenteService implements UserDetailsService {
    private static final Logger LOGGER = LoggerFactory.getLogger(UtenteService.class);

    private UtenteRepository utenteRepository;

	public UtenteService(UtenteRepository utenteRepository) {
		super();
		this.utenteRepository = utenteRepository;
	}

	@Override
	@Transactional
	public UserContext loadUserByUsername(String username) throws UsernameNotFoundException {
		LOGGER.info("Find user by username {}", username);
		return new UserContext(Optional.ofNullable(
				utenteRepository.findUserWithAuthenticationLDAP(
						Optional.ofNullable(username.toUpperCase()).orElse(""), "N"))
				.orElseThrow(() -> new UsernameNotFoundException("User not found")));
	}
	@Transactional
	public UserContext loadUserByUid(String uid) throws UsernameNotFoundException {
		LOGGER.info("Find user by uid {}", uid);
		return new UserContext(utenteRepository.findUsersForUid(uid).reduce((a, b) -> {
            throw new IllegalStateException("Multiple elements: " + a + ", " + b);
        })
        .get());
	}
}
