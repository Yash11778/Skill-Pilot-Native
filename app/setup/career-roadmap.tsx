import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const careerPaths: Record<string, any> = {
  'ai-ml': {
    id: 'ai-ml', title: 'AI/Machine Learning Specialist', icon: '🤖',
    description: 'Become an expert in artificial intelligence and machine learning technologies',
    color: '#7c3aed', duration: '12-18 months', salary: '₹8-25 LPA', growth: '+35%', difficulty: 'Advanced',
  },
  'data-science': {
    id: 'data-science', title: 'Data Scientist', icon: '📊',
    description: 'Extract insights from data to drive business decisions and solve complex problems',
    color: '#0284c7', duration: '8-12 months', salary: '₹6-20 LPA', growth: '+31%', difficulty: 'Intermediate',
  },
  'fullstack': {
    id: 'fullstack', title: 'Full Stack Developer', icon: '💻',
    description: 'Build complete web applications from frontend to backend',
    color: '#059669', duration: '6-10 months', salary: '₹4-15 LPA', growth: '+13%', difficulty: 'Intermediate',
  },
  'cybersecurity': {
    id: 'cybersecurity', title: 'Cybersecurity Specialist', icon: '🔒',
    description: 'Protect systems and data from cyber threats',
    color: '#dc2626', duration: '10-14 months', salary: '₹6-18 LPA', growth: '+25%', difficulty: 'Advanced',
  },
};

const timelines: Record<string, any[]> = {
  'ai-ml': [
    { phase: 'Foundation', duration: '2-3 months', desc: 'Python, Math, Statistics' },
    { phase: 'Core ML', duration: '3-4 months', desc: 'Machine Learning Algorithms' },
    { phase: 'Deep Learning', duration: '3-4 months', desc: 'Neural Networks, TensorFlow' },
    { phase: 'Specialization', duration: '3-4 months', desc: 'Computer Vision or NLP' },
    { phase: 'Projects & Portfolio', duration: '1-2 months', desc: 'Real-world projects' },
  ],
  'data-science': [
    { phase: 'Foundation', duration: '2-3 months', desc: 'Python, SQL, Statistics' },
    { phase: 'Data Analysis', duration: '2-3 months', desc: 'Pandas, NumPy, Data Cleaning' },
    { phase: 'Visualization', duration: '1-2 months', desc: 'Matplotlib, Seaborn, Plotly' },
    { phase: 'Machine Learning', duration: '2-3 months', desc: 'Scikit-learn, Model Building' },
    { phase: 'Advanced Tools', duration: '1-2 months', desc: 'Spark, Cloud Platforms' },
  ],
  'fullstack': [
    { phase: 'Frontend Basics', duration: '2-3 months', desc: 'HTML, CSS, JavaScript' },
    { phase: 'React Development', duration: '2-3 months', desc: 'React, State Management' },
    { phase: 'Backend Development', duration: '2-3 months', desc: 'Node.js, Express, APIs' },
    { phase: 'Database & DevOps', duration: '1-2 months', desc: 'MongoDB, Git, Deployment' },
    { phase: 'Full Stack Projects', duration: '1-2 months', desc: 'End-to-end applications' },
  ],
  'cybersecurity': [
    { phase: 'Networking Basics', duration: '2-3 months', desc: 'TCP/IP, DNS, Firewalls' },
    { phase: 'Security Fundamentals', duration: '2-3 months', desc: 'Cryptography, Protocols' },
    { phase: 'Ethical Hacking', duration: '3-4 months', desc: 'Penetration Testing, Kali Linux' },
    { phase: 'Compliance & GRC', duration: '1-2 months', desc: 'ISO 27001, NIST, GDPR' },
    { phase: 'Capstone Project', duration: '1-2 months', desc: 'Security Audit & Report' },
  ],
};

const skillMaps: Record<string, Record<string, string[]>> = {
  'ai-ml': { Core: ['Python', 'NumPy', 'Pandas', 'Scikit-learn', 'TensorFlow', 'PyTorch'], Math: ['Linear Algebra', 'Calculus', 'Statistics', 'Probability'], Tools: ['Jupyter Notebook', 'Git', 'Docker', 'AWS/GCP', 'MLflow'], Specialization: ['Computer Vision', 'NLP', 'Deep Learning', 'MLOps'] },
  'data-science': { Core: ['Python', 'SQL', 'Pandas', 'NumPy', 'Scikit-learn', 'Statistics'], Visualization: ['Matplotlib', 'Seaborn', 'Plotly', 'Tableau', 'Power BI'], Tools: ['Jupyter', 'Git', 'Excel', 'Apache Spark'], Specialization: ['Time Series', 'A/B Testing', 'Feature Engineering', 'Model Deployment'] },
  'fullstack': { Frontend: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Tailwind CSS'], Backend: ['Node.js', 'Express.js', 'Python/Django', 'REST APIs', 'GraphQL'], Database: ['MongoDB', 'PostgreSQL', 'Redis', 'Database Design'], Tools: ['Git', 'Docker', 'AWS', 'Testing', 'CI/CD'] },
  'cybersecurity': { Core: ['Network Security', 'Cryptography', 'Firewalls', 'IDS/IPS'], Offensive: ['Penetration Testing', 'Kali Linux', 'Metasploit', 'Burp Suite'], Defensive: ['SIEM', 'Incident Response', 'Forensics', 'Malware Analysis'], Compliance: ['ISO 27001', 'NIST', 'GDPR', 'Risk Assessment'] },
};

const milestones: Record<string, any[]> = {
  'ai-ml': [
    { title: 'Complete Python Fundamentals', pts: 100 }, { title: 'Build First ML Model', pts: 200 },
    { title: 'Deep Learning Project', pts: 300 }, { title: 'Industry Certification', pts: 250 },
    { title: 'Portfolio Deployment', pts: 150 },
  ],
  'data-science': [
    { title: 'Data Analysis Mastery', pts: 150 }, { title: 'Statistical Analysis', pts: 200 },
    { title: 'ML Implementation', pts: 250 }, { title: 'Data Visualization Expert', pts: 150 },
    { title: 'Business Impact Project', pts: 300 },
  ],
  'fullstack': [
    { title: 'Frontend Proficiency', pts: 150 }, { title: 'API Development', pts: 200 },
    { title: 'Database Integration', pts: 150 }, { title: 'Full Stack Application', pts: 300 },
    { title: 'Production Deployment', pts: 200 },
  ],
  'cybersecurity': [
    { title: 'Network Security Basics', pts: 150 }, { title: 'First Pen Test', pts: 200 },
    { title: 'Security Certification', pts: 300 }, { title: 'Incident Response Plan', pts: 200 },
    { title: 'Security Audit Report', pts: 250 },
  ],
};

const courseResources: Record<string, any[]> = {
  'ai-ml': [
    { platform: 'Coursera', title: 'Machine Learning by Andrew Ng', duration: '11 weeks', rating: 4.9 },
    { platform: 'Coursera', title: 'Deep Learning Specialization', duration: '4 months', rating: 4.8 },
    { platform: 'NPTEL', title: 'Intro to Machine Learning', duration: '12 weeks', rating: 4.7 },
    { platform: 'Swayam', title: 'Artificial Intelligence', duration: '8 weeks', rating: 4.6 },
  ],
  'data-science': [
    { platform: 'Coursera', title: 'Data Science by Johns Hopkins', duration: '6 months', rating: 4.7 },
    { platform: 'Coursera', title: 'Applied Data Science with Python', duration: '4 months', rating: 4.8 },
    { platform: 'NPTEL', title: 'Data Science for Engineers', duration: '12 weeks', rating: 4.6 },
    { platform: 'Swayam', title: 'Introduction to Data Analytics', duration: '8 weeks', rating: 4.5 },
  ],
  'fullstack': [
    { platform: 'Coursera', title: 'Full-Stack with React', duration: '4 months', rating: 4.7 },
    { platform: 'Coursera', title: 'Web Applications for Everybody', duration: '6 months', rating: 4.8 },
    { platform: 'NPTEL', title: 'Data Structures & Algorithms', duration: '12 weeks', rating: 4.8 },
    { platform: 'Swayam', title: 'Web Development', duration: '10 weeks', rating: 4.5 },
  ],
  'cybersecurity': [
    { platform: 'Coursera', title: 'Google Cybersecurity Certificate', duration: '6 months', rating: 4.8 },
    { platform: 'Coursera', title: 'IBM Cybersecurity Analyst', duration: '4 months', rating: 4.6 },
    { platform: 'NPTEL', title: 'Network Security', duration: '12 weeks', rating: 4.5 },
    { platform: 'Swayam', title: 'Cyber Security Fundamentals', duration: '8 weeks', rating: 4.4 },
  ],
};

function determinePathId(profile: any, assessment: any): string {
  const interests = profile?.interests || [];
  const rec = assessment?.recommendedPath?.title || '';
  if (interests.includes('Machine Learning') || interests.includes('Artificial Intelligence') || rec.includes('AI')) return 'ai-ml';
  if (interests.includes('Data Science') || rec.includes('Data')) return 'data-science';
  if (interests.includes('Cybersecurity') || rec.includes('Cyber')) return 'cybersecurity';
  return 'fullstack';
}

export default function CareerRoadmapScreen() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(true);
  const [pathId, setPathId] = useState('fullstack');

  useEffect(() => {
    (async () => {
      const profileRaw = await AsyncStorage.getItem('userProfile');
      const assessmentRaw = await AsyncStorage.getItem('assessmentResults');
      const profile = profileRaw ? JSON.parse(profileRaw) : {};
      const assessment = assessmentRaw ? JSON.parse(assessmentRaw) : {};
      const pid = determinePathId(profile, assessment);
      setPathId(pid);

      const roadmapData = {
        careerPath: careerPaths[pid],
        timeline: timelines[pid],
        skills: skillMaps[pid],
        milestones: milestones[pid],
        resources: courseResources[pid],
        generatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem('careerRoadmap', JSON.stringify(roadmapData));
      setTimeout(() => setIsGenerating(false), 2500);
    })();
  }, []);

  const path = careerPaths[pathId];
  const tl = timelines[pathId];
  const skills = skillMaps[pathId];
  const ms = milestones[pathId];
  const courses = courseResources[pathId];

  if (isGenerating) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingEmoji}>🚀</Text>
          <Text style={styles.loadingTitle}>Generating Your Personalized Roadmap</Text>
          <Text style={styles.loadingDesc}>Analyzing your profile and assessment results...</Text>
          <Text style={styles.loadingStep}>✅ Processing interests & skills</Text>
          <Text style={styles.loadingStep}>✅ Matching industry requirements</Text>
          <Text style={styles.loadingStep}>⏳ Creating learning path</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Text style={styles.pathIcon}>{path.icon}</Text>
        <Text style={styles.title}>Your Personalized Career Roadmap</Text>
        <View style={[styles.pathBadge, { backgroundColor: path.color }]}>
          <Text style={styles.pathBadgeText}>{path.title}</Text>
        </View>
        <Text style={styles.pathDesc}>{path.description}</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { emoji: '⏱️', label: 'Duration', value: path.duration },
            { emoji: '💰', label: 'Salary', value: path.salary },
            { emoji: '📈', label: 'Growth', value: path.growth },
            { emoji: '🎯', label: 'Level', value: path.difficulty },
          ].map((s, i) => (
            <View key={i} style={styles.statBox}>
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={[styles.statValue, s.label === 'Growth' && { color: '#059669' }]}>{s.value}</Text>
            </View>
          ))}
        </View>

        {/* Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Learning Timeline</Text>
          {tl.map((phase: any, i: number) => (
            <View key={i} style={styles.timelineItem}>
              <View style={[styles.timelineCircle, i === 0 && { backgroundColor: '#6366f1' }]}>
                <Text style={styles.timelineNum}>{i + 1}</Text>
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={styles.timelinePhase}>{phase.phase}</Text>
                  <Text style={styles.timelineDur}>{phase.duration}</Text>
                </View>
                <Text style={styles.timelineDesc}>{phase.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Skills */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🛠️ Skills to Master</Text>
          {Object.entries(skills).map(([category, items]) => (
            <View key={category} style={{ marginBottom: 14 }}>
              <Text style={styles.skillCategory}>{category}</Text>
              <View style={styles.chipContainer}>
                {(items as string[]).map((skill: string, i: number) => (
                  <View key={i} style={styles.skillChip}>
                    <Text style={styles.skillChipText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Milestones */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏆 Milestones</Text>
          {ms.map((m: any, i: number) => (
            <View key={i} style={styles.milestoneItem}>
              <View style={styles.milestonePoints}>
                <Text style={styles.milestonePointsText}>{m.pts}</Text>
              </View>
              <Text style={styles.milestoneTitle}>{m.title}</Text>
            </View>
          ))}
        </View>

        {/* Courses */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📚 Recommended Courses</Text>
          {courses.map((c: any, i: number) => (
            <View key={i} style={styles.courseItem}>
              <View>
                <Text style={styles.courseTitle}>{c.title}</Text>
                <Text style={styles.coursePlatform}>{c.platform}</Text>
              </View>
              <View style={styles.courseRight}>
                <Text style={styles.courseRating}>⭐ {c.rating}</Text>
                <Text style={styles.courseDur}>{c.duration}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.primaryBtn}
          onPress={() => router.push('/setup/course-recommendations')}>
          <Text style={styles.primaryBtnText}>🚀 Start Learning Journey</Text>
        </TouchableOpacity>

        <View style={styles.actionCards}>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#f5f3ff' }]}
            onPress={() => router.push('/setup/career-simulation')}>
            <Text style={styles.actionEmoji}>🎮</Text>
            <Text style={styles.actionLabel}>Practice Simulations</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#ecfdf5' }]}
            onPress={() => router.push('/setup/community-mentors')}>
            <Text style={styles.actionEmoji}>👥</Text>
            <Text style={styles.actionLabel}>Community & Mentors</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.dashBtn} onPress={() => router.replace('/(dashboard)')}>
          <Text style={styles.dashBtnText}>📊 Go to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loadingContainer: { flex: 1, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingCard: { backgroundColor: '#fff', borderRadius: 16, padding: 32, alignItems: 'center', width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6 },
  loadingEmoji: { fontSize: 32, marginTop: 12 },
  loadingTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginTop: 12, textAlign: 'center' },
  loadingDesc: { fontSize: 14, color: '#6b7280', marginTop: 8, textAlign: 'center' },
  loadingStep: { fontSize: 13, color: '#6b7280', marginTop: 8 },
  scroll: { padding: 20, paddingTop: 50, paddingBottom: 40, alignItems: 'center' },
  pathIcon: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 12 },
  pathBadge: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, marginBottom: 12 },
  pathBadgeText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  pathDesc: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16, width: '100%' },
  statBox: { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  statEmoji: { fontSize: 22, marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#6b7280' },
  statValue: { fontSize: 14, fontWeight: '700', color: '#111827', textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, width: '100%', borderWidth: 1, borderColor: '#e5e7eb' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
  timelineCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#9ca3af', justifyContent: 'center', alignItems: 'center' },
  timelineNum: { fontSize: 13, fontWeight: '700', color: '#fff' },
  timelineContent: { flex: 1 },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  timelinePhase: { fontSize: 15, fontWeight: '600', color: '#111827' },
  timelineDur: { fontSize: 13, fontWeight: '500', color: '#6366f1' },
  timelineDesc: { fontSize: 13, color: '#6b7280' },
  skillCategory: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 8, textTransform: 'capitalize' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  skillChip: { backgroundColor: '#eef2ff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  skillChipText: { fontSize: 12, fontWeight: '500', color: '#6366f1' },
  milestoneItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12, backgroundColor: '#f9fafb', padding: 12, borderRadius: 10 },
  milestonePoints: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fbbf24', justifyContent: 'center', alignItems: 'center' },
  milestonePointsText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  milestoneTitle: { fontSize: 14, fontWeight: '500', color: '#111827', flex: 1 },
  courseItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  courseTitle: { fontSize: 14, fontWeight: '600', color: '#111827', maxWidth: 200 },
  coursePlatform: { fontSize: 12, color: '#6366f1', marginTop: 2 },
  courseRight: { alignItems: 'flex-end' },
  courseRating: { fontSize: 13, color: '#f59e0b' },
  courseDur: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  primaryBtn: { backgroundColor: '#6366f1', paddingVertical: 16, borderRadius: 14, width: '100%', alignItems: 'center', marginBottom: 16, shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  primaryBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
  actionCards: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 16 },
  actionCard: { flex: 1, padding: 16, borderRadius: 14, alignItems: 'center' },
  actionEmoji: { fontSize: 28, marginBottom: 6 },
  actionLabel: { fontSize: 13, fontWeight: '600', color: '#111827', textAlign: 'center' },
  dashBtn: { backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 12, width: '100%', alignItems: 'center' },
  dashBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
