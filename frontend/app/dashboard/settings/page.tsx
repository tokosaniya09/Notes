import { Metadata } from "next";
import { FadeIn } from "@/components/motion/fade-in";
import { ProfileForm } from "@/features/user/components/profile-form";
import { PreferencesForm } from "@/features/user/components/preferences-form";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings and preferences.",
};

export default function SettingsPage() {
  return (
    <FadeIn>
      <div className="space-y-6 pb-12">
        <div className="space-y-0.5">
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and set e-mail preferences.
          </p>
        </div>
        
        <div className="border-t pt-6">
          <div className="grid gap-10">
            {/* Profile Section */}
            <section className="grid gap-6">
              <div>
                 <h3 className="text-lg font-medium">Profile</h3>
                 <p className="text-sm text-muted-foreground">
                  Update your personal information.
                </p>
              </div>
              <ProfileForm />
            </section>

            {/* Divider */}
            <div className="border-t" />

            {/* Preferences Section */}
            <section className="grid gap-6">
               <div>
                 <h3 className="text-lg font-medium">Preferences</h3>
                 <p className="text-sm text-muted-foreground">
                  Customize your workspace experience.
                </p>
              </div>
              <PreferencesForm />
            </section>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
