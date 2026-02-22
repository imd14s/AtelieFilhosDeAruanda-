-- Adiciona suporte à venda de pacotes de cupons em assinaturas
ALTER TABLE subscription_plans 
ADD COLUMN is_coupon_pack BOOLEAN DEFAULT FALSE,
ADD COLUMN coupon_bundle_count INTEGER DEFAULT 0,
ADD COLUMN coupon_discount_percentage NUMERIC(5, 2) DEFAULT 0,
ADD COLUMN coupon_validity_days INTEGER DEFAULT 0;
