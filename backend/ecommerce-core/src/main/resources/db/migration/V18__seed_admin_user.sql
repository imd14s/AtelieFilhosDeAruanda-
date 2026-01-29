-- Senha padrão: 'admin123' (hash bcrypt gerado)
-- Garante que exista pelo menos um admin para acessar o Dashboard no primeiro deploy
INSERT INTO users (id, name, email, password, role, active, created_at)
VALUES (
  gen_random_uuid(), 
  'Administrador', 
  'admin@atelie.com', 
  '$2a$10$X/hXjI.uJ.x.x.x.x.x.x.x.x.x.x.x.x.x.x', -- Hash placeholder, em prod usar hash real
  'ADMIN', 
  true, 
  NOW()
)
ON CONFLICT (email) DO NOTHING;
