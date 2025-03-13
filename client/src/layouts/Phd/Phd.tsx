import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/hooks/Auth";
import {
  CalendarClockIcon,
  FileCheck,
  CalendarCheck2,
  List,
  Users,
  CaseUpper,
  NotepadText,
  CalendarX2,
  UserRoundPlus,
} from "lucide-react";
import { Navigate, Outlet } from "react-router-dom";
import { SidebarMenuGroup } from "@/components/AppSidebar";
import { ListBulletIcon } from "@radix-ui/react-icons";
const NotionalSupervisorLayout = () => {
  const { checkAccess } = useAuth();
  const items: SidebarMenuGroup[] = [];

  // Keeping it as admin for now, and will replace with other role(s) in the future
  if (checkAccess("admin")) {
    items.push({
      title: "Notional Supervisor",
      items: [
        {
          title: "Update Grade",
          icon: <CaseUpper />,
          url: "/phd/notional-supervisor/update-grade",
        },
      ],
    });

    items.push({
      title: "DRC Convenor",
      items: [
        {
          title: "Coursework Form",
          icon: <List />,
          url: "/phd/drc-convenor/coursework-form",
        },
        {
          title: "Update QE Deadline",
          icon: <CalendarClockIcon />,
          url: "/phd/drc-convenor/update-qualifying-exam-deadline",
        },
        {
          title: "Generate QE Application List",
          icon: <Users />,
          url: "/phd/drc-convenor/generate-qualifying-exam-form",
        },
        {
          title: "QE Application details",
          icon: <NotepadText />,
          url: "/phd/drc-convenor/phd-that-applied-for-qualifying-exam",
        },
        {
          title: "Update QE Results",
          icon: <FileCheck />,
          url: "/phd/drc-convenor/update-qualifying-exam-results-of-all-students",
        },
        {
          title: "Update QE Passing Dates",
          icon: <CalendarCheck2 />,
          url: "/phd/drc-convenor/update-qualifying-exam-passing-dates",
        },
        {
          title: "Update Proposal Deadline",
          icon: <CalendarX2 />,
          url: "/phd/drc-convenor/update-proposal-deadline",
        },
        {
          title: "Assign DAC Members",
          icon: <UserRoundPlus />,
          url: "/phd/drc-convenor/assign-dac-members",
        }
      ],
    });

    items.push({
      title: "PhD Student",
      items: [
        {
          title: "QE Form Deadline",
          icon: <CalendarClockIcon />,
          url: "/phd/phd-student/form-deadline",
        },
        {
          title: "Qualifying Exam Status",
          icon: <ListBulletIcon />,
          url: "/phd/phd-student/exam-status",
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

export default NotionalSupervisorLayout;
