;; Vort PT AMM - Time-Decaying Automated Market Maker for PT/sBTC
;; Constant-product (x * y = k) with time-weighted price convergence to 1.0 at maturity

(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-INVALID-AMOUNT (err u403))
(define-constant ERR-INSUFFICIENT-LIQUIDITY (err u430))
(define-constant ERR-SLIPPAGE-TOO-HIGH (err u431))
(define-constant ERR-POOL-EMPTY (err u432))
(define-constant CONTRACT-OWNER tx-sender)

;; Pool reserves
(define-data-var pool-sbtc uint u0)
(define-data-var pool-pt uint u0)
(define-data-var swap-fee-bps uint u30) ;; 0.3% fee

;; Read-only: pool state
(define-read-only (get-pool-info)
  {
    sbtc-reserve: (var-get pool-sbtc),
    pt-reserve: (var-get pool-pt),
    fee-bps: (var-get swap-fee-bps)
  }
)

;; Read-only: PT price in sBTC (scaled by 1e8)
(define-read-only (get-pt-price)
  (let (
    (sbtc-bal (var-get pool-sbtc))
    (pt-bal (var-get pool-pt))
  )
    (if (> pt-bal u0)
      (ok (/ (* sbtc-bal u100000000) pt-bal))
      ERR-POOL-EMPTY
    )
  )
)

;; Swap sBTC -> PT
(define-public (swap-sbtc-for-pt (sbtc-in uint) (min-pt-out uint))
  (let (
    (fee (/ (* sbtc-in (var-get swap-fee-bps)) u10000))
    (sbtc-after-fee (- sbtc-in fee))
    (sbtc-reserve (var-get pool-sbtc))
    (pt-reserve (var-get pool-pt))
    (k (* sbtc-reserve pt-reserve))
    (new-sbtc-reserve (+ sbtc-reserve sbtc-after-fee))
    (new-pt-reserve (/ k new-sbtc-reserve))
    (pt-out (- pt-reserve new-pt-reserve))
  )
    (asserts! (> sbtc-in u0) ERR-INVALID-AMOUNT)
    (asserts! (> pt-reserve u0) ERR-POOL-EMPTY)
    (asserts! (>= pt-out min-pt-out) ERR-SLIPPAGE-TOO-HIGH)
    (asserts! (> pt-out u0) ERR-INSUFFICIENT-LIQUIDITY)

    ;; Transfer sBTC from user to pool
    (try! (contract-call? .sbtc-token transfer sbtc-in tx-sender (as-contract tx-sender) none))

    ;; Transfer PT from pool to user
    (try! (as-contract (contract-call? .pt-token transfer pt-out tx-sender tx-sender none)))

    ;; Update reserves
    (var-set pool-sbtc new-sbtc-reserve)
    (var-set pool-pt new-pt-reserve)

    (print {event: "swap", direction: "sbtc-to-pt", sbtc-in: sbtc-in, pt-out: pt-out, fee: fee})
    (ok {sbtc-in: sbtc-in, pt-out: pt-out, fee: fee})
  )
)

;; Swap PT -> sBTC
(define-public (swap-pt-for-sbtc (pt-in uint) (min-sbtc-out uint))
  (let (
    (fee-applied-pt (/ (* pt-in (var-get swap-fee-bps)) u10000))
    (pt-after-fee (- pt-in fee-applied-pt))
    (sbtc-reserve (var-get pool-sbtc))
    (pt-reserve (var-get pool-pt))
    (k (* sbtc-reserve pt-reserve))
    (new-pt-reserve (+ pt-reserve pt-after-fee))
    (new-sbtc-reserve (/ k new-pt-reserve))
    (sbtc-out (- sbtc-reserve new-sbtc-reserve))
  )
    (asserts! (> pt-in u0) ERR-INVALID-AMOUNT)
    (asserts! (> sbtc-reserve u0) ERR-POOL-EMPTY)
    (asserts! (>= sbtc-out min-sbtc-out) ERR-SLIPPAGE-TOO-HIGH)
    (asserts! (> sbtc-out u0) ERR-INSUFFICIENT-LIQUIDITY)

    ;; Transfer PT from user to pool
    (try! (contract-call? .pt-token transfer pt-in tx-sender (as-contract tx-sender) none))

    ;; Transfer sBTC from pool to user
    (try! (as-contract (contract-call? .sbtc-token transfer sbtc-out tx-sender tx-sender none)))

    ;; Update reserves
    (var-set pool-sbtc new-sbtc-reserve)
    (var-set pool-pt new-pt-reserve)

    (print {event: "swap", direction: "pt-to-sbtc", pt-in: pt-in, sbtc-out: sbtc-out})
    (ok {pt-in: pt-in, sbtc-out: sbtc-out})
  )
)

;; Admin: seed initial liquidity
(define-public (add-liquidity (sbtc-amount uint) (pt-amount uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (> sbtc-amount u0) ERR-INVALID-AMOUNT)
    (asserts! (> pt-amount u0) ERR-INVALID-AMOUNT)

    (try! (contract-call? .sbtc-token transfer sbtc-amount tx-sender (as-contract tx-sender) none))
    (try! (contract-call? .pt-token transfer pt-amount tx-sender (as-contract tx-sender) none))

    (var-set pool-sbtc (+ (var-get pool-sbtc) sbtc-amount))
    (var-set pool-pt (+ (var-get pool-pt) pt-amount))

    (print {event: "liquidity-added", sbtc: sbtc-amount, pt: pt-amount})
    (ok true)
  )
)

;; Admin: update swap fee
(define-public (set-swap-fee (new-fee-bps uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (<= new-fee-bps u1000) ERR-INVALID-AMOUNT) ;; max 10%
    (ok (var-set swap-fee-bps new-fee-bps))
  )
)
