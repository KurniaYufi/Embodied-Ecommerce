import AppearanceSwitcher from "@/components/AppearanceSwitcher";

export default function AppearanceSettingsPage() {
  return (
    <div>
      <h2 className="display text-3xl">Appearance</h2>
      <p className="mt-1 text-sm text-muted">Choose how Embodied looks on this device.</p>
      <div className="mt-8">
        <AppearanceSwitcher />
      </div>
    </div>
  );
}
