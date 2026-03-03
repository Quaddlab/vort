;; Vort Yield Router - Yield Accrual, Distribution & Zest Integration
;; Routes deposited sBTC to Zest Protocol (mock vault on testnet)
;; Manages yield splits: 90% to YT holders, 5% treasury, 5% reserve

(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-NO-YIELD (err u420))
(define-constant ERR-ALREADY-CLAIMED (err u421))
(define-constant ERR-EPOCH-NOT-MATURE (err u422))
(define-constant ERR-INSUFFICIENT-BALANCE (err u423))
(define-constant CONTRACT-OWNER tx-sender)

;; Yield split ratios (in basis points, total = 10000)
(define-constant YIELD-TO-HOLDERS u9000)  ;; 90%
(define-constant YIELD-TO-TREASURY u500)  ;; 5%
(define-constant YIELD-TO-RESERVE u500)   ;; 5%

;; State
(define-data-var total-yield-accrued uint u0)
(define-data-var total-yield-distributed uint u0)
(define-data-var reserve-balance uint u0)
(define-data-var treasury-address principal CONTRACT-OWNER)
(define-data-var yield-per-token-stored uint u0)
(define-data-var total-deposited-to-zest uint u0)

;; Per-user yield tracking
(define-map user-yield-paid principal uint)
(define-map user-yield-earned principal uint)

;; ============================================================================
;; READ-ONLY FUNCTIONS
;; ============================================================================

(define-read-only (get-yield-info)
  {
    total-accrued: (var-get total-yield-accrued),
    total-distributed: (var-get total-yield-distributed),
    reserve: (var-get reserve-balance),
    yield-per-token: (var-get yield-per-token-stored),
    deposited-to-zest: (var-get total-deposited-to-zest)
  }
)

(define-read-only (get-claimable-yield (user principal))
  (let (
    (yt-balance (unwrap-panic (contract-call? .yt-token get-balance user)))
    (paid (default-to u0 (map-get? user-yield-paid user)))
    (current-rate (var-get yield-per-token-stored))
    (pending (/ (* yt-balance (- current-rate paid)) u1000000))
    (earned (default-to u0 (map-get? user-yield-earned user)))
  )
    (+ pending earned)
  )
)

;; ============================================================================
;; ZEST INTEGRATION - Deposit routing
;; ============================================================================

;; Route sBTC from tokenizer to Zest vault for yield generation
;; Called by the tokenizer after receiving sBTC from user
(define-public (route-to-zest (amount uint))
  (begin
    (asserts! (> amount u0) (err u403))
    ;; Forward sBTC to the mock Zest vault
    ;; In production: contract-call? 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.v0-4-market supply-collateral-add ...
    (try! (as-contract 
      (contract-call? .mock-zest-vault deposit amount tx-sender)))

    (var-set total-deposited-to-zest (+ (var-get total-deposited-to-zest) amount))

    (print {event: "routed-to-zest", amount: amount, 
            total-in-zest: (var-get total-deposited-to-zest)})
    (ok amount)
  )
)

;; ============================================================================
;; YIELD ACCRUAL & DISTRIBUTION
;; ============================================================================

;; Accrue yield - called when new yield arrives from Zest Protocol
(define-public (accrue-yield (amount uint))
  (let (
    (total-yt (unwrap-panic (contract-call? .yt-token get-total-supply)))
    (holder-share (/ (* amount YIELD-TO-HOLDERS) u10000))
    (treasury-share (/ (* amount YIELD-TO-TREASURY) u10000))
    (reserve-share (/ (* amount YIELD-TO-RESERVE) u10000))
  )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (> amount u0) ERR-NO-YIELD)

    ;; Update yield-per-token for holder distribution
    (if (> total-yt u0)
      (var-set yield-per-token-stored
        (+ (var-get yield-per-token-stored)
           (/ (* holder-share u1000000) total-yt)))
      false
    )

    ;; Update state
    (var-set total-yield-accrued (+ (var-get total-yield-accrued) amount))
    (var-set reserve-balance (+ (var-get reserve-balance) reserve-share))

    ;; Transfer treasury share
    (try! (as-contract
      (contract-call? .sbtc-token transfer treasury-share tx-sender (var-get treasury-address) none)))

    (print {event: "yield-accrued", amount: amount, holder-share: holder-share,
            treasury-share: treasury-share, reserve-share: reserve-share})
    (ok amount)
  )
)

;; Claim yield - YT holders call this to collect accrued yield
(define-public (claim-yield)
  (let (
    (caller tx-sender)
    (claimable (get-claimable-yield caller))
    (current-rate (var-get yield-per-token-stored))
  )
    (asserts! (> claimable u0) ERR-NO-YIELD)

    ;; Update user tracking
    (map-set user-yield-paid caller current-rate)
    (map-set user-yield-earned caller u0)

    ;; Transfer yield to user
    (try! (as-contract
      (contract-call? .sbtc-token transfer claimable tx-sender caller none)))

    (var-set total-yield-distributed (+ (var-get total-yield-distributed) claimable))

    (print {event: "yield-claimed", user: caller, amount: claimable})
    (ok claimable)
  )
)

;; Admin: set treasury address
(define-public (set-treasury (new-treasury principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (ok (var-set treasury-address new-treasury))
  )
)
