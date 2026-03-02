;; Vort Tokenizer - Core Minting and Redemption Engine
;; Deposit sBTC -> Mint equal PT + YT (1:1)
;; Redeem PT + YT -> Return sBTC (only after maturity)

(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-INVALID-AMOUNT (err u403))
(define-constant ERR-EPOCH-NOT-MATURE (err u410))
(define-constant ERR-INSUFFICIENT-BALANCE (err u411))
(define-constant ERR-TRANSFER-FAILED (err u412))
(define-constant CONTRACT-OWNER tx-sender)


;; Epoch configuration
(define-data-var epoch-id uint u120)
(define-data-var epoch-start-block uint block-height)
(define-data-var epoch-end-block uint (+ block-height u17280)) ;; ~120 days at 10min blocks
(define-data-var total-deposits uint u0)
(define-data-var paused bool false)

;; Read-only: epoch state
(define-read-only (get-epoch-info)
  {
    epoch-id: (var-get epoch-id),
    start-block: (var-get epoch-start-block),
    end-block: (var-get epoch-end-block),
    total-deposits: (var-get total-deposits),
    is-mature: (>= block-height (var-get epoch-end-block)),
    blocks-remaining: (if (>= block-height (var-get epoch-end-block))
                        u0
                        (- (var-get epoch-end-block) block-height))
  }
)

(define-read-only (is-epoch-mature)
  (>= block-height (var-get epoch-end-block))
)

;; Deposit: transfer sBTC from user, mint PT + YT 1:1
(define-public (deposit (amount uint))
  (begin
    (asserts! (not (var-get paused)) ERR-NOT-AUTHORIZED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (not (is-epoch-mature)) ERR-EPOCH-NOT-MATURE)

    ;; Transfer sBTC from user to this contract
    (try! (contract-call? .sbtc-token transfer amount tx-sender (as-contract tx-sender) none))

    ;; Mint PT and YT 1:1
    (try! (contract-call? .pt-token mint amount tx-sender))
    (try! (contract-call? .yt-token mint amount tx-sender))

    ;; Update total deposits
    (var-set total-deposits (+ (var-get total-deposits) amount))

    (print {event: "deposit", sender: tx-sender, amount: amount, epoch: (var-get epoch-id)})
    (ok amount)
  )
)

;; Redeem: burn PT + YT, return sBTC (only after maturity)
(define-public (redeem (amount uint))
  (begin
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (is-epoch-mature) ERR-EPOCH-NOT-MATURE)

    ;; Burn PT and YT from sender
    (try! (contract-call? .pt-token burn amount tx-sender))
    (try! (contract-call? .yt-token burn amount tx-sender))

    ;; Return sBTC to user
    (try! (as-contract (contract-call? .sbtc-token transfer amount tx-sender (get sender (unwrap-panic (get-caller-info))) none)))

    ;; Update total deposits
    (var-set total-deposits (- (var-get total-deposits) amount))

    (print {event: "redeem", sender: tx-sender, amount: amount, epoch: (var-get epoch-id)})
    (ok amount)
  )
)

;; Helper to retrieve the original caller in as-contract context
(define-private (get-caller-info)
  (ok {sender: tx-sender})
)

;; Admin: pause/unpause (emergency only)
(define-public (set-paused (new-state bool))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (ok (var-set paused new-state))
  )
)

;; Admin: configure epoch (only before deposits start)
(define-public (configure-epoch (new-id uint) (start uint) (end uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (var-get total-deposits) u0) ERR-NOT-AUTHORIZED)
    (var-set epoch-id new-id)
    (var-set epoch-start-block start)
    (var-set epoch-end-block end)
    (ok true)
  )
)
