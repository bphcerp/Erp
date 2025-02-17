import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/views/Home";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/Auth";
import { GOOGLE_CLIENT_ID } from "@/lib/constants";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProtectedLayout from "@/layouts/Protected";
import Admin from "@/views/Admin";
import AdminLayout from "@/layouts/Admin";
import MembersView from "@/views/Admin/Members";
import MemberDetailsView from "./views/Admin/Members/[member]";
import RoleDetailsView from "./views/Admin/Roles/[role]";
import { Toaster } from "./components/ui/sonner";
import RolesView from "./views/Admin/Roles";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <BrowserRouter
            // react-router future version flags, prevents console warnings
            future={{
              v7_relativeSplatPath: true,
              v7_startTransition: true,
            }}
          >
            <SidebarProvider>
              <Routes>
                <Route path="/" element={<Home />} />
                {/* Protected Routes (requires authentication) */}
                <Route path="/" element={<ProtectedLayout />}>
                  <Route path="admin" element={<AdminLayout />}>
                    <Route index element={<Admin />} />
                    <Route path="members" element={<MembersView />} />
                    <Route
                      path="members/:member"
                      element={<MemberDetailsView />}
                    />
                    <Route path="roles" element={<RolesView />} />
                    <Route path="roles/:role" element={<RoleDetailsView />} />
                  </Route>
                </Route>
              </Routes>
            </SidebarProvider>
            <Toaster />
          </BrowserRouter>
        </AuthProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
};

export default App;
