'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  type PlaygroundFormInput,
  playgroundFormSchema,
} from '@/lib/validation/playground.schema';

export default function PlaygroundFormPage() {
  const [submitted, setSubmitted] = useState<PlaygroundFormInput | null>(null);
  const form = useForm<PlaygroundFormInput>({
    resolver: zodResolver(playgroundFormSchema),
    defaultValues: { name: '', message: '' },
    mode: 'onTouched',
  });

  const onSubmit = (values: PlaygroundFormInput) => setSubmitted(values);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Form Demo</h2>
      <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
        <label className="block">
          Name
          <input
            className="mt-1 block w-full rounded border p-2"
            {...form.register('name')}
          />
          {form.formState.errors.name && (
            <span className="text-sm text-red-600">
              {form.formState.errors.name.message}
            </span>
          )}
        </label>
        <label className="block">
          Message
          <textarea
            className="mt-1 block w-full rounded border p-2"
            rows={4}
            {...form.register('message')}
          />
          {form.formState.errors.message && (
            <span className="text-sm text-red-600">
              {form.formState.errors.message.message}
            </span>
          )}
        </label>
        <button className="rounded border px-3 py-1" type="submit">
          Submit
        </button>
      </form>
      {submitted && (
        <pre className="rounded border p-3 text-sm">
          {JSON.stringify(submitted, null, 2)}
        </pre>
      )}
    </div>
  );
}
