import { DashboardLayout } from "../../layouts/DashboardLayout";
import { MyTransactionsView } from "../../features/transactions/MyTransactionsView";

export function MyTransactions() {
  return (
    <DashboardLayout title="Rescue Transactions">
      <MyTransactionsView />
    </DashboardLayout>
  );
}