import { AppSidebar } from "@/components/AppSidebar";
import {
  CalendarClockIcon,
  List,
  Users,
  CaseUpper,
  NotepadText,
  CalendarX2,
  UserRoundPlus,
} from "lucide-react";
import { Outlet } from "react-router-dom";
import { permissions } from "lib";

const NotionalSupervisorLayout = () => {
  const items = [
    {
      title: "Notional Supervisor",
      items: [
        {
          title: "Update Grade",
          icon: <CaseUpper />,
          url: "/phd/notional-supervisor/update-grade",
          requiredPermissions: [permissions["/phd/supervisor/updateSuggestedExaminer"]],
        },
        {
          title: "Suggest Examiner",
          icon: <UserRoundPlus />,
          url: "/phd/notional-supervisor/suggest-examiner",
          requiredPermissions: [permissions["/phd/notionalSupervisor/updateCourseGrade"]],
        },
      ],
    },
    {
      title: "DRC Convenor",
      items: [
        {
          title: "Coursework Form",
          icon: <List />,
          url: "/phd/drc-convenor/coursework-form",
          requiredPermissions: [
            permissions["/phd/drcMember/generateCourseworkForm"],
          ],
        },
        {
          title: "Generate QE Application List",
          icon: <Users />,
          url: "/phd/drc-convenor/generate-qualifying-exam-form",
          requiredPermissions: [
            permissions["/phd/drcMember/getPhdToGenerateQualifyingExamForm"],
          ],
        },
        {
          title: "QE Application details",
          icon: <NotepadText />,
          url: "/phd/drc-convenor/phd-that-applied-for-qualifying-exam",
          requiredPermissions: [permissions["/phd/drcMember/getPhdDataOfWhoFilledApplicationForm"]],
        },
        {
          title: "Assign Examiner",
          icon: <NotepadText />,
          url: "/phd/drc-convenor/assign-examiner",
          requiredPermissions: [permissions["/phd/drcMember/updateExaminer"]],
        },
        {
          title: "Assign DAC Members",
          icon: <UserRoundPlus />,
          url: "/phd/drc-convenor/assign-dac-members",
          requiredPermissions: [permissions["/phd/drcMember/updateFinalDac"]],
        },
      ],
    },
    {
      title: "PhD Student",
      items: [
        {
          title: "QE Form Deadline",
          icon: <CalendarClockIcon />,
          url: "/phd/phd-student/form-deadline",
          requiredPermissions: [permissions["/phd/student/checkExamStatus"]],
        },
        
        {
          title: "Proposal Submission",
          icon: <NotepadText />,
          url: "/phd/phd-student/proposal-submission",
          requiredPermissions: [permissions["/phd/student/checkExamStatus"]],
        },
      ],
    },
    {
      title: "Staff",
      items: [
        {
          title: "Update sem dates",
          icon: <CalendarX2 />,
          url: "/phd/staff/update-semester-dates",
          requiredPermissions: [
            permissions["/phd/staff/getAllSem"],
          ],
        },
        {
          title: "Update Deadlines",
          icon: <CalendarClockIcon />,
          url: "/phd/staff/update-deadlines",
          requiredPermissions: [permissions["/phd/staff/updateQualifyingExamDeadline"], permissions["/phd/staff/updateProposalDeadline"]],
        },
        {
          title: "Update Sub Areas",
          icon: <CalendarClockIcon />,
          url: "/phd/staff/update-subareas",
          requiredPermissions: [permissions["/phd/staff/updateSubAreas"], permissions["/phd/staff/getSubAreas"], permissions["/phd/staff/deleteSubArea"]],
        },
      ],
    },
    {
      title: "PhD Supervisor",
      items: [
        {
          title: "Supervised Students",
          icon: <Users />,
          url: "/phd/phd-supervisor/supervised-students",
          requiredPermissions: [permissions["/phd/supervisor/getSupervisedStudents"]],
        },
      ],
    },
    {
      title: "PhD Co-Supervisor",
      items: [
        {
          title: "Co-Supervised Students",
          icon: <Users />,
          url: "/phd/phd-co-supervisor/co-supervised-students",
          requiredPermissions: [permissions["/phd/coSupervisor/getCoSupervisedStudents"]],
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
