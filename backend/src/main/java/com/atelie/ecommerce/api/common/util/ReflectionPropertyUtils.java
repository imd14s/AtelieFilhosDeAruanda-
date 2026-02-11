package com.atelie.ecommerce.api.common.util;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * Utility class for common reflection operations used across the application.
 * Helps in dynamic property mapping and instantiation when working with
 * flexible DTOs or entities.
 */
public class ReflectionPropertyUtils {

    /**
     * Instantiates a class using its default constructor.
     */
    public static <T> T instantiate(Class<T> clazz) {
        try {
            return clazz.getDeclaredConstructor().newInstance();
        } catch (Exception e) {
            throw new IllegalStateException("Cannot instantiate " + clazz.getName() + " (no default constructor?)", e);
        }
    }

    /**
     * Tries to set a value on a target object using a setter method name.
     */
    public static void trySet(Object target, String methodName, Object value) {
        if (target == null || value == null)
            return;
        try {
            Method m = findMethod(target.getClass(), methodName, value.getClass());
            if (m != null)
                m.invoke(target, value);
        } catch (Exception ignored) {
            // Best-effort mapping
        }
    }

    /**
     * Tries to read a boolean value from a target object using multiple candidates.
     */
    public static Boolean tryGetBoolean(Object target, String... methodNames) {
        for (String n : methodNames) {
            try {
                Method m = target.getClass().getMethod(n);
                Object v = m.invoke(target);
                if (v instanceof Boolean b)
                    return b;
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    /**
     * Tries to read a string value from a target object using multiple candidates.
     */
    public static String tryGetString(Object target, String... methodNames) {
        for (String n : methodNames) {
            try {
                Method m = target.getClass().getMethod(n);
                Object v = m.invoke(target);
                if (v != null)
                    return String.valueOf(v);
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    /**
     * Reads a value from an object using candidate property names (via getter or
     * direct field access).
     */
    public static Object readAny(Object obj, String... candidates) {
        for (String key : candidates) {
            // 1) getter (getX / x())
            Object v = tryGetByGetter(obj, key);
            if (v != null)
                return v;

            // 2) field
            v = tryGetByField(obj, key);
            if (v != null)
                return v;
        }
        return null;
    }

    /**
     * Reads a UUID value from an object using candidate property names.
     */
    public static UUID readUUID(Object obj, String... keys) {
        Object v = readAny(obj, keys);
        if (v == null)
            return null;
        if (v instanceof UUID u)
            return u;
        return UUID.fromString(String.valueOf(v));
    }

    /**
     * Reads a BigDecimal value from an object using candidate property names.
     */
    public static BigDecimal readBigDecimal(Object obj, String... keys) {
        Object v = readAny(obj, keys);
        if (v == null)
            return null;
        if (v instanceof BigDecimal bd)
            return bd;
        return new BigDecimal(String.valueOf(v));
    }

    private static Method findMethod(Class<?> clazz, String name, Class<?> paramType) {
        try {
            return clazz.getMethod(name, paramType);
        } catch (NoSuchMethodException e) {
            for (Method m : clazz.getMethods()) {
                if (!m.getName().equals(name))
                    continue;
                if (m.getParameterCount() != 1)
                    continue;
                if (m.getParameterTypes()[0].isAssignableFrom(paramType))
                    return m;
            }
            return null;
        }
    }

    private static Object tryGetByGetter(Object obj, String key) {
        String cap = key.substring(0, 1).toUpperCase() + key.substring(1);
        String[] names = new String[] { "get" + cap, key };
        for (String n : names) {
            try {
                Method m = obj.getClass().getMethod(n);
                return m.invoke(obj);
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    private static Object tryGetByField(Object obj, String key) {
        try {
            Field f = obj.getClass().getDeclaredField(key);
            f.setAccessible(true);
            return f.get(obj);
        } catch (Exception ignored) {
        }
        return null;
    }
}
