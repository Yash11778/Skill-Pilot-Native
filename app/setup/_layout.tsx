import { Stack } from 'expo-router';

export default function SetupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="assessment-intro" />
      <Stack.Screen name="skill-assessment" />
      <Stack.Screen name="career-roadmap" />
      <Stack.Screen name="course-recommendations" />
      <Stack.Screen name="career-simulation" />
      <Stack.Screen name="community-mentors" />
    </Stack>
  );
}
