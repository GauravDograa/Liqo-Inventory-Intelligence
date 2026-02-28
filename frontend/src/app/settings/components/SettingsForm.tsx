"use client";

import { useState } from "react";

export default function SettingsForm() {
  const [form, setForm] = useState({
    companyName: "Liqo Inventory Intelligence",
    currency: "INR",
    lowStockThreshold: 20,
    agingAlertDays: 90,
    emailNotifications: true,
    autoRecommendations: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleSave = () => {
    console.log("Saved settings:", form);
    alert("Settings saved successfully 🚀");
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-10">

      {/* Company Info */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Company Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-600">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              className="w-full mt-2 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Currency</label>
            <select
              name="currency"
              value={form.currency}
              onChange={handleChange}
              className="w-full mt-2 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 outline-none"
            >
              <option value="INR">₹ Indian Rupee</option>
              <option value="USD">$ US Dollar</option>
              <option value="EUR">€ Euro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Rules */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Inventory Rules</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-600">
              Low Stock Threshold
            </label>
            <input
              type="number"
              name="lowStockThreshold"
              value={form.lowStockThreshold}
              onChange={handleChange}
              className="w-full mt-2 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">
              Aging Alert (Days)
            </label>
            <input
              type="number"
              name="agingAlertDays"
              value={form.agingAlertDays}
              onChange={handleChange}
              className="w-full mt-2 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Automation & Notifications */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Automation & Notifications
        </h2>

        <div className="space-y-4">
          <label className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl">
            <span>Email Notifications</span>
            <input
              type="checkbox"
              name="emailNotifications"
              checked={form.emailNotifications}
              onChange={handleChange}
              className="accent-orange-500 w-5 h-5"
            />
          </label>

          <label className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl">
            <span>Auto-generate Recommendations</span>
            <input
              type="checkbox"
              name="autoRecommendations"
              checked={form.autoRecommendations}
              onChange={handleChange}
              className="accent-orange-500 w-5 h-5"
            />
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t">
        <button
          onClick={handleSave}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition"
        >
          Save Settings
        </button>
      </div>

    </div>
  );
}