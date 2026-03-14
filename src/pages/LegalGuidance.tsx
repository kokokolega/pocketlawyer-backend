import React, { useState } from "react";
import { motion } from "motion/react";
import { Gavel, HelpCircle, ArrowRight, Loader2, Shield } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import { aiService } from "../services/aiService";

export const LegalGuidance = () => {
  const { t } = useTranslation();

  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [guidance, setGuidance] = useState<string | null>(null);

  const issueTypes = [
    { id: "cyber", name: t("complaint.categories.cyber"), icon: Shield },
    { id: "fraud", name: t("complaint.categories.fraud"), icon: Gavel },
    { id: "domestic", name: t("complaint.categories.domestic"), icon: HelpCircle },
    { id: "property", name: t("complaint.categories.property"), icon: ArrowRight },
    { id: "harassment", name: t("complaint.categories.harassment"), icon: HelpCircle }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!issueType || !description) {
      alert("Please select issue type and describe your problem.");
      return;
    }

    setLoading(true);
    setGuidance(null);

    try {
      const response = await aiService.getLegalGuidance({
        issueType,
        description
      });

      if (response?.content) {
        setGuidance(response.content);
      } else {
        throw new Error("Invalid AI response");
      }

    } catch (error) {
      console.error("AI Guidance Error:", error);
      alert("Failed to get legal guidance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-navy mb-4">
          {t("guidance.title")}
        </h1>

        <p className="text-gray-600 max-w-2xl mx-auto">
          {t("guidance.subtitle")}
        </p>
      </div>

      <div className="max-w-4xl mx-auto">

        {/* Form */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Issue Type */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-4">
                {t("guidance.form.issueType")}
              </label>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

                {issueTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setIssueType(type.name)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                      issueType === type.name
                        ? "border-saffron bg-saffron/5 text-saffron"
                        : "border-gray-100 hover:border-gray-200 text-gray-500"
                    }`}
                  >
                    <type.icon className="h-6 w-6 mb-2" />

                    <span className="text-xs font-bold text-center">
                      {type.name}
                    </span>

                  </button>
                ))}

              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                {t("guidance.form.description")}
              </label>

              <textarea
                required
                rows={4}
                placeholder={t("guidance.form.descriptionPlaceholder")}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none transition-all resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !issueType}
              className="w-full bg-saffron text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-saffron/20 flex items-center justify-center disabled:opacity-70"
            >

              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  {t("guidance.form.getting")}
                </>
              ) : (
                <>
                  {t("guidance.form.submit")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}

            </button>

          </form>

        </div>

        {/* AI Result */}
        {guidance && (

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-india/5 border border-green-india/10 p-8 rounded-3xl"
          >

            <div className="flex items-center mb-6">

              <div className="bg-green-india p-2 rounded-lg mr-4">
                <Gavel className="h-6 w-6 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-navy">
                {t("guidance.result.title")}
              </h3>

            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 markdown-body">
              <ReactMarkdown>{guidance}</ReactMarkdown>
            </div>

            <div className="mt-8 p-4 bg-saffron/10 rounded-xl flex items-start space-x-3">
              <HelpCircle className="h-5 w-5 text-saffron mt-0.5" />

              <p className="text-sm text-navy/80">
                <strong>Note:</strong> This guidance is AI generated. For serious legal matters, consult a qualified advocate.
              </p>
            </div>

          </motion.div>

        )}

      </div>

    </div>
  );
};