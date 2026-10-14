import { submitProof, acknowledgeProof } from "../services/proof/proof.service.js";
import { processTransactionRewards } from "../services/rewards/reward.service.js";
import cloudinary from "../config/cloudinary.js";

export async function submitProofController(req, res, next) {
  try {
    const { transactionId } = req.params;
    const { notes, beneficiaryCount } = req.body;
    let imageUrl = null;

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      try {
        if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_CLOUD_NAME) {
          const result = await cloudinary.uploader.upload(dataURI, {
            folder: "surplus_proofs",
          });
          imageUrl = result.secure_url;
        } else {
          imageUrl = dataURI;
        }
      } catch (uploadErr) {
        console.warn("[Cloudinary upload notice]:", uploadErr.message);
        imageUrl = dataURI;
      }
    }

    const count = beneficiaryCount ? parseInt(beneficiaryCount, 10) : null;

    const proof = await submitProof(req.user.id, transactionId, {
      imageUrl,
      notes,
      beneficiaryCount: count,
    });

    res.status(201).json({
      success: true,
      message: "Proof submitted successfully.",
      data: proof,
    });
  } catch (error) {
    next(error);
  }
}

export async function acknowledgeProofController(req, res, next) {
  try {
    const { transactionId } = req.params;

    const transaction = await acknowledgeProof(req.user.id, transactionId);

    // Trigger reward engine in background
    processTransactionRewards(transactionId).catch(err => {
      console.error("[REWARD ERROR] Failed to process rewards for transaction", transactionId, err);
    });

    res.json({
      success: true,
      message: "Proof acknowledged successfully. Transaction closed.",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
}
