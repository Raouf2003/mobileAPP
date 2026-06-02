import Constants from 'expo-constants';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  'https://YOUR-BACKEND-URL/api/auth';

export const TOKEN_KEY = 'auth_token';
export const USER_KEY = 'auth_user';
