import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, GraduationCap } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { useEffect } from "react";

const socialProfileSchema = z.object({
  linkedin: z.string().url("Please enter a valid LinkedIn URL").optional().or(z.literal("")),
  orchidID: z.string().optional(),
  scopusID: z.string().optional(),
  googleScholar: z.string().url("Please enter a valid Google Scholar URL").optional().or(z.literal("")),
});

type SocialProfileFormData = z.infer<typeof socialProfileSchema>;

const SocialAcademicProfile = () => {
  const queryClient = useQueryClient();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await api.get("/profile");
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
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
  );
};

export default SocialAcademicProfile;
