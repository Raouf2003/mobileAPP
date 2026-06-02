import { Redirect, router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getErrorMessage, useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const { user, isAuthenticated, isLoading, logout, refreshProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      await refreshProfile();
    } catch (error) {
      Alert.alert('Session Error', getErrorMessage(error));
      await logout();
      router.replace('/login');
    } finally {
      setProfileLoading(false);
    }
  }, [refreshProfile, logout]);

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated, loadProfile]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello 👋</Text>
        <Text style={styles.username}>{user?.username}</Text>
        <Text style={styles.badge}>Protected Home</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Profile (from API)</Text>
        {profileLoading ? (
          <ActivityIndicator color="#6366f1" style={{ marginTop: 12 }} />
        ) : (
          <>
            <Text style={styles.row}>
              <Text style={styles.label}>User ID: </Text>
              {user?.id}
            </Text>
            <Text style={styles.row}>
              <Text style={styles.label}>Username: </Text>
              {user?.username}
            </Text>
          </>
        )}
        <Text style={styles.hint}>
          This screen calls GET /api/auth/profile with your JWT token.
        </Text>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 64,
    backgroundColor: '#0f172a',
  },
  header: {
    marginBottom: 32,
  },
  greeting: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 4,
  },
  username: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#312e81',
    color: '#a5b4fc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 16,
  },
  row: {
    fontSize: 15,
    color: '#cbd5e1',
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
    color: '#94a3b8',
  },
  hint: {
    marginTop: 16,
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
