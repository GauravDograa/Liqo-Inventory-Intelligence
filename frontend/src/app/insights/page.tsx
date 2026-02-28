import InsightsKPIs from "./components/InsightsKPIs";

export default function InsightsPage() {
  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-3xl p-8 text-white shadow-md">
        <h1 className="text-2xl font-semibold">
          Executive Insights Dashboard
        </h1>
        <p className="text-orange-100 mt-2">
          Consolidated business performance intelligence
        </p>
      </div>

      <InsightsKPIs />

    </div>
  );
}