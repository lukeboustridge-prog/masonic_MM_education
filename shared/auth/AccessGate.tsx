import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { validateAccessToken } from './tokenValidator';
import type { UserData, TokenValidationResult } from './types';

const UserContext = createContext<UserData | null>(null);

export function useUser(): UserData {
  const user = useContext(UserContext);
  if (!user) {
    throw new Error('useUser must be used within AccessGate with valid authentication');
  }
  return user;
}

interface AccessGateProps {
  secret: string;
  children: ReactNode;
  mainAppUrl?: string;
}

type GateState =
  | { status: 'loading' }
  | { status: 'authenticated'; user: UserData }
  | { status: 'denied'; error: string };

export function AccessGate({ secret, children, mainAppUrl = '/' }: AccessGateProps) {
  const [state, setState] = useState<GateState>({ status: 'loading' });

  useEffect(() => {
    async function verifyAccess() {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      const result: TokenValidationResult = await validateAccessToken(token, secret);

      if (result.valid && result.user) {
        setState({ status: 'authenticated', user: result.user });
      } else {
        setState({ status: 'denied', error: result.error || 'Access denied' });
      }
    }

    verifyAccess();
  }, [secret]);

  if (state.status === 'loading') {
    return <LoadingScreen />;
  }

  if (state.status === 'denied') {
    return <AccessDeniedScreen error={state.error} mainAppUrl={mainAppUrl} />;
  }

  return (
    <UserContext.Provider value={state.user}>
      {children}
    </UserContext.Provider>
  );
}

function LoadingScreen() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.spinner} />
        <p style={styles.text}>Verifying access...</p>
      </div>
    </div>
  );
}

interface AccessDeniedScreenProps {
  error: string;
  mainAppUrl: string;
}

function AccessDeniedScreen({ error, mainAppUrl }: AccessDeniedScreenProps) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 style={styles.title}>Access Denied</h1>
        <p style={styles.subtitle}>This game must be accessed through My Year in the Chair</p>
        <p style={styles.errorDetail}>{error}</p>
        <a href={mainAppUrl} style={styles.link}>
          Return to My Year in the Chair
        </a>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '48px',
    textAlign: 'center',
    maxWidth: '400px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  iconContainer: {
    marginBottom: '24px',
  },
  title: {
    color: '#f8fafc',
    fontSize: '28px',
    fontWeight: '600',
    margin: '0 0 12px 0',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '16px',
    margin: '0 0 8px 0',
    lineHeight: '1.5',
  },
  errorDetail: {
    color: '#64748b',
    fontSize: '14px',
    margin: '0 0 24px 0',
    fontStyle: 'italic',
  },
  link: {
    display: 'inline-block',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  text: {
    color: '#94a3b8',
    fontSize: '16px',
    margin: '16px 0 0 0',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #334155',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    margin: '0 auto',
    animation: 'spin 1s linear infinite',
  },
};

// Inject keyframes for spinner animation
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}
