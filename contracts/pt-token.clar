(impl-trait .sip-010-trait.sip-010-trait)

(define-fungible-token principal-token)

(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-INVALID-AMOUNT (err u403))
(define-constant CONTRACT-OWNER tx-sender)

(define-data-var token-uri (optional (string-utf8 256)) (some u"https://vort.finance/metadata/pt"))
(define-data-var authorized-minter principal CONTRACT-OWNER)

(define-public (set-authorized-minter (new-minter principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (ok (var-set authorized-minter new-minter))
  )
)

(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender (var-get authorized-minter)) ERR-NOT-AUTHORIZED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (ft-mint? principal-token amount recipient)
  )
)

(define-public (burn (amount uint) (sender principal))
  (begin
    (asserts! (is-eq tx-sender (var-get authorized-minter)) ERR-NOT-AUTHORIZED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (ft-burn? principal-token amount sender)
  )
)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) ERR-NOT-AUTHORIZED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (match memo m (print m) 0x)
    (ft-transfer? principal-token amount sender recipient)
  )
)

(define-read-only (get-name) (ok "Vort Principal Token"))
(define-read-only (get-symbol) (ok "vPT"))
(define-read-only (get-decimals) (ok u8))
(define-read-only (get-balance (account principal)) (ok (ft-get-balance principal-token account)))
(define-read-only (get-total-supply) (ok (ft-get-supply principal-token)))
(define-read-only (get-token-uri) (ok (var-get token-uri)))
