import SignUpClient from './client';

export default function SignUpPage() {
  const googleEnabled = process.env.GOOGLE_ENABLED === 'true';
  const oidcEnabled = process.env.OIDC_ENABLED === 'true';

  return <SignUpClient googleEnabled={googleEnabled} oidcEnabled={oidcEnabled} />;
}
