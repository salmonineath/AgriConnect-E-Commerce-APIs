import { randomUUID } from "crypto";
import { AppError } from "@/utils/app-error";
import { badRequestError } from "@/utils/helper/error-helper";

/**
 * PLACEHOLDER payment provider — no real money moves.
 *
 * TODO: replace chargeCard/refundCharge with a real gateway (e.g. ABA PayWay,
 * Bakong KHQR or Stripe) before taking real payments.
 *
 * A real gateway (Stripe, ABA PayWay, ...) would tokenize the card on the
 * frontend and send us a one-time token. We mimic that with test tokens, so
 * no card numbers ever reach this API:
 *   - "tok_success"  → payment approved
 *   - "tok_declined" → card declined
 * Replace the bodies of chargeCard/refundCharge to plug in a real provider.
 */
const TEST_TOKENS = { success: "tok_success", declined: "tok_declined" } as const;

export const chargeCard = async (amount: number, paymentToken: unknown) => {
    if (paymentToken === TEST_TOKENS.declined) {
        throw new AppError("Card was declined.", 402);
    }
    if (paymentToken !== TEST_TOKENS.success) {
        throw badRequestError(`Invalid paymentToken. Use "${TEST_TOKENS.success}" or "${TEST_TOKENS.declined}" (simulated).`);
    }
    return { transactionId: `sim_${randomUUID()}`, amount };
};

export const refundCharge = async (_transactionId: string) => {
    // Simulated: a real provider call goes here
    return { refunded: true };
};
