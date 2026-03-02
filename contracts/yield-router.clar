;; Vort Yield Router - Yield Accrual and Epoch Manager
;; Manages yield from Zest Protocol, splits to YT holders/treasury/reserve

(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-NO-YIELD (err u420))
(define-constant ERR-ALREADY-CLAIMED (err u421))
(define-constant ERR-EPOCH-NOT-MATURE (err u422))
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

;; Per-user yield tracking
(define-map user-yield-paid principal uint)
(define-map user-yield-earned principal uint)

;; Read-only: global yield state
(define-read-only (get-yield-info)
  {
    total-accrued: (var-get total-yield-accrued),
    total-distributed: (var-get total-yield-distributed),
    reserve: (var-get reserve-balance),
    yield-per-token: (var-get yield-per-token-stored)
  }
)

;; Read-only: user's claimable yield
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
    (claimable (get-claimable-yield tx-sender))
    (current-rate (var-get yield-per-token-stored))
  )
    (asserts! (> claimable u0) ERR-NO-YIELD)

    ;; Update user tracking
    (map-set user-yield-paid tx-sender current-rate)
    (map-set user-yield-earned tx-sender u0)

    ;; Transfer yield to user
    (try! (as-contract
      (contract-call? .sbtc-token transfer claimable tx-sender tx-sender none)))

    (var-set total-yield-distributed (+ (var-get total-yield-distributed) claimable))

    (print {event: "yield-claimed", user: tx-sender, amount: claimable})
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
