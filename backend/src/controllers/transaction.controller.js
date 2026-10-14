import {
  getMyTransactions,
  getDonorTransactions,
  getTransaction,
  pickupTransaction,
  deliverTransaction,
} from "../services/transactions/transaction.service.js";

export async function getMyTransactionsController(
  req,
  res,
  next
) {
  try {
    const transactions =
      await getMyTransactions(req.user.id);

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDonorTransactionsController(
  req,
  res,
  next
) {
  try {
    const transactions =
      await getDonorTransactions(req.user.id);

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTransactionController(
  req,
  res,
  next
) {
  try {
    const transaction =
      await getTransaction(
        req.user.id,
        req.user.role,
        req.params.transactionId
      );

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
}

export async function pickupTransactionController(
  req,
  res,
  next
) {
  try {
    const transaction =
      await pickupTransaction(
        req.user.id,
        req.params.transactionId
      );

    res.json({
      success: true,
      message: "Pickup confirmed successfully.",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
}

export async function deliverTransactionController(
  req,
  res,
  next
) {
  try {
    const transaction =
      await deliverTransaction(
        req.user.id,
        req.params.transactionId
      );

    res.json({
      success: true,
      message: "Delivery confirmed successfully.",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
}