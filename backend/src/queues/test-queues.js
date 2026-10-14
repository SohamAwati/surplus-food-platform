import { expiryQueue } from "./expiry.queue.js";
import { slaQueue } from "./sla.queue.js";
import { notificationQueue } from "./notification.queue.js";

try {
  const expiryJob = await expiryQueue.add(
    "test-expiry",
    {
      message: "BullMQ expiry test",
    }
  );

  const slaJob = await slaQueue.add(
    "test-sla",
    {
      message: "BullMQ SLA test",
    }
  );

  const notificationJob =
    await notificationQueue.add(
      "test-notification",
      {
        message: "BullMQ notification test",
      }
    );

  console.log("Expiry job:", expiryJob.id);
  console.log("SLA job:", slaJob.id);
  console.log(
    "Notification job:",
    notificationJob.id
  );

  await expiryQueue.close();
  await slaQueue.close();
  await notificationQueue.close();

  process.exit(0);
} catch (error) {
  console.error(
    "BullMQ queue test failed:",
    error
  );

  process.exit(1);
}