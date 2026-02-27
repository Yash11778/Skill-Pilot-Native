import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const features = [
  { icon: 'trophy', color: '#6366f1', title: 'Skill Assessment', desc: 'Evaluate your technical and problem-solving abilities' },
  { icon: 'bulb', color: '#f59e0b', title: 'Aptitude Test', desc: 'Measure your logical reasoning and analytical thinking' },
  { icon: 'heart', color: '#ef4444', title: 'Interest Analysis', desc: 'Identify your preferences and passion areas' },
  { icon: 'people', color: '#10b981', title: 'Personality Insights', desc: 'Understand your work style and team dynamics' },
];

const benefits = [
  'Get personalized career roadmap based on your profile',
  'Receive targeted course recommendations from top platforms',
  'Discover skills you need to develop for your dream career',
  'Access relevant learning resources and pathways',
  'Connect with mentors in your field of interest',
  'Track your progress and achievements',
];

const tips = [
  'Answer honestly - there are no right or wrong answers',
  'Take your time but trust your first instinct',
  'Ensure you\'re in a quiet environment',
  'Complete in one sitting for accurate results',
];

export default function AssessmentIntroScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.headerCircle}>
          <Ionicons name="checkmark-circle" size={48} color="#fff" />
        </View>
        <Text style={styles.title}>Ready for Your Career Assessment?</Text>
        <Text style={styles.subtitle}>
          Our comprehensive assessment will help us understand your strengths, interests, and goals to create the perfect career roadmap for you.
        </Text>

        {/* Features */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What You'll Experience</Text>
          {features.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: f.color + '20' }]}>
                <Ionicons name={f.icon as any} size={22} color={f.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Benefits */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What You'll Get</Text>
          {benefits.map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark" size={14} color="#10b981" />
              </View>
              <Text style={styles.benefitText}>{b}</Text>
            </View>
          ))}
        </View>

        {/* Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assessment Details</Text>
          <View style={styles.detailsRow}>
            <View style={styles.detailBox}>
              <Text style={styles.detailEmoji}>⏱️</Text>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>15-20 min</Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailEmoji}>📝</Text>
              <Text style={styles.detailLabel}>Questions</Text>
              <Text style={styles.detailValue}>12 questions</Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailEmoji}>🎯</Text>
              <Text style={styles.detailLabel}>Focus</Text>
              <Text style={styles.detailValue}>Skills & Aptitude</Text>
            </View>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb" size={20} color="#1d4ed8" />
            <Text style={styles.tipTitle}>Tips for Best Results</Text>
          </View>
          {tips.map((t, i) => (
            <Text key={i} style={styles.tipText}>• {t}</Text>
          ))}
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.startBtn} onPress={() => router.push('/setup/skill-assessment')}>
          <Text style={styles.startBtnText}>🚀 Start Assessment</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.skipBtn} onPress={() => router.push('/setup/career-roadmap')}>
          <Text style={styles.skipBtnText}>Skip for now and continue</Text>
        </TouchableOpacity>

        <Text style={styles.skipNote}>
          You can always take the assessment later, but we highly recommend completing it for accurate recommendations.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef2ff' },
  scroll: { padding: 20, paddingTop: 50, paddingBottom: 40, alignItems: 'center' },
  headerCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#6b7280', textAlign: 'center', lineHeight: 22, marginBottom: 24, paddingHorizontal: 10 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16, textAlign: 'center' },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 12 },
  featureIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  featureTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  featureDesc: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  checkCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#d1fae5', justifyContent: 'center', alignItems: 'center' },
  benefitText: { fontSize: 14, color: '#374151', flex: 1 },
  detailsRow: { flexDirection: 'row', gap: 10 },
  detailBox: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 12, padding: 14, alignItems: 'center' },
  detailEmoji: { fontSize: 24, marginBottom: 6 },
  detailLabel: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#111827', textAlign: 'center' },
  tipCard: { backgroundColor: '#eff6ff', borderRadius: 12, padding: 16, marginBottom: 24, width: '100%', borderWidth: 1, borderColor: '#bfdbfe' },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  tipTitle: { fontSize: 16, fontWeight: '600', color: '#1e3a8a' },
  tipText: { fontSize: 13, color: '#1e40af', marginBottom: 4, lineHeight: 20 },
  startBtn: { backgroundColor: '#6366f1', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 14, width: '100%', alignItems: 'center', shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  startBtnText: { fontSize: 18, fontWeight: '600', color: '#fff' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, width: '100%' },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#d1d5db' },
  dividerText: { marginHorizontal: 12, fontSize: 13, color: '#9ca3af' },
  skipBtn: { backgroundColor: '#f3f4f6', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14, width: '100%', alignItems: 'center' },
  skipBtnText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  skipNote: { fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 12, paddingHorizontal: 20 },
});
