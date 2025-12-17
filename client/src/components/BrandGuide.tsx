export default function BrandGuide() {
  return (
    <div className="font-body bg-background dark:bg-background text-brand-text dark:text-foreground min-h-screen p-10 space-y-10 transition-colors duration-300">
      <h1 className="text-5xl font-heading text-brand-primary dark:text-accent lowercase">dwellpath</h1>

      <section className="space-y-6">
        <div className="bg-card dark:bg-card p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-heading mb-2">Reassuring</h2>
          <p>You're in the clear — no tax risk this month.</p>
        </div>
        <div className="bg-card dark:bg-card p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-heading mb-2">Guiding</h2>
          <p>You've crossed 150 days in Florida. Here's what that means.</p>
        </div>
        <div className="bg-card dark:bg-card p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-heading mb-2">Professional</h2>
          <p>Your Domicile Timeline is audit-ready.</p>
        </div>
      </section>

      <button
        onClick={() => document.documentElement.classList.toggle('dark')}
        className="mt-6 px-4 py-2 rounded-lg bg-brand-accent dark:bg-accent text-white"
      >
        Toggle Theme
      </button>
    </div>
  );
}