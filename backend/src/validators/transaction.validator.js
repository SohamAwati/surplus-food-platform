import { z } from "zod";

/*
 * Phase 7 currently does not require any request body
 * for pickup or delivery.
 *
 * We still keep validators because:
 * - controllers remain consistent
 * - future fields can be added cleanly
 * - empty request bodies are explicitly validated
 */

export const emptyTransactionActionSchema =
  z.object({}).strict();