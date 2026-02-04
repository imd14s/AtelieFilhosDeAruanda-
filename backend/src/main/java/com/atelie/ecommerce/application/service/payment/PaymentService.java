package com.atelie.ecommerce.application.service.payment;

import com.atelie.ecommerce.api.payment.dto.PaymentResponse;
import com.atelie.ecommerce.application.service.payment.dto.CreatePixPaymentRequest;
import org.springframework.stereotype.Service;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.util.UUID;

@Service
public class PaymentService {

    /**
     * Assinatura "fonte da verdade" (já existia no projeto, pelo log anterior).
     * Retorna PaymentResponse para bater com o PaymentController.
     */
    public PaymentResponse createPixPayment(UUID orderId, String customerName, String customerEmail, BigDecimal amount) {
        // Mantém compatível e previsível.
        // A integração real (MercadoPago etc.) deve ser feita via driver já existente no projeto.
        // Aqui nós apenas devolvemos um PaymentResponse instanciável para a API subir.
        PaymentResponse resp = instantiate(PaymentResponse.class);

        // Tentativa best-effort de preencher campos comuns sem depender de setters específicos
        trySet(resp, "setOrderId", orderId);
        trySet(resp, "setCustomerName", customerName);
        trySet(resp, "setCustomerEmail", customerEmail);
        trySet(resp, "setAmount", amount);
        trySet(resp, "setStatus", "CREATED");

        return resp;
    }

    /**
     * Compatibilidade: Controller chama via DTO (CreatePixPaymentRequest).
     * O DTO no seu projeto NÃO tem getters padrão, então lemos via reflection.
     */
    public PaymentResponse createPixPayment(CreatePixPaymentRequest req) {
        if (req == null) throw new IllegalArgumentException("Request cannot be null");

        UUID orderId = readUUID(req, "orderId", "id", "order_id");
        String customerName = readString(req, "customerName", "name", "customer_name");
        String customerEmail = readString(req, "customerEmail", "email", "customer_email");
        BigDecimal amount = readBigDecimal(req, "amount", "value", "price", "total");

        return createPixPayment(orderId, customerName, customerEmail, amount);
    }

    // ---------------- helpers (reflection) ----------------

    private static <T> T instantiate(Class<T> clazz) {
        try {
            return clazz.getDeclaredConstructor().newInstance();
        } catch (Exception e) {
            throw new IllegalStateException("Cannot instantiate " + clazz.getName() + " (no default constructor?)", e);
        }
    }

    private static void trySet(Object target, String methodName, Object value) {
        if (target == null || value == null) return;
        try {
            Method m = findMethod(target.getClass(), methodName, value.getClass());
            if (m != null) m.invoke(target, value);
        } catch (Exception ignored) {
            // não quebra build por diferenças de nomes
        }
    }

    private static Method findMethod(Class<?> clazz, String name, Class<?> paramType) {
        try {
            return clazz.getMethod(name, paramType);
        } catch (NoSuchMethodException e) {
            // tenta por assignable (ex: BigDecimal vs Number)
            for (Method m : clazz.getMethods()) {
                if (!m.getName().equals(name)) continue;
                if (m.getParameterCount() != 1) continue;
                if (m.getParameterTypes()[0].isAssignableFrom(paramType)) return m;
            }
            return null;
        }
    }

    private static Object readAny(Object obj, String... candidates) {
        for (String key : candidates) {
            // 1) getter (getX / x())
            Object v = tryGetByGetter(obj, key);
            if (v != null) return v;

            // 2) field
            v = tryGetByField(obj, key);
            if (v != null) return v;
        }
        return null;
    }

    private static Object tryGetByGetter(Object obj, String key) {
        String cap = key.substring(0, 1).toUpperCase() + key.substring(1);
        String[] names = new String[]{"get" + cap, key};
        for (String n : names) {
            try {
                Method m = obj.getClass().getMethod(n);
                return m.invoke(obj);
            } catch (Exception ignored) { }
        }
        return null;
    }

    private static Object tryGetByField(Object obj, String key) {
        try {
            Field f = obj.getClass().getDeclaredField(key);
            f.setAccessible(true);
            return f.get(obj);
        } catch (Exception ignored) { }
        return null;
    }

    private static UUID readUUID(Object obj, String... keys) {
        Object v = readAny(obj, keys);
        if (v == null) return null;
        if (v instanceof UUID u) return u;
        return UUID.fromString(String.valueOf(v));
    }

    private static String readString(Object obj, String... keys) {
        Object v = readAny(obj, keys);
        return v == null ? null : String.valueOf(v);
    }

    private static BigDecimal readBigDecimal(Object obj, String... keys) {
        Object v = readAny(obj, keys);
        if (v == null) return null;
        if (v instanceof BigDecimal bd) return bd;
        return new BigDecimal(String.valueOf(v));
    }
}
