-- Seed inicial de Feature Flags
INSERT INTO feature_flags (id, flag_key, enabled, value_json, updated_at)
VALUES 
(gen_random_uuid(), 'MAINTENANCE_MODE', false, '{"reason": "Upgrade de sistema", "eta": "2h"}', NOW())
ON CONFLICT (flag_key) DO NOTHING;
