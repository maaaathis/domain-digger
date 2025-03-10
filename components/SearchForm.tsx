'use client';

import { Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { toASCII } from 'punycode';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { cn } from '@/lib/utils';
import isValidDomain from '@/utils/isValidDomain';

enum FormStates {
  Initial,
  Submitting,
  Success,
}

type SearchFormProps = {
  textAlignment: 'left' | 'center';
  initialValue?: string;
  autofocus?: boolean;
};

const SearchForm = (props: SearchFormProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const [domain, setDomain] = useState('');
  const [state, setState] = useState<FormStates>(FormStates.Initial);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (props.initialValue) {
      setDomain(props.initialValue);
    }
  }, [props.initialValue]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(false);
    setState(FormStates.Submitting);

    let tDomain;
    try {
      tDomain = new URL(domain.trim().toLowerCase()).hostname;
    } catch (err) {
      tDomain = domain.trim().toLowerCase();
    }

    const normalizedDomain = toASCII(tDomain);

    if (!isValidDomain(normalizedDomain)) {
      setError(true);
      setState(FormStates.Initial);
      return;
    }

    const target = `/lookup/${normalizedDomain}`;

    if (pathname === target) {
      router.refresh();
      setTimeout(() => {
        setState(FormStates.Initial);
      }, 150);
      return;
    }

    router.push(target);
  };

  return (
    <>
      <form className="flex gap-3" onSubmit={handleSubmit}>
        <Input
          className="flex-[3]"
          type="text"
          required
          placeholder="example.com"
          aria-label="Domain"
          value={domain}
          onInput={(event: ChangeEvent<HTMLInputElement>) =>
            setDomain(event.target.value)
          }
          disabled={state !== FormStates.Initial}
          autoFocus={props.autofocus}
        />
        <Button
          className="flex-[1]"
          type="submit"
          disabled={state !== FormStates.Initial}
        >
          {state === FormStates.Submitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Lookup
        </Button>
      </form>

      {error ? (
        <p
          className={cn('mt-2 text-sm text-red-600', {
            'text-center': props.textAlignment === 'center',
          })}
        >
          An error occurred! Please check your input or try again later.
        </p>
      ) : (
        <p
          className={cn('mt-2 text-sm text-muted-foreground', {
            'text-center': props.textAlignment === 'center',
          })}
        >
          It can be anything! An apex, subdomain, or even a URL.
        </p>
      )}
    </>
  );
};

export default SearchForm;
