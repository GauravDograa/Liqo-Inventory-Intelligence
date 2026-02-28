import SettingsForm from "./components/SettingsForm";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-3xl p-8 text-white shadow-md">
        <h1 className="text-2xl font-semibold">
          Platform Settings
        </h1>
        <p className="text-orange-100 mt-2">
          Configure system preferences and business rules
        </p>
      </div>

      <SettingsForm />
    </div>
  );
}