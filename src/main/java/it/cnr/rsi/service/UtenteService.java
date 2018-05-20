package it.cnr.rsi.service;

import it.cnr.rsi.domain.*;
import it.cnr.rsi.repository.*;
import it.cnr.rsi.security.UserContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.util.Base64Utils;

import javax.transaction.Transactional;
import java.sql.Date;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class UtenteService implements UserDetailsService {
    private static final Logger LOGGER = LoggerFactory.getLogger(UtenteService.class);

    private UtenteRepository utenteRepository;
    private PreferitiRepository preferitiRepository;
    private AlberoMainRepository alberoMainRepository;
    private MessaggioRepository messaggioRepository;
    private UtenteIndirizziMailRepository utenteIndirizziMailRepository;

    public UtenteService(UtenteRepository utenteRepository,
                         PreferitiRepository preferitiRepository,
                         AlberoMainRepository alberoMainRepository,
                         MessaggioRepository messaggioRepository,
                         UtenteIndirizziMailRepository utenteIndirizziMailRepository) {
		super();
		this.utenteRepository = utenteRepository;
		this.preferitiRepository = preferitiRepository;
		this.alberoMainRepository = alberoMainRepository;
		this.messaggioRepository = messaggioRepository;
		this.utenteIndirizziMailRepository = utenteIndirizziMailRepository;
	}

    @Override
    public UserContext loadUserByUsername(String username) {
        return loadUserByUsername(username, Boolean.FALSE);
    }

	@Transactional
	public UserContext loadUserByUsername(String username, Boolean flAutenticazioneLdap) throws UsernameNotFoundException {
		LOGGER.info("Find user by username {}", username);
		return new UserContext(Optional.ofNullable(
				utenteRepository.findUserWithAuthenticationLDAP(
						Optional.ofNullable(username.toUpperCase()).orElse(""), flAutenticazioneLdap))
				.orElseThrow(() -> new UsernameNotFoundException("User not found")));
	}
	@Transactional
	public UserContext loadUserByUid(String uid) throws UsernameNotFoundException {
		LOGGER.info("Find user by uid {}", uid);
		return Optional.ofNullable(findUsersForUid(uid))
                    .filter(utentes -> !utentes.isEmpty())
                    .map(utentes -> new UserContext(utentes.stream().findAny().get()))
                    .orElse(null);
	}

    @Transactional
    public List<Utente> findUsersForUid(String uid) throws UsernameNotFoundException {
        LOGGER.info("Find users by uid {}", uid);
        return utenteRepository.findUsersForUid(uid);
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

    @Transactional
    public List<UtenteIndirizziMail> findIndirizziMail(String uid) {
        LOGGER.info("Find indirizzi mail by uid {}", uid);
        return utenteIndirizziMailRepository.findUtenteIndirizziMailByCdUtente(uid)
            .sorted((t0, t1) ->
                t0.getDuva().compareTo(t1.getDuva())
            ).collect(Collectors.toList());
    }

    @Transactional
    public void deleteIndirizziMail(String username, ArrayList<String> indirizzi) {
        indirizzi.stream()
            .forEach(indirizzo -> {
                utenteIndirizziMailRepository.delete(
                    utenteIndirizziMailRepository.findById(new UtenteIndirizziMailPK(username, indirizzo)).get()
                );
            });
    }
    @Transactional
    public void insertIndirizzoMail(String username, ArrayList<UtenteIndirizziMail> utenteIndirizziMail) {
        utenteIndirizziMailRepository.saveAll(utenteIndirizziMail.stream()
            .map(indirizzo -> {
                indirizzo.setDuva(Date.from(Instant.now()));
                indirizzo.setUtuv(username);
                indirizzo.setDacr(Optional.ofNullable(indirizzo.getDacr()).orElse(Date.from(Instant.now())));
                indirizzo.setUtcr(username);
                return indirizzo;
            }).collect(Collectors.toList()));
    }

    @Transactional
    public List<Messaggio> findMessaggi(String uid) {
        LOGGER.info("Find messaggi by uid {}", uid);
        return messaggioRepository.findMessaggiByUser(uid)
            .sorted((messaggio, t1) ->
                t1.getDacr().compareTo(messaggio.getDacr())
            ).collect(Collectors.toList());
    }

    @Transactional
    public List<Messaggio> deleteMessaggi(String uid, List<Messaggio> messaggi) {
        LOGGER.info("Delete messaggi by uid {}", uid);
        messaggi.stream()
            .filter(messaggio -> Optional.ofNullable(messaggio.getCdUtente()).filter(s -> s.equals(uid)).isPresent())
            .forEach(messaggio -> messaggioRepository.delete(messaggio));
        return findMessaggi(uid);
    }

    @Transactional
    public void changePassword(String username, String newPassword) {
        Utente utente = utenteRepository.findById(username).get();
        byte[] buser = utente.getCdUtente().getBytes();
        byte[] bpassword = newPassword.toUpperCase().getBytes();
        byte h = 0;
        for (int i = 0;i < bpassword.length;i++) {
            h = (byte)(bpassword[i] ^ h);
            for (int j = 0;j < buser.length;j++)
                bpassword[i] ^= buser[j] ^ h;
        }
        utente.setPassword( Base64Utils.encodeToString(bpassword));
        utente.setDtUltimaVarPassword(Date.from(Instant.now()));
        utenteRepository.save(utente);
    }

    public UserContext getUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return Optional
            .ofNullable(authentication)
            .map(Authentication::getPrincipal)
            .filter(principal -> principal instanceof UserContext)
            .map(UserContext.class::cast)
            .map(userContext -> {
                final Optional<List<Utente>> usersForUid = Optional.ofNullable(
                    findUsersForUid(userContext.getLogin())).filter(utentes -> !utentes.isEmpty());
                if (usersForUid.isPresent()) {
                    userContext.users(usersForUid.get()
                        .stream()
                        .map(utente -> new UserContext(utente))
                        .collect(Collectors.toList()));
                } else {
                    userContext.users(Collections.singletonList(loadUserByUsername(userContext.getLogin())));
                }
                return userContext;
            })
            .orElseThrow(() -> new RuntimeException("something went wrong " + authentication.toString()));
    }
}
