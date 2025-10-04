import { Metadata } from 'next';
import ProfileForm from './profile-form';

export const metadata: Metadata = {
  title: 'User Profile - Your App Name',
  description: 'Manage your profile, orders, and settings.',
};

export default function ProfilePage() {
  return <ProfileForm />;
}
