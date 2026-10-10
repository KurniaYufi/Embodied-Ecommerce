import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/ProfileForm";
import DeleteAccountForm from "@/components/DeleteAccountForm";

export default async function ProfileSettingsPage() {
  const session = await auth();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: Number(session!.user.id) } });

  return (
    <div>
      <h2 className="display text-3xl">Profile</h2>
      <p className="mt-1 text-sm text-muted">Update your name and email address.</p>
      <div className="mt-8">
        <ProfileForm initialName={user.name} initialEmail={user.email} />
      </div>
      <DeleteAccountForm />
    </div>
  );
}
