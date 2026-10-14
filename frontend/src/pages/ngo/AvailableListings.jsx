import { DashboardLayout } from "../../layouts/DashboardLayout";
import AvailableListingsView from "../../features/claims/components/AvailableListingsView";

export default function AvailableListings() {
  return (
    <DashboardLayout title="Available Food">
      <AvailableListingsView />
    </DashboardLayout>
  );
}