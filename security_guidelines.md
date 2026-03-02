# SplitBTC MVP – Security & Performance Guidelines

## SECTION 1: SECURITY GUIDELINES

### A. Secrets & Keys (Never Expose)

- Private keys
- Mnemonics / seed phrases
- API keys (Hiro, etc.)
- RPC URLs containing secret keys
- Database credentials
- Admin credentials
- JWT secrets

Best Practice:

- Use environment variables (.env not committed)
- Use secret managers (AWS KMS, Vault, etc.)
- Rotate keys periodically

### B. Files You Must Never Upload or Expose

- .env files
- Deployment scripts containing private keys
- Debug logs
- SQL dumps with real wallet data
- Screenshots containing secrets
- Build artifacts with embedded credentials

### C. What You Must NEVER Log (Critical)

Never log:

- Private keys
- Seed phrases
- Wallet signatures
- Raw transaction hex
- Authentication tokens
- API keys
- Full RPC responses containing sensitive data
- Signed payloads

Only log:

- Request ID
- Timestamp
- High-level success/failure messages
- Non-sensitive metrics

### D. Frontend Security Rules

- Never expose private keys
- Never store sensitive data in localStorage
- Never expose backend secrets in frontend code
- Avoid logging wallet details in browser console
- Use @stacks/connect for all wallet interactions (Leather / Xverse)

### E. Backend Security Rules

- Validate all inputs strictly
- Validate wallet addresses and numeric values
- Implement rate limiting
- Enforce HTTPS only
- Never store private keys
- Never sign transactions on behalf of users
- Use Hiro API + Chainhooks v2 only (no direct RPC secrets)

### F. Smart Contract Security (Clarity-specific)

- No admin backdoors (use multisig pause only via governance.clar)
- Implement proposed Security Traits (ownable, pausable) where applicable
- Use safe arithmetic (Clarity built-in)
- Avoid unbounded loops
- Strict access control
- Use Clarinet linter (v3.13+) for dead-code and no-op detection
- Follow Stacks “Path To Production” guide (Jan 2026)

### G. sBTC & Yield Integration Security

- Always use SIP-010 safe transfer for sBTC
- Validate Zest Protocol supply/claim calls in yield-router.clar
- Enforce maturity block checks in tokenizer.clar
- Reserve buffer can never be withdrawn by admin

### H. Deployment Rules

- Do not deploy in debug mode
- Do not leave verbose logs enabled
- Separate testnet and mainnet configs strictly
- Encrypt backups

### I. Pre-Release Security Checklist

- Inputs validated
- Rate limiting active
- HTTPS enforced
- No secrets in logs
- Contracts tested and reviewed (Clarinet + manual)
- Chainhooks v2 registered with reorg protection

## SECTION 2: PERFORMANCE & SPEED OPTIMIZATION

### A. Frontend Performance

- Use static generation for landing page
- Lazy-load Web3 libraries (@stacks/connect)
- Code-split dashboard pages
- Optimize images (WebP, compression)
- Avoid unnecessary re-renders
- Minimize bundle size

### B. Blockchain Interaction Optimization

- Avoid aggressive polling completely
- Use Hiro Chainhooks v2 for real-time events (deposits, yield, redemptions)
- Cache contract constants
- Batch RPC requests via Hiro API
- Avoid repeated on-chain calls

### C. Backend Optimization

- Use caching layer (Redis or in-memory)
- Cache expensive computations (e.g., snapshot data)
- Add database indexes (wallet_address, tx_hash, timestamp)
- Avoid full table scans
- Avoid heavy joins without indexing
- Rely on Chainhooks v2 instead of background workers for most updates

### D. Infrastructure Optimization

- Use CDN for static assets
- Enable Gzip or Brotli compression
- Deploy close to target users
- Use HTTPS only

### E. Smart Contract Efficiency (Clarity)

- Minimize storage writes
- Avoid unnecessary loops
- Emit events instead of storing excessive data
- Reduce transaction steps where possible

### F. MVP Performance Focus

- Keep bundle small
- Avoid unnecessary blockchain calls
- Cache snapshot data via Chainhooks v2
- Keep UI simple and fast

Performance Goal Targets:

- Landing page load under 1.5 seconds
- Dashboard initial load under 2 seconds

## Stacks MVP Security & Performance Checklist (Final Gate)

- All contracts use SIP-010 for PT/YT/sBTC
- Yield sourced only from audited Zest Protocol pool
- Chainhooks v2 registered for all critical events
- Clarinet tests + linter passed
- Testnet deployment with sBTC faucet verified
- No polling anywhere in frontend/backend
- Security review against Stacks Path To Production guide

FINAL NOTE:
Security and performance must be designed from the start. Avoid exposing secrets, avoid logging sensitive data, validate everything, minimize blockchain calls, and cache intelligently for a fast and secure MVP.
