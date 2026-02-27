package com.atelie.ecommerce.application.service.marketing;

import com.atelie.ecommerce.domain.marketing.model.EmailSignature;
import com.atelie.ecommerce.infrastructure.persistence.marketing.EmailSignatureRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class EmailSignatureService {

    private final EmailSignatureRepository repository;

    public EmailSignatureService(EmailSignatureRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public EmailSignature save(EmailSignature signature) {
        return repository.save(signature);
    }

    public List<EmailSignature> findAll() {
        return repository.findAll();
    }

    public EmailSignature findById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Assinatura não encontrada"));
    }

    @Transactional
    public void delete(UUID id) {
        repository.deleteById(id);
    }

    public String generateHtml(EmailSignature sig) {
        if (sig == null)
            return "";

        StringBuilder htmlBuilder = new StringBuilder();
        htmlBuilder.append(
                "<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"font-family: Arial, Helvetica, sans-serif; color: #1B2B42;\">\n");
        htmlBuilder.append("  <tr>\n");

        // Logo section
        if (sig.getLogoUrl() != null && !sig.getLogoUrl().isEmpty()) {
            htmlBuilder.append(
                    "    <td width=\"130\" valign=\"center\" style=\"padding-right: 20px; border-right: 2px solid #D4AF37;\">\n");
            htmlBuilder.append(String.format(
                    "      <img src=\"%s\" alt=\"Logo %s\" width=\"110\" style=\"display: block; border-radius: 50%%; border: 1px solid #EBEBEB;\">\n",
                    sig.getLogoUrl(), sig.getStoreName() != null ? sig.getStoreName() : ""));
            htmlBuilder.append("    </td>\n");
        }

        // Info section
        htmlBuilder.append("    <td valign=\"center\" style=\"padding-left: 20px;\">\n");
        if (sig.getOwnerName() != null && !sig.getOwnerName().isEmpty()) {
            htmlBuilder.append(String.format(
                    "      <h2 style=\"margin: 0 0 4px 0; color: #1B2B42; font-size: 20px; font-weight: bold; letter-spacing: 0.5px;\">%s</h2>\n",
                    sig.getOwnerName()));
        }

        String roleAndStore = "";
        if (sig.getRole() != null && !sig.getRole().isEmpty()) {
            roleAndStore += sig.getRole();
        }
        if (sig.getStoreName() != null && !sig.getStoreName().isEmpty()) {
            if (!roleAndStore.isEmpty()) {
                roleAndStore += " | ";
            }
            roleAndStore += String.format("<strong style=\"color: #1B2B42;\">%s</strong>", sig.getStoreName());
        }
        if (!roleAndStore.isEmpty()) {
            htmlBuilder.append(String.format(
                    "      <p style=\"margin: 0 0 12px 0; color: #555555; font-size: 14px;\">\n        %s\n      </p>\n",
                    roleAndStore));
        }

        htmlBuilder.append("      <p style=\"margin: 0; font-size: 13px; line-height: 1.6; color: #333333;\">\n");
        if (sig.getWhatsapp() != null && !sig.getWhatsapp().isEmpty()) {
            htmlBuilder.append(String.format(
                    "        <span style=\"color: #D4AF37;\">✦</span> <strong>WhatsApp:</strong> %s<br>\n",
                    sig.getWhatsapp()));
        }
        if (sig.getEmail() != null && !sig.getEmail().isEmpty()) {
            htmlBuilder.append(String.format(
                    "        <span style=\"color: #D4AF37;\">✦</span> <strong>E-mail:</strong> <a href=\"mailto:%s\" style=\"color: #1B2B42; text-decoration: none;\">%s</a><br>\n",
                    sig.getEmail(), sig.getEmail()));
        }
        if (sig.getStoreUrl() != null && !sig.getStoreUrl().isEmpty()) {
            String displayUrl = sig.getStoreUrl().replace("https://", "").replace("http://", "").replace("www.", "");
            htmlBuilder.append(String.format(
                    "        <span style=\"color: #D4AF37;\">✦</span> <strong>Loja:</strong> <a href=\"%s\" style=\"color: #D4AF37; text-decoration: none; font-weight: bold;\">%s</a>\n",
                    sig.getStoreUrl(), displayUrl));
        }
        htmlBuilder.append("      </p>\n");
        htmlBuilder.append("    </td>\n");
        htmlBuilder.append("  </tr>\n");

        // Motto section
        if (sig.getMotto() != null && !sig.getMotto().isEmpty()) {
            htmlBuilder.append("  <tr>\n");
            htmlBuilder.append("    <td colspan=\"2\" style=\"padding-top: 15px;\">\n");
            htmlBuilder.append(String.format(
                    "        <p style=\"margin: 0; font-size: 12px; color: #777777; font-style: italic; border-top: 1px solid #EEEEEE; padding-top: 8px;\">\n            %s\n        </p>\n",
                    sig.getMotto()));
            htmlBuilder.append("    </td>\n");
            htmlBuilder.append("  </tr>\n");
        }

        htmlBuilder.append("</table>");

        return htmlBuilder.toString();
    }
}
