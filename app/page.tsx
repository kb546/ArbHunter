import LandingPage from '@/components/landing/LandingPage';
import { ForceDark } from '@/components/ForceDark';
import { AuthHashHandler } from '@/components/auth/AuthHashHandler';

export default function Home() {
  return (
    <>
      <ForceDark />
      <AuthHashHandler />
      <LandingPage />
    </>
  );
}
