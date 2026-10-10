import SecurityForm from "@/components/SecurityForm";

export default function SecuritySettingsPage() {
  return (
    <div>
      <h2 className="display text-3xl">Security</h2>
      <p className="mt-1 text-sm text-muted">Use a long, unique password to keep your account safe.</p>
      <div className="mt-8">
        <SecurityForm />
      </div>
    </div>
  );
}
