import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, GraduationCap, User, LogOut } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/Auth";
import ProjectCard from "./ProjectCard";
import PatentCard from "./PatentCard";
import CourseCard from "./CourseCard";

const socialProfileSchema = z.object({
  linkedin: z.string().url("Please enter a valid LinkedIn URL").optional().or(z.literal("")),
  orchidID: z.string().optional(),
  scopusID: z.string().optional(),
  googleScholar: z.string().url("Please enter a valid Google Scholar URL").optional().or(z.literal("")),
});

type SocialProfileFormData = z.infer<typeof socialProfileSchema>;

const SocialAcademicProfile = () => {
  const queryClient = useQueryClient();
  const { logOut } = useAuth();
  const [activeTab, setActiveTab] = useState("projects");

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await api.get("/profile");
      return response.data;
    },
  });

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ["user-projects"],
    queryFn: async () => {
      const response = await api.get("/project/list");
      return response.data;
    },
  });

  const { data: patentsData, isLoading: patentsLoading } = useQuery({
    queryKey: ["user-patents"],
    queryFn: async () => {
      const response = await api.get("/patent/list");
      return response.data;
    },
  });

  const form = useForm<SocialProfileFormData>({
    resolver: zodResolver(socialProfileSchema),
    defaultValues: {
      linkedin: profileData?.linkedin || "",
      orchidID: profileData?.orchidID || "",
      scopusID: profileData?.scopusID || "",
      googleScholar: profileData?.googleScholar || "",
    },
  });

  useEffect(() => {
    if (profileData) {
      form.reset({
        linkedin: profileData.linkedin || "",
        orchidID: profileData.orchidID || "",
        scopusID: profileData.scopusID || "",
        googleScholar: profileData.googleScholar || "",
      });
    }
  }, [profileData, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: SocialProfileFormData) => {
      return api.put("/profile/edit", data);
    },
    onSuccess: () => {
      toast.success("Social/academic profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: () => {
      toast.error("Failed to update profile. Please try again.");
    },
  });

  const onSubmit = (data: SocialProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleLogout = () => {
    logOut();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">EEE ERP</h1>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              LOGOUT
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Professor Profile Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
              <User className="h-12 w-12 text-gray-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {profileData?.name || "Professor Name"}
              </h2>
              <p className="text-lg text-gray-600 mb-2">
                {profileData?.designation || "Associate Professor"}
              </p>
              <p className="text-gray-600 mb-4">
                {profileData?.description || "Other Description"}
              </p>
              <div className="flex gap-3">
                {profileData?.linkedin && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer">
                      Link 1
                    </a>
                  </Button>
                )}
                {profileData?.googleScholar && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={profileData.googleScholar} target="_blank" rel="noopener noreferrer">
                      Link 2
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="patents">Patents</TabsTrigger>
            <TabsTrigger value="research">Research Interests</TabsTrigger>
            <TabsTrigger value="courses">Courses Taken</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-32"></div>
                  </div>
                ))
              ) : projectsData?.length > 0 ? (
                projectsData.map((project: any) => (
                  <ProjectCard
                    key={project.id}
                    title={project.title}
                    description={project.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No projects found.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="patents" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {patentsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-32"></div>
                  </div>
                ))
              ) : patentsData?.length > 0 ? (
                patentsData.map((patent: any) => (
                  <PatentCard
                    key={patent.id}
                    title={patent.title}
                    description={patent.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No patents found.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="research" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profileData?.researchInterests?.length > 0 ? (
                profileData.researchInterests.map((interest: string, index: number) => (
                  <Card key={index} className="p-4">
                    <CardContent className="p-0">
                      <h3 className="font-semibold text-lg mb-2">{interest}</h3>
                      <p className="text-sm text-gray-600">
                        Research interest in {interest.toLowerCase()}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No research interests specified.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profileData?.courses?.length > 0 ? (
                profileData.courses.map((course: string, index: number) => (
                  <CourseCard
                    key={index}
                    title={course}
                    description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No courses found.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Social & Academic Profiles Form */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              <GraduationCap className="h-5 w-5" />
              Social & Academic Profiles
            </CardTitle>
            <p className="text-sm text-gray-600">
              Connect your professional and academic profiles
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn Profile</FormLabel>
                      <FormControl>
                        <Input placeholder="https://linkedin.com/in/yourusername" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orchidID"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ORCID ID</FormLabel>
                      <FormControl>
                        <Input placeholder="0000-0000-0000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scopusID"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scopus ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Scopus ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="googleScholar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Scholar Profile</FormLabel>
                      <FormControl>
                        <Input placeholder="https://scholar.google.com/citations?user=..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? "Updating..." : "Save Changes"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SocialAcademicProfile;
