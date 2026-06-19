package com.smartflux.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public void sendPasswordResetEmail(String toEmail, String userName, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("SmartFlux - Redefinição de senha");

            String resetLink = frontendUrl + "/reset-password?token=" + token;

            String htmlBody = """
                    <!DOCTYPE html>
                    <html lang="pt-BR">
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="margin:0;padding:0;background:#0a0f0c;font-family:'Segoe UI',Arial,sans-serif;">
                      <table width="100%%" cellpadding="0" cellspacing="0" style="background:#0a0f0c;padding:40px 0;">
                        <tr>
                          <td align="center">
                            <table width="480" cellpadding="0" cellspacing="0" style="background:#111814;border-radius:16px;border:1px solid #1e3028;overflow:hidden;">
                              
                              <!-- Header -->
                              <tr>
                                <td style="background:linear-gradient(135deg,#0d2016 0%%,#0a1a10 100%%);padding:32px 40px;text-align:center;border-bottom:1px solid #1e3028;">
                                  <div style="width:56px;height:56px;background:rgba(94,196,167,0.15);border-radius:50%%;border:1px solid #5EC4A7;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5EC4A7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                                    </svg>
                                  </div>
                                  <h1 style="color:#5EC4A7;font-size:24px;font-weight:800;margin:0;">SmartFlux</h1>
                                </td>
                              </tr>
                              
                              <!-- Content -->
                              <tr>
                                <td style="padding:40px;">
                                  <h2 style="color:#e8f0ea;font-size:20px;font-weight:700;margin:0 0 12px;">Olá, %s!</h2>
                                  <p style="color:#8aab96;font-size:15px;line-height:1.6;margin:0 0 24px;">
                                    Recebemos uma solicitação para redefinir a senha da sua conta SmartFlux. 
                                    Clique no botão abaixo para criar uma nova senha.
                                  </p>
                                  
                                  <div style="text-align:center;margin:32px 0;">
                                    <a href="%s" style="display:inline-block;background:#5EC4A7;color:#030D08;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;letter-spacing:0.02em;">
                                      Redefinir minha senha
                                    </a>
                                  </div>
                                  
                                  <p style="color:#566e60;font-size:13px;line-height:1.6;margin:0 0 8px;">
                                    Ou copie e cole este link no navegador:
                                  </p>
                                  <p style="background:#0d2016;border:1px solid #1e3028;border-radius:8px;padding:12px;color:#5EC4A7;font-size:12px;word-break:break-all;margin:0 0 24px;">
                                    %s
                                  </p>
                                  
                                  <p style="color:#566e60;font-size:13px;line-height:1.6;margin:0;">
                                    ⏱ Este link expira em <strong style="color:#8aab96;">30 minutos</strong>.<br>
                                    Se você não solicitou a redefinição, pode ignorar este e-mail com segurança.
                                  </p>
                                </td>
                              </tr>
                              
                              <!-- Footer -->
                              <tr>
                                <td style="background:#0d1610;border-top:1px solid #1e3028;padding:20px 40px;text-align:center;">
                                  <p style="color:#3d5445;font-size:12px;margin:0;">
                                    © 2025 SmartFlux. Este é um e-mail automático, não responda.
                                  </p>
                                </td>
                              </tr>
                              
                            </table>
                          </td>
                        </tr>
                      </table>
                    </body>
                    </html>
                    """.formatted(userName, resetLink, resetLink);

            helper.setText(htmlBody, true);
            mailSender.send(message); 
            log.info("=====================================================");
            log.info("E-MAIL SIMULADO PARA: {}", toEmail);
            log.info("CLIQUE NO LINK ABAIXO PARA RESETAR A SENHA NO FRONT:");
            log.info(resetLink);
            log.info("=====================================================");
            log.info("E-mail de redefinição de senha enviado para: {}", toEmail);

        } catch (Exception e) { 
            log.error("Erro ao simular e-mail de redefinição de senha para {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Falha ao simular o e-mail de recuperação de senha.");
        }
    }
}
