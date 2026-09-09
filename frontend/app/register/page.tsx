import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register — Create Your LankaCare Account',
  description: 'Create a free LankaCare account to book clinic appointments, track your queue, manage prescriptions, and access your digital health records.',
};

import RegisterPageClient from './RegisterPageClient';

export default function RegisterPage() {
  return <RegisterPageClient />;
}
