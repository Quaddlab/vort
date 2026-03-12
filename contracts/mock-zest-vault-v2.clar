;; Mock Zest Vault V2 - Simplified sBTC Lending Vault
;; V2: Uses real testnet sBTC. Removed simulate-yield (no mint-for-testing on real sBTC).

(define-constant ERR-NOT-AUTHORIZED (err u501))
(define-constant ERR-AMOUNT-ZERO (err u502))
(define-constant ERR-INSUFFICIENT-BALANCE (err u503))
(define-constant ERR-NO-SHARES (err u504))
(define-constant CONTRACT-OWNER tx-sender)

;; Vault state
(define-data-var total-assets uint u0)
(define-data-var total-shares uint u0)
(define-data-var interest-rate-bps uint u386) ;; 3.86% APY (matches real Zest sBTC vault)

;; Track shares per depositor
(define-map balances principal uint)

;; ============================================================================
;; READ-ONLY FUNCTIONS
;; ============================================================================

(define-read-only (get-interest-rate)
  (ok (var-get interest-rate-bps))
)

(define-read-only (get-total-assets)
  (ok (var-get total-assets))
)

(define-read-only (get-total-shares)
  (ok (var-get total-shares))
)

(define-read-only (get-utilization)
  (ok u6500)
)

(define-read-only (get-balance-of (account principal))
  (ok (default-to u0 (map-get? balances account)))
)

(define-read-only (get-underlying-balance (account principal))
  (let (
    (user-shares (default-to u0 (map-get? balances account)))
    (t-shares (var-get total-shares))
    (t-assets (var-get total-assets))
  )
    (if (is-eq t-shares u0)
      (ok u0)
      (ok (/ (* user-shares t-assets) t-shares))
    )
  )
)

;; ============================================================================
;; PUBLIC FUNCTIONS
;; ============================================================================

;; Deposit sBTC into the vault, receive shares
(define-public (deposit (amount uint) (depositor principal))
  (let (
    (current-assets (var-get total-assets))
    (current-shares (var-get total-shares))
    (shares-to-mint (if (is-eq current-shares u0)
                      amount
                      (/ (* amount current-shares) current-assets)))
    (existing (default-to u0 (map-get? balances depositor)))
  )
    (asserts! (> amount u0) ERR-AMOUNT-ZERO)

    ;; Transfer real sBTC from caller to this contract
    (try! (contract-call? 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token transfer amount tx-sender (as-contract tx-sender) none))

    ;; Update vault state
    (var-set total-assets (+ current-assets amount))
    (var-set total-shares (+ current-shares shares-to-mint))
    (map-set balances depositor (+ existing shares-to-mint))

    (print {event: "zest-vault-deposit", depositor: depositor, amount: amount,
            shares-minted: shares-to-mint})
    (ok shares-to-mint)
  )
)

;; Withdraw sBTC from vault by burning shares
(define-public (withdraw (shares uint) (recipient principal))
  (let (
    (current-assets (var-get total-assets))
    (current-shares (var-get total-shares))
    (user-shares (default-to u0 (map-get? balances tx-sender)))
  )
    (asserts! (> shares u0) ERR-AMOUNT-ZERO)
    (asserts! (> current-shares u0) ERR-NO-SHARES)
    (asserts! (>= user-shares shares) ERR-INSUFFICIENT-BALANCE)

    (let (
      (amount-out (/ (* shares current-assets) current-shares))
    )
      (var-set total-assets (- current-assets amount-out))
      (var-set total-shares (- current-shares shares))
      (map-set balances tx-sender (- user-shares shares))

      (try! (as-contract (contract-call? 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token transfer amount-out tx-sender recipient none)))

      (print {event: "zest-vault-withdraw", recipient: recipient, shares-burned: shares,
              amount-out: amount-out})
      (ok amount-out)
    )
  )
)

;; Admin: set interest rate for display
(define-public (set-interest-rate (rate-bps uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (ok (var-set interest-rate-bps rate-bps))
  )
)
