'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function SubscribeForm({ source, tone = 'light' }: { source: string; tone?: 'light' | 'navy' }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState('');
  const id = `email-${source}`;
  const errorId = `${id}-error`;

  useEffect(() => {
    setStartedAt(String(Date.now()));
    if (formRef.current) formRef.current.noValidate = true;
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const input = event.currentTarget.elements.namedItem('email');
    if (!(input instanceof HTMLInputElement)) return;
    const value = input.value.trim();
    input.value = value;
    let message: string | null = null;
    if (!value) message = 'Enter your email address.';
    else if (value.length > 254 || !EMAIL.test(value)) {
      message = 'That email address looks incomplete. Check it and try again.';
    }
    if (message) {
      event.preventDefault();
      setError(message);
      input.focus();
    }
  }

  const navy = tone === 'navy';

  return (
    <form ref={formRef} action="/api/subscribe/" method="post" onSubmit={onSubmit} className="relative">
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="t" value={startedAt} />
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>Leave this field empty</label>
        <input id={`${id}-website`} type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label htmlFor={id} className={`block text-[14px] font-semibold ${navy ? 'text-[var(--color-white)]' : ''}`}>
        Email address
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input
          id={id}
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onInput={() => {
            if (error) setError(null);
          }}
          className="field sm:flex-1"
        />
        <button type="submit" className={`btn ${navy ? 'btn-inverse' : 'btn-primary'} min-h-12`}>
          Subscribe
        </button>
      </div>
      {error ? (
        <p
          id={errorId}
          role="alert"
          className={`mt-2 text-[14px] font-semibold ${navy ? 'text-[var(--color-white)]' : 'text-[var(--color-bad)]'}`}
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}
