export interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  icon: string[];
  enabled: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    id: 'email',
    label: 'Email Notifications',
    description: 'Receive alerts and updates in your email',
    icon: ['fas', 'envelope'],
    enabled: true,
  },
  {
    id: 'push',
    label: 'Push Notifications',
    description: 'Receive notifications in your browser',
    icon: ['fas', 'bell'],
    enabled: true,
  },
  {
    id: 'marketing',
    label: 'Offers and Promotions',
    description: 'Receive information about special offers',
    icon: ['fas', 'bullhorn'],
    enabled: false,
  },
];
