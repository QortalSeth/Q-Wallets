import { DECIMAL_ROUND_UP } from '../common/constants';

/**
 * Number of satoshis (smallest units) in one whole coin for the UTXO coins
 * used in this app (BTC, LTC, DOGE, DGB, RVN, ARRR).
 */
const SATS_PER_COIN = 1e8;

/**
 * Compute the maximum safely-spendable amount for a "SEND MAX" action.
 *
 * The naive `balance - fee` expression is computed in JS floating point on an
 * exact boundary value, so the prefilled amount can land right on — or a hair
 * above — the spendable cutoff. The host `SEND_COIN` check then rejects it as
 * "Insufficient funds", even though sending slightly less succeeds.
 *
 * To avoid this we:
 *  1. Do the subtraction in integer satoshi math (no float boundary error).
 *  2. Hold back a small safety buffer so the result stays strictly within the
 *     balance, absorbing fee-estimate and serialization slack.
 *
 * @param balance    Wallet balance, in whole coins.
 * @param fee        Estimated fee to reserve, in whole coins.
 * @param bufferSats Extra satoshis to hold back as a safety margin (default 0).
 * @returns The max sendable amount in whole coins (never negative), truncated
 *          to {@link DECIMAL_ROUND_UP} decimal places.
 */
export const calculateMaxSendable = (
  balance: number,
  fee: number,
  bufferSats: number = 0
): number => {
  if (!Number.isFinite(balance) || !Number.isFinite(fee)) {
    return 0;
  }

  const balanceSats = Math.round(balance * SATS_PER_COIN);
  const feeSats = Math.round(fee * SATS_PER_COIN);
  const buffer = Math.max(0, Math.trunc(bufferSats));

  const maxSats = balanceSats - feeSats - buffer;
  if (maxSats <= 0) {
    return 0;
  }

  // maxSats is an integer count of satoshis, so dividing by SATS_PER_COIN and
  // truncating to DECIMAL_ROUND_UP places yields an exact, safely-spendable
  // value that round-trips back to <= balanceSats when the fee is re-added.
  return +(maxSats / SATS_PER_COIN).toFixed(DECIMAL_ROUND_UP);
};
