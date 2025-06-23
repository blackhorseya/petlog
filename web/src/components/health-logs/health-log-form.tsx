"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createHealthLog } from '@/lib/api/health-log';

export default function HealthLogForm() {
  const [date, setDate] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      await createHealthLog({ date, type, description });
      router.push('/health');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="date">日期</Label>
        <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="type">類型</Label>
        <Input id="type" value={type} onChange={e => setType(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="description">描述</Label>
        <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} required />
      </div>
      <Button type="submit" disabled={loading}>{loading ? '送出中...' : '送出'}</Button>
    </form>
  );
} 