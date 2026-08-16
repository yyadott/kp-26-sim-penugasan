interface SectionPageProps {
  title: string;
  description: string;
  badge?: string;
}

export const SectionPage = ({ title, description, badge }: SectionPageProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        {badge ? (
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            {badge}
          </span>
        ) : null}
        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
      </div>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
};
