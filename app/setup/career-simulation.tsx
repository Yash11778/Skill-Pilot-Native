import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const simulationsDB: Record<string, any[]> = {
  'ai-ml': [
    {
      id: 'ai-1', title: 'Image Classification System', difficulty: 'Intermediate', duration: '2-3 hours',
      description: 'Build a convolutional neural network to classify images into 10 categories using TensorFlow/PyTorch.',
      tasks: [
        { id: 1, text: 'Set up Python environment with TensorFlow', done: false },
        { id: 2, text: 'Load and preprocess CIFAR-10 dataset', done: false },
        { id: 3, text: 'Design CNN architecture with 3+ conv layers', done: false },
        { id: 4, text: 'Train model with data augmentation', done: false },
        { id: 5, text: 'Evaluate accuracy and generate confusion matrix', done: false },
        { id: 6, text: 'Deploy model with Flask API endpoint', done: false },
      ],
      mentorTip: 'Start with a simple architecture and gradually add complexity. Use BatchNormalization and Dropout to prevent overfitting.',
    },
    {
      id: 'ai-2', title: 'Sentiment Analysis Bot', difficulty: 'Beginner', duration: '1-2 hours',
      description: 'Create a sentiment analysis tool that classifies text reviews as positive, negative, or neutral.',
      tasks: [
        { id: 1, text: 'Collect and clean text dataset', done: false },
        { id: 2, text: 'Implement text preprocessing pipeline', done: false },
        { id: 3, text: 'Train NLP model using scikit-learn', done: false },
        { id: 4, text: 'Test with real-world review data', done: false },
        { id: 5, text: 'Build simple chat interface', done: false },
      ],
      mentorTip: 'Use TF-IDF for feature extraction and try both Naive Bayes and SVM classifiers to compare performance.',
    },
  ],
  'data-science': [
    {
      id: 'ds-1', title: 'Sales Forecasting Dashboard', difficulty: 'Intermediate', duration: '3-4 hours',
      description: 'Build an interactive dashboard that visualizes sales data and predicts future trends.',
      tasks: [
        { id: 1, text: 'Load and clean sales dataset', done: false },
        { id: 2, text: 'Exploratory data analysis with Pandas', done: false },
        { id: 3, text: 'Create time series model (ARIMA/Prophet)', done: false },
        { id: 4, text: 'Build interactive Plotly visualizations', done: false },
        { id: 5, text: 'Generate forecast for next 6 months', done: false },
        { id: 6, text: 'Create executive summary report', done: false },
      ],
      mentorTip: 'Focus on data cleaning first — 80% of your time should be on data preparation.',
    },
    {
      id: 'ds-2', title: 'Customer Segmentation Analysis', difficulty: 'Beginner', duration: '2-3 hours',
      description: 'Segment customers based on purchasing behavior using clustering algorithms.',
      tasks: [
        { id: 1, text: 'Load customer transaction data', done: false },
        { id: 2, text: 'Feature engineering (RFM analysis)', done: false },
        { id: 3, text: 'Apply K-Means clustering', done: false },
        { id: 4, text: 'Analyze and profile each segment', done: false },
        { id: 5, text: 'Create visualization of segments', done: false },
      ],
      mentorTip: 'Use the elbow method to determine the optimal number of clusters.',
    },
  ],
  'fullstack': [
    {
      id: 'fs-1', title: 'Task Management App', difficulty: 'Intermediate', duration: '4-5 hours',
      description: 'Build a full-stack Kanban-style task management application with real-time updates.',
      tasks: [
        { id: 1, text: 'Set up React frontend with routing', done: false },
        { id: 2, text: 'Design and implement UI components', done: false },
        { id: 3, text: 'Build REST API with Node.js/Express', done: false },
        { id: 4, text: 'Implement MongoDB data models', done: false },
        { id: 5, text: 'Add drag-and-drop functionality', done: false },
        { id: 6, text: 'Deploy to cloud platform', done: false },
      ],
      mentorTip: 'Start with the API design and data models before building the frontend.',
    },
    {
      id: 'fs-2', title: 'E-Commerce Product Page', difficulty: 'Beginner', duration: '2-3 hours',
      description: 'Create a responsive product listing page with cart functionality.',
      tasks: [
        { id: 1, text: 'Design responsive product grid layout', done: false },
        { id: 2, text: 'Implement search and filter features', done: false },
        { id: 3, text: 'Build shopping cart with state management', done: false },
        { id: 4, text: 'Add product detail modal', done: false },
        { id: 5, text: 'Implement checkout flow UI', done: false },
      ],
      mentorTip: 'Use CSS Grid for the product layout and React Context for cart state management.',
    },
  ],
  'cybersecurity': [
    {
      id: 'cs-1', title: 'Vulnerability Assessment Report', difficulty: 'Intermediate', duration: '3-4 hours',
      description: 'Conduct a security audit on a sample web application and produce a vulnerability report.',
      tasks: [
        { id: 1, text: 'Set up testing environment', done: false },
        { id: 2, text: 'Run automated vulnerability scans', done: false },
        { id: 3, text: 'Test for OWASP Top 10 vulnerabilities', done: false },
        { id: 4, text: 'Manual testing for logic flaws', done: false },
        { id: 5, text: 'Document findings and risk ratings', done: false },
        { id: 6, text: 'Write remediation recommendations', done: false },
      ],
      mentorTip: 'Always get written permission before testing. Document everything methodically.',
    },
    {
      id: 'cs-2', title: 'Network Packet Analyzer', difficulty: 'Beginner', duration: '2-3 hours',
      description: 'Build a simple packet analyzer that captures and displays network traffic.',
      tasks: [
        { id: 1, text: 'Set up Python with Scapy library', done: false },
        { id: 2, text: 'Capture live network packets', done: false },
        { id: 3, text: 'Parse packet headers and payloads', done: false },
        { id: 4, text: 'Filter traffic by protocol', done: false },
        { id: 5, text: 'Generate traffic summary report', done: false },
      ],
      mentorTip: 'Start with capturing HTTP traffic only, then expand to other protocols.',
    },
  ],
};

const achievements = [
  { id: 'first-task', icon: '🎯', title: 'First Task', desc: 'Complete your first simulation task', requirement: 1 },
  { id: 'half-way', icon: '🌟', title: 'Half Way', desc: 'Complete 50% of a simulation', requirement: 0.5 },
  { id: 'completionist', icon: '🏆', title: 'Completionist', desc: 'Finish an entire simulation', requirement: 1.0 },
];

export default function CareerSimulationScreen() {
  const router = useRouter();
  const [pathId, setPathId] = useState('fullstack');
  const [activeSimIdx, setActiveSimIdx] = useState(0);
  const [taskStates, setTaskStates] = useState<Record<string, boolean[]>>({});
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const roadmapRaw = await AsyncStorage.getItem('careerRoadmap');
      if (roadmapRaw) {
        const roadmap = JSON.parse(roadmapRaw);
        setPathId(roadmap.careerPath?.id || 'fullstack');
      }
    })();
  }, []);

  const sims = simulationsDB[pathId] || simulationsDB['fullstack'];
  const activeSim = sims[activeSimIdx];

  const getTasksDone = (simId: string) => taskStates[simId] || activeSim.tasks.map(() => false);

  const toggleTask = (taskIdx: number) => {
    const simId = activeSim.id;
    const current = getTasksDone(simId);
    const updated = [...current];
    updated[taskIdx] = !updated[taskIdx];
    setTaskStates({ ...taskStates, [simId]: updated });

    const completedCount = updated.filter(Boolean).length;
    const total = activeSim.tasks.length;
    const newBadges = [...earnedBadges];

    if (completedCount >= 1 && !newBadges.includes('first-task')) {
      newBadges.push('first-task');
    }
    if (completedCount >= total / 2 && !newBadges.includes('half-way')) {
      newBadges.push('half-way');
    }
    if (completedCount === total && !newBadges.includes('completionist')) {
      newBadges.push('completionist');
    }
    setEarnedBadges(newBadges);
  };

  const tasksDone = getTasksDone(activeSim.id);
  const completedCount = tasksDone.filter(Boolean).length;
  const progress = activeSim.tasks.length ? completedCount / activeSim.tasks.length : 0;

  const handleContinue = async () => {
    await AsyncStorage.setItem('currentSimulation', JSON.stringify({
      pathId, activeSimIdx, taskStates, earnedBadges,
      completedAt: new Date().toISOString(),
    }));
    await AsyncStorage.setItem('achievements', JSON.stringify(earnedBadges));
    router.push('/setup/community-mentors');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>🎮 Career Simulations</Text>
        <Text style={styles.subtitle}>Practice real-world projects in your career path</Text>

        {/* Simulation Picker */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.simPicker}>
          {sims.map((sim: any, idx: number) => (
            <TouchableOpacity key={sim.id}
              style={[styles.simTab, activeSimIdx === idx && styles.simTabActive]}
              onPress={() => setActiveSimIdx(idx)}>
              <Text style={[styles.simTabText, activeSimIdx === idx && styles.simTabTextActive]}>
                {sim.title}
              </Text>
              <View style={[styles.diffBadge,
                sim.difficulty === 'Beginner' ? { backgroundColor: '#dcfce7' } : { backgroundColor: '#fef3c7' }]}>
                <Text style={[styles.diffBadgeText,
                  sim.difficulty === 'Beginner' ? { color: '#059669' } : { color: '#d97706' }]}>
                  {sim.difficulty}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Active Simulation */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{activeSim.title}</Text>
          <Text style={styles.cardDesc}>{activeSim.description}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaItem}>⏱️ {activeSim.duration}</Text>
            <Text style={styles.metaItem}>📊 {activeSim.difficulty}</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressCount}>{completedCount}/{activeSim.tasks.length} tasks completed</Text>
          </View>
        </View>

        {/* Tasks Checklist */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📋 Task Checklist</Text>
          {activeSim.tasks.map((task: any, idx: number) => (
            <TouchableOpacity key={task.id} style={styles.taskItem} onPress={() => toggleTask(idx)}>
              <View style={[styles.checkbox, tasksDone[idx] && styles.checkboxDone]}>
                {tasksDone[idx] && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
              <Text style={[styles.taskText, tasksDone[idx] && styles.taskTextDone]}>{task.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mentor Tip */}
        <View style={[styles.card, { backgroundColor: '#fffbeb', borderColor: '#fde68a' }]}>
          <Text style={styles.tipTitle}>💡 Mentor Tip</Text>
          <Text style={styles.tipText}>{activeSim.mentorTip}</Text>
        </View>

        {/* Achievements */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🏅 Achievements</Text>
          <View style={styles.badgesRow}>
            {achievements.map(a => {
              const earned = earnedBadges.includes(a.id);
              return (
                <View key={a.id} style={[styles.badge, earned ? styles.badgeEarned : styles.badgeLocked]}>
                  <Text style={styles.badgeIcon}>{earned ? a.icon : '🔒'}</Text>
                  <Text style={[styles.badgeTitle, earned && { color: '#111827' }]}>{a.title}</Text>
                  <Text style={styles.badgeDesc}>{a.desc}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.primaryBtn} onPress={handleContinue}>
          <Text style={styles.primaryBtnText}>Continue to Community →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipBtn} onPress={() => router.push('/setup/community-mentors')}>
          <Text style={styles.skipBtnText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { padding: 20, paddingTop: 50, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20, marginTop: 4 },
  simPicker: { marginBottom: 16 },
  simTab: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginRight: 12, borderWidth: 1, borderColor: '#e5e7eb', minWidth: 180 },
  simTabActive: { borderColor: '#6366f1', backgroundColor: '#f5f3ff' },
  simTabText: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  simTabTextActive: { color: '#6366f1' },
  diffBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  diffBadgeText: { fontSize: 11, fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  cardDesc: { fontSize: 14, color: '#6b7280', lineHeight: 20, marginBottom: 12 },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  metaItem: { fontSize: 13, color: '#6b7280' },
  progressSection: { marginTop: 4 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  progressPercent: { fontSize: 13, fontWeight: '700', color: '#6366f1' },
  progressBarBg: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4 },
  progressBarFill: { height: 8, backgroundColor: '#6366f1', borderRadius: 4 },
  progressCount: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 14 },
  taskItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#d1d5db', justifyContent: 'center', alignItems: 'center' },
  checkboxDone: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  taskText: { fontSize: 14, color: '#374151', flex: 1 },
  taskTextDone: { textDecorationLine: 'line-through', color: '#9ca3af' },
  tipTitle: { fontSize: 16, fontWeight: '700', color: '#92400e', marginBottom: 8 },
  tipText: { fontSize: 14, color: '#92400e', lineHeight: 20 },
  badgesRow: { flexDirection: 'row', gap: 10 },
  badge: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
  badgeEarned: { backgroundColor: '#fef3c7' },
  badgeLocked: { backgroundColor: '#f3f4f6' },
  badgeIcon: { fontSize: 28, marginBottom: 6 },
  badgeTitle: { fontSize: 12, fontWeight: '600', color: '#9ca3af', textAlign: 'center' },
  badgeDesc: { fontSize: 10, color: '#9ca3af', textAlign: 'center', marginTop: 2 },
  primaryBtn: { backgroundColor: '#6366f1', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
  skipBtn: { paddingVertical: 12, alignItems: 'center' },
  skipBtnText: { fontSize: 14, color: '#6b7280' },
});
