-- Presale redemption tracking
CREATE TABLE IF NOT EXISTS presale_redemptions (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(44) UNIQUE NOT NULL,
  pass_token_account VARCHAR(44) NOT NULL,
  pass_balance INTEGER NOT NULL,
  redeemed_at TIMESTAMP DEFAULT NOW(),
  nft_mint VARCHAR(44),
  tx_signature VARCHAR(88),
  metadata_uri TEXT,
  
  -- Indexes for fast lookups
  CONSTRAINT unique_wallet UNIQUE(wallet_address)
);

CREATE INDEX IF NOT EXISTS idx_wallet ON presale_redemptions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_redeemed_at ON presale_redemptions(redeemed_at);
CREATE INDEX IF NOT EXISTS idx_nft_mint ON presale_redemptions(nft_mint);

-- Mint statistics
CREATE TABLE IF NOT EXISTS mint_stats (
  id SERIAL PRIMARY KEY,
  phase VARCHAR(20) NOT NULL, -- PRESALE or PUBLIC
  wallet_address VARCHAR(44) NOT NULL,
  nft_mint VARCHAR(44) NOT NULL,
  price_paid DECIMAL(10, 4) NOT NULL, -- SOL amount
  tx_signature VARCHAR(88) NOT NULL,
  minted_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mint_phase ON mint_stats(phase);
CREATE INDEX IF NOT EXISTS idx_mint_wallet ON mint_stats(wallet_address);
CREATE INDEX IF NOT EXISTS idx_minted_at ON mint_stats(minted_at);

-- Admin controls (optional)
CREATE TABLE IF NOT EXISTS mint_config (
  key VARCHAR(50) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default config
INSERT INTO mint_config (key, value) VALUES 
  ('current_phase', 'CLOSED'),
  ('public_price', '0.5'),
  ('total_supply', '3'),
  ('minted_count', '0')
ON CONFLICT (key) DO NOTHING;
