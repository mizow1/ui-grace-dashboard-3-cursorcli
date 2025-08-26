import { AdminHeader } from "@/components/AdminHeader";
import { UserTable } from "@/components/UserTable";

export default function Users() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-subtle">
      <AdminHeader title="ユーザー管理" />
      
      <main className="flex-1 p-6">
        <UserTable />
      </main>
    </div>
  );
}