import { Link, Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';
import { AuthForm } from '../components/AuthForm';
import { getErrorMessage, useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Redirect href="/home" />;
  }

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      Alert.alert('Validation', 'Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
      router.replace('/home');
    } catch (error) {
      Alert.alert('Login Failed', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Welcome back"
      subtitle="Sign in to continue"
      username={username}
      password={password}
      onUsernameChange={setUsername}
      onPasswordChange={setPassword}
      onSubmit={handleLogin}
      submitLabel="Sign In"
      loading={loading}
      footer={
        <Pressable style={styles.linkWrap}>
          <Text style={styles.footerText}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={styles.link}>
              Register
            </Link>
          </Text>
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  linkWrap: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 15,
  },
  link: {
    color: '#818cf8',
    fontWeight: '700',
  },
});
