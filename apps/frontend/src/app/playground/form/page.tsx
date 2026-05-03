'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            aria-invalid={Boolean(form.formState.errors.name)}
            {...form.register('name')}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            aria-invalid={Boolean(form.formState.errors.message)}
            rows={4}
            {...form.register('message')}
          />
          {form.formState.errors.message && (
            <p className="text-sm text-destructive">
              {form.formState.errors.message.message}
            </p>
          )}
        </div>
        <Button type="submit">Submit</Button>
      </form>
      {submitted && (
        <pre className="rounded-lg border border-border bg-muted/50 p-3 text-sm">
          {JSON.stringify(submitted, null, 2)}
        </pre>
      )}
    </div>
  );
}
