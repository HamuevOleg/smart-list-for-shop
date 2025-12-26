package io.github.hamuevoleg.smartshop.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationCode(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("SmartList <noreply@smartlist.com>");
        message.setTo(to);
        message.setSubject("Your Login Code");
        message.setText("Welcome to SmartList! \n\nYour verification code is: " + code + "\n\nIt expires in 5 minutes.");

        mailSender.send(message);
    }
}