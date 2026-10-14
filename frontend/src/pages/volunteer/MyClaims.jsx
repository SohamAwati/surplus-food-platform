import { DashboardLayout } from "../../layouts/DashboardLayout";
import MyClaimsView from "../../features/claims/components/MyClaimsView";

export default function MyClaims() {
  return (
    <DashboardLayout title="My Food Claims">
      <MyClaimsView />
    </DashboardLayout>
  );
}