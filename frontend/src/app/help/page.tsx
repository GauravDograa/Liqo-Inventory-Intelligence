import HelpSection from "./components/HelpSection";
import FAQItem from "./components/FAQItem";

export default function HelpPage() {
  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-3xl p-8 text-white shadow-md">
        <h1 className="text-2xl font-semibold">
          Help & Support Center
        </h1>
        <p className="text-orange-100 mt-2">
          Everything you need to use the Liqo Inventory Intelligence Platform
        </p>
      </div>

      {/* Platform Guide */}
      <HelpSection
        title="Dashboard Overview"
        content="The dashboard provides a real-time snapshot of revenue, stock value, margin performance, and deadstock risk across all stores."
      />

      <HelpSection
        title="Inventory Module"
        content="Track stock levels, aging, category distribution, and inventory value. Use this module to monitor slow-moving SKUs and optimize working capital."
      />

      <HelpSection
        title="Recommendations Engine"
        content="AI-driven inter-store redistribution engine. It suggests transfers based on velocity imbalance and demand coverage impact."
      />

      <HelpSection
        title="Insights Module"
        content="Executive-level KPIs including total revenue, gross margin, top-performing store, and deadstock exposure."
      />

      {/* FAQ */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>

        <FAQItem
          question="How are recommendations generated?"
          answer="Recommendations are generated using velocity imbalance logic. High-performing stores receive stock from low-velocity stores to optimize demand coverage."
        />

        <FAQItem
          question="What is Deadstock Risk?"
          answer="Deadstock Risk is calculated based on aging inventory value and sell-through performance across stores."
        />

        <FAQItem
          question="How often is data updated?"
          answer="Data updates in near real-time depending on transaction ingestion frequency."
        />
      </div>

      {/* Contact Support */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Contact Support</h2>
        <p className="text-gray-600 mb-4">
          Need help? Reach out to our support team.
        </p>

        <div className="space-y-2 text-sm">
          <p><strong>Email:</strong> support@liqo.ai</p>
          <p><strong>Phone:</strong> +91 98765 43210</p>
          <p><strong>Support Hours:</strong> Mon–Fri, 9 AM – 6 PM IST</p>
        </div>
      </div>

    </div>
  );
}