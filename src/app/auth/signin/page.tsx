import SignInClient from './client';

export default function SignInPage() {
  const googleEnabled = process.env.GOOGLE_ENABLED === 'true';
  const oidcEnabled = process.env.OIDC_ENABLED === 'true';

  return <SignInClient googleEnabled={googleEnabled} oidcEnabled={oidcEnabled} />;
}
