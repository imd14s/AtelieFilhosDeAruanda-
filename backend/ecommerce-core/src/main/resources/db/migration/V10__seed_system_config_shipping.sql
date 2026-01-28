-- Frete: motor dinâmico (sem hardcode)
-- Modos: J3 ou FLAT_RATE
INSERT INTO system_config (config_key, config_value)
VALUES
  ('SHIPPING_PROVIDER_MODE', 'J3'),
  ('J3_RATE', '13.00'),
  ('J3_FREE_SHIPPING_THRESHOLD', '299.00'),
  -- Lista simples de prefixos de CEP (3 a 5 dígitos), separados por vírgula. Ex: "010,011,20040,301"
  ('J3_CEP_PREFIXES', ''),
  ('FLAT_RATE', '13.00'),
  ('FLAT_FREE_SHIPPING_THRESHOLD', '299.00')
ON CONFLICT (config_key) DO NOTHING;
