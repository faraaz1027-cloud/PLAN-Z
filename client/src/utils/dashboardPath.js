export const getDashboardPath = (role) => {
  switch (role) {
    case 'attendee':
      return '/dashboard';
    case 'organizer':
      return '/organizer';
    case 'admin':
      return '/admin';
    default:
      return '/events';
  }
};
