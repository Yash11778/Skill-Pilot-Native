import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: any) => state.auth);

  useEffect(() => {
    const route = async () => {
      if (!isAuthenticated) {
        router.replace('/(auth)/login');
        return;
      }
      // Check if onboarding was already completed (covers login users & app restart)
      const onboardingDone = await AsyncStorage.getItem('onboardingComplete');
      if (user?.profileCompleted || onboardingDone === 'true') {
        router.replace('/(dashboard)');
      } else {
        router.replace('/setup');
      }
    };
    setTimeout(route, 1000);
  }, [isAuthenticated, user]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );
}
