import { AppSidebar } from "@/components/AppSidebar";
import { PersonIcon, ListBulletIcon } from "@radix-ui/react-icons";
import { CalendarClockIcon } from "lucide-react";
import { Outlet } from "react-router-dom";
import { permissions } from "lib";

const NotionalSupervisorLayout = () => {
  const items = [
    {
      title: "Notional Supervisor",
      items: [
        {
          title: "Update Grade",
          icon: <PersonIcon />,
          url: "/phd/notional-supervisor/update-grade",
          requiredPermissions: [permissions["notional-supervisor"]],
        },
      ],
    },
    {
      title: "DRC Convenor",
      items: [
        {
          title: "Coursework Form",
          icon: <ListBulletIcon />,
          url: "/phd/drc-convenor/coursework-form",
          requiredPermissions: [permissions["drc-convenor"]],
        },
        {
          title: "Update Qualifying Exam Deadline",
          icon: <CalendarClockIcon />,
          url: "/phd/drc-convenor/update-qualifying-exam-deadline",
          requiredPermissions: [permissions["drc-convenor"]],
        },
      ],
    },
    {
      title: "PhD Student",
      items: [
        {
          title: "Exam Form Deadline",
          icon: <PersonIcon />,
          url: "/phd/phd-student/form-deadline",
          requiredPermissions: [permissions["phd-student"]],
        },
      ],
    },
  ];

  return (
    <>
      <AppSidebar items={items} />
      <Outlet />
    </>
  );
};

export default NotionalSupervisorLayout;
