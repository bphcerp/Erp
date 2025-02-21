import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/hooks/Auth";
import { BookOpen, UploadIcon, List, Computer } from "lucide-react";
import { Navigate, Outlet } from "react-router-dom";
import { SidebarMenuGroup } from "@/components/AppSidebar";

const FacultyLayout = () => {
  const { checkAccess } = useAuth();
  const items: SidebarMenuGroup[] = [];

  if (checkAccess("admin")) {
    items.push({
      title: "Course Handouts",
      items: [
        {
            title: "Admin",
            icon: <Computer />,
            url: "/admin",
          },
          {
            title: "Course Handouts",
            icon: <BookOpen />,
            url: "/admin/course-handouts",
          },
      ],
    });
  }

  return items.length !== 0 ? (
    <>
      <AppSidebar items={items} />
      <Outlet />
    </>
  ) : (
    <Navigate to="/" />
  );
};

export default FacultyLayout;