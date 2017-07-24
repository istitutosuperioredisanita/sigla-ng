package it.cnr.rsi.service;

import it.cnr.rsi.domain.Preferiti;
import it.cnr.rsi.repository.AlberoMainRepository;
import it.cnr.rsi.repository.PreferitiRepository;
import it.cnr.rsi.repository.UtenteRepository;
import it.cnr.rsi.security.UserContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UtenteService implements UserDetailsService {
    private static final Logger LOGGER = LoggerFactory.getLogger(UtenteService.class);

    private UtenteRepository utenteRepository;
    private PreferitiRepository preferitiRepository;
    private AlberoMainRepository alberoMainRepository;

    public UtenteService(UtenteRepository utenteRepository, PreferitiRepository preferitiRepository, AlberoMainRepository alberoMainRepository) {
		super();
		this.utenteRepository = utenteRepository;
		this.preferitiRepository = preferitiRepository;
		this.alberoMainRepository = alberoMainRepository;
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
    @Transactional
    public List<Preferiti> findPreferiti(String uid) {
        LOGGER.info("Find preferiti by uid {}", uid);
        return preferitiRepository.findPreferitiByUser(uid)
            .map(preferiti -> {
                preferiti.setCdNodo(
                    alberoMainRepository.findCdNodo(preferiti.getId().getBusinessProcess(), preferiti.getId().getTiFunzione())
                );
                return preferiti;
            }).sorted((preferiti, t1) ->
                preferiti.getDuva().compareTo(t1.getDuva())
            ).collect(Collectors.toList());
    }
}
