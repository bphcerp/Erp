import { AppSidebar, type SidebarMenuGroup } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/Auth";
import api from "@/lib/axios-instance";
import { LOGIN_ENDPOINT } from "@/lib/constants";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";

function Home({ sidebarItems }: { sidebarItems?: SidebarMenuGroup[] }) {
  const { authState, setNewAuthToken, logOut } = useAuth();

  const onSuccess = (credentialResponse: CredentialResponse) => {
    api
      .post<{ token: string }>(LOGIN_ENDPOINT, {
        token: credentialResponse.credential,
      })
      .then((response) => {
        console.log(response.data.token);
        setNewAuthToken(response.data.token);
      })
      .catch(() => {
        // notify login failed
      });
  };

  return (
    <>
      <AppSidebar items={sidebarItems ?? []} />
      <div className="mx-auto flex max-w-5xl flex-1 flex-col items-center justify-center gap-8 p-8 text-center">
        {!authState ? (
          <GoogleLogin onSuccess={onSuccess} />
        ) : (
          <div className="flex flex-col gap-4">
            <p className="whitespace-pre text-left font-mono">
              {JSON.stringify(authState, null, 4)}
            </p>
            <Button className="self-center" onClick={() => logOut()}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

export default Home;
