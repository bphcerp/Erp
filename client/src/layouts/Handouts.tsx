import { AppSidebar } from "@/components/AppSidebar";
import { ReaderIcon } from "@radix-ui/react-icons";
import { permissions } from "lib";
import { Newspaper, Upload } from "lucide-react";
import { Outlet } from "react-router-dom";

const HandoutLayout = () => {
  return (
    <>
      <AppSidebar
        items={[
          {
            title: "Faculty",
            items: [
              {
                title: "Handouts",
                icon: <ReaderIcon />,
                url: "/handout/faculty",
                requiredPermissions: [permissions["/handout/faculty/get"]],
              },
              {
                title: "Upload Handout",
                icon: <Upload />,
                url: "/handout/submit/:id",
              },
            ],
          },
          {
            title: "DCAMember",
            items: [
              {
                title: "Handouts",
                icon: <ReaderIcon />,
                url: "/handout/dca",
                requiredPermissions: [permissions["/handout/dca/get"]],
              },
              {
                title: "Review Handouts",
                icon: <Newspaper />,
                url: "/handout/dca/review/:id",
              },
            ],
          },
          {
            title: "DCA Convenor",
            items: [
              {
                title: "Handouts",
                icon: <ReaderIcon />,
                url: "/handout/dcaconvenor",
                requiredPermissions: [
                  permissions["/handout/dca/get"],
                  permissions["/handout/dca/assignReviewer"],
                ],
              },
            ],
          },
        ]}
      />
      <Outlet />
    </>
  );
};

export default HandoutLayout;
