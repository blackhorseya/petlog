import HealthLogForm from '@/components/health-logs/health-log-form';

export default function NewHealthLogPage() {
  return (
    <main className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">新增健康日誌</h1>
      <HealthLogForm />
    </main>
  );
} 