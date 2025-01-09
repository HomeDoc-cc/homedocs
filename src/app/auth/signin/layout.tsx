import { cloneElement } from 'react';

export default function SignInLayout({ children }: { children: React.ReactElement }) {
  const googleEnabled = process.env.GOOGLE_ENABLED === 'true';
  const oidcEnabled = process.env.OIDC_ENABLED === 'true';

  return cloneElement(children, { googleEnabled, oidcEnabled });
}
