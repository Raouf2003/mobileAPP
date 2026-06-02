import { Link, Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';
import { AuthForm } from '../components/AuthForm';
import { getErrorMessage, useAuth } from '../context/AuthContext';

export default function RegisterScreen() {
  const { register, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Redirect href="/home" />;
  }

  const handleRegister = async () => {
    if (!username.trim() || !password) {
      Alert.alert('Validation', 'Please enter username and password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Validation', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(username.trim(), password);
      router.replace('/home');
    } catch (error) {
      Alert.alert('Registration Failed', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Create account"
      subtitle="Register to get started"
      username={username}
      password={password}
      onUsernameChange={setUsername}
      onPasswordChange={setPassword}
      onSubmit={handleRegister}
      submitLabel="Create Account"
      loading={loading}
      footer={
        <Pressable style={styles.linkWrap}>
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Link href="/login" style={styles.link}>
              Sign In
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
