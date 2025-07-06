
import React from "react";
import { useTranslation } from "react-i18next";

export const WelcomeMessage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="py-8 px-4 sm:px-6 text-center">
      <div className="mx-auto h-16 w-16 rounded-full chat-gradient flex items-center justify-center mb-4">
        <span className="text-white font-bold text-xl">A</span>
      </div>
      <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">{t("welcome.title")}</h2>
      <p className="text-gray-600 dark:text-slate-300 max-w-lg mx-auto mb-2">
        {t("welcome.subtitle")}
      </p>
      <p className="text-gray-500 dark:text-slate-400 max-w-lg mx-auto">
        {t("welcome.description")}
      </p>
    </div>
  );
};
