package it.cnr.rsi.web.rest.errors;

public class InvalidPasswordException extends RuntimeException{
    private final String password;

    public InvalidPasswordException(String password) {
        super(String.format("%s is not valid", password));
        this.password = password;
    }
}
