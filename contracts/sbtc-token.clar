(impl-trait .sip-010-trait.sip-010-trait)

(define-fungible-token sbtc)

(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-INVALID-AMOUNT (err u403))

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) ERR-NOT-AUTHORIZED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (match memo m (print m) 0x)
    (ft-transfer? sbtc amount sender recipient)
  )
)

(define-public (mint-for-testing (amount uint) (recipient principal))
  (begin
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (ft-mint? sbtc amount recipient)
  )
)

(define-read-only (get-name) (ok "sBTC"))
(define-read-only (get-symbol) (ok "sBTC"))
(define-read-only (get-decimals) (ok u8))
(define-read-only (get-balance (account principal)) (ok (ft-get-balance sbtc account)))
(define-read-only (get-total-supply) (ok (ft-get-supply sbtc)))
(define-read-only (get-token-uri) (ok none))
