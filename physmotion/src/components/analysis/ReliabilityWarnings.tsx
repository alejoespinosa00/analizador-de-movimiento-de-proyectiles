import type { ValidationIssue } from '../../types/analysis';

/** Lista de advertencias sobre qué tan fiables son los resultados (ver assessReliability). */
export default function ReliabilityWarnings({ issues }: { issues: ValidationIssue[] }) {
  if (issues.length === 0) return null;

  return (
    <div
      role="status"
      className="space-y-1.5 rounded-md border border-user/30 bg-user/5 p-3 text-sm"
    >
      <h3 className="font-medium text-user">Ten cuidado con estos resultados</h3>
      <ul className="list-disc space-y-1 pl-5 text-ink/80">
        {issues.map((issue) => (
          <li key={issue.code}>{issue.message}</li>
        ))}
      </ul>
    </div>
  );
}