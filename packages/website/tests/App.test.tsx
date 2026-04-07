import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../src/App';

describe('<App />', () => {
  beforeEach(() => {
    // Stub fetch so the document list and chat panel render their empty states.
    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.endsWith('/api/documents')) {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }
      return new Response('not found', { status: 404 });
    }) as unknown as typeof fetch;
  });

  it('renders the header and the empty document list', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /doc-chat/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/no documents yet/i)).toBeInTheDocument();
    });
  });

  it('renders the empty main panel when nothing is selected', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/select or upload a document/i)).toBeInTheDocument();
    });
  });
});
