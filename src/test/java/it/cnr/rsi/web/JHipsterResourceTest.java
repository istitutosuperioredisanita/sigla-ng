package it.cnr.rsi.web;
import it.cnr.rsi.service.AlberoMainServiceTest;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestBuilders;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import javax.servlet.Filter;

@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles(profiles = {"ldap", "ldap-test", "test", "spring"})
@AutoConfigureMockMvc
public class JHipsterResourceTest {
    private static final Logger LOGGER = LoggerFactory.getLogger(AlberoMainServiceTest.class);

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private Filter springSecurityFilterChain;

    private MockMvc mvc;

    @Value("${security.ldap.test.user}")
    private String user;

    @Value("${security.ldap.test.password}")
    private String password;

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Before
    public void setup() {
        mvc = MockMvcBuilders
            .webAppContextSetup(context)
            .addFilters(springSecurityFilterChain)
            .build();
    }
    @Test
    public void login() throws Exception {
       mvc.perform(SecurityMockMvcRequestBuilders.formLogin("/api/authentication")
           .userParameter("j_username").passwordParam("j_password")
           .user(this.getUser())
           .password(this.getPassword()))
           .andExpect(status().isOk());
    }
}
