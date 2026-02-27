import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const questions = [
  {
    id: 1, type: 'technical', category: 'Programming',
    question: 'Which programming language would you be most interested in learning or improving?',
    options: [
      { value: 'python', label: 'Python (Data Science, AI, Web Development)' },
      { value: 'javascript', label: 'JavaScript (Web Development, Frontend)' },
      { value: 'java', label: 'Java (Enterprise, Android Development)' },
      { value: 'cpp', label: 'C++ (Systems Programming, Game Development)' },
      { value: 'none', label: "I'm not interested in programming" },
    ],
  },
  {
    id: 2, type: 'technical', category: 'Problem Solving',
    question: 'You need to find the most efficient route between two cities. What approach would you take?',
    options: [
      { value: 'algorithm', label: "Use a pathfinding algorithm like Dijkstra's" },
      { value: 'map-service', label: 'Use an existing map service API' },
      { value: 'heuristic', label: 'Apply heuristic methods and optimization' },
      { value: 'research', label: 'Research existing solutions and adapt them' },
    ],
  },
  {
    id: 3, type: 'aptitude', category: 'Logical Reasoning',
    question: 'If all roses are flowers, and some flowers are red, which statement is definitely true?',
    options: [
      { value: 'all-roses-red', label: 'All roses are red' },
      { value: 'some-roses-red', label: 'Some roses are red' },
      { value: 'all-red-roses', label: 'All red things are roses' },
      { value: 'some-roses-flowers', label: 'Some roses are flowers' },
    ],
  },
  {
    id: 4, type: 'interest', category: 'Career Preference',
    question: 'Which type of work environment appeals to you most?',
    options: [
      { value: 'individual', label: 'Working independently on complex problems' },
      { value: 'team', label: 'Collaborating with diverse teams' },
      { value: 'leadership', label: 'Leading projects and making decisions' },
      { value: 'creative', label: 'Creative and design-focused work' },
    ],
  },
  {
    id: 5, type: 'technical', category: 'Data Analysis',
    question: 'You have a large dataset and need to find patterns. What would be your first step?',
    options: [
      { value: 'visualize', label: 'Create visualizations to understand the data' },
      { value: 'clean', label: 'Clean and preprocess the data' },
      { value: 'statistics', label: 'Apply statistical analysis methods' },
      { value: 'ml', label: 'Use machine learning algorithms' },
    ],
  },
  {
    id: 6, type: 'personality', category: 'Work Style',
    question: 'When faced with a challenging deadline, you typically:',
    options: [
      { value: 'plan', label: 'Create a detailed plan and timeline' },
      { value: 'focus', label: 'Focus intensely and work through it' },
      { value: 'collaborate', label: 'Seek help and delegate tasks' },
      { value: 'prioritize', label: 'Prioritize and potentially negotiate scope' },
    ],
  },
  {
    id: 7, type: 'aptitude', category: 'Pattern Recognition',
    question: 'What comes next in the sequence: 2, 6, 12, 20, 30, ?',
    options: [
      { value: '42', label: '42' },
      { value: '40', label: '40' },
      { value: '36', label: '36' },
      { value: '45', label: '45' },
    ],
  },
  {
    id: 8, type: 'interest', category: 'Technology Preference',
    question: 'Which technological field interests you most?',
    options: [
      { value: 'ai-ml', label: 'Artificial Intelligence & Machine Learning' },
      { value: 'web-mobile', label: 'Web & Mobile Development' },
      { value: 'data-science', label: 'Data Science & Analytics' },
      { value: 'cybersecurity', label: 'Cybersecurity & Network Security' },
    ],
  },
  {
    id: 9, type: 'technical', category: 'System Design',
    question: 'How would you design a system to handle 1 million users?',
    options: [
      { value: 'scale-up', label: 'Upgrade to more powerful servers' },
      { value: 'scale-out', label: 'Distribute across multiple servers' },
      { value: 'cache', label: 'Implement caching and optimization' },
      { value: 'cloud', label: 'Use cloud services and auto-scaling' },
    ],
  },
  {
    id: 10, type: 'personality', category: 'Learning Style',
    question: 'How do you prefer to learn new concepts?',
    options: [
      { value: 'hands-on', label: 'Hands-on practice and experimentation' },
      { value: 'theory', label: 'Understanding theory first, then practice' },
      { value: 'examples', label: 'Learning through examples and case studies' },
      { value: 'discussion', label: 'Discussion and collaborative learning' },
    ],
  },
  {
    id: 11, type: 'interest', category: 'Industry Preference',
    question: 'Which industry would you like to work in?',
    options: [
      { value: 'tech', label: 'Technology & Software' },
      { value: 'finance', label: 'Finance & Fintech' },
      { value: 'healthcare', label: 'Healthcare & Biotech' },
      { value: 'education', label: 'Education & EdTech' },
    ],
  },
  {
    id: 12, type: 'aptitude', category: 'Mathematical Reasoning',
    question: 'If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?',
    options: [
      { value: '5', label: '5 minutes' },
      { value: '100', label: '100 minutes' },
      { value: '20', label: '20 minutes' },
      { value: '1', label: '1 minute' },
    ],
  },
];

const getCareerPath = (topInterest: string) => {
  const paths: Record<string, any> = {
    'ai-ml': { title: 'AI/Machine Learning Specialist', skills: ['Python', 'TensorFlow', 'Data Analysis', 'Statistics', 'Neural Networks'], description: 'Focus on artificial intelligence and machine learning technologies' },
    'web-mobile': { title: 'Full Stack Developer', skills: ['JavaScript', 'React', 'Node.js', 'Databases', 'Mobile Development'], description: 'Build end-to-end web and mobile applications' },
    'data-science': { title: 'Data Scientist', skills: ['Python', 'R', 'SQL', 'Machine Learning', 'Data Visualization'], description: 'Extract insights from data to drive business decisions' },
    'cybersecurity': { title: 'Cybersecurity Specialist', skills: ['Network Security', 'Ethical Hacking', 'Risk Assessment', 'Security Protocols'], description: 'Protect systems and data from cyber threats' },
  };
  return paths[topInterest] || paths['web-mobile'];
};

export default function SkillAssessmentScreen() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const calculateResults = () => {
    const scores: Record<string, number> = { technical: 0, problemSolving: 0, dataScience: 0, webDevelopment: 0, leadership: 0, creativity: 0, analytical: 0, collaboration: 0 };
    const interests: Record<string, number> = { 'ai-ml': 0, 'web-mobile': 0, 'data-science': 0, 'cybersecurity': 0, programming: 0 };

    Object.entries(answers).forEach(([qId, answer]) => {
      const question = questions.find(q => q.id === parseInt(qId));
      if (!question) return;
      switch (question.type) {
        case 'technical':
          scores.technical += 10;
          if (answer.includes('python') || answer.includes('data') || answer === 'clean' || answer === 'statistics' || answer === 'ml') {
            interests['data-science'] += 15; scores.analytical += 10;
          }
          if (answer.includes('javascript') || answer.includes('web') || answer === 'scale-out' || answer === 'cloud') {
            interests['web-mobile'] += 15; scores.creativity += 10;
          }
          break;
        case 'interest':
          if (answer === 'ai-ml') interests['ai-ml'] += 20;
          if (answer === 'web-mobile') interests['web-mobile'] += 20;
          if (answer === 'data-science') interests['data-science'] += 20;
          if (answer === 'cybersecurity') interests['cybersecurity'] += 20;
          if (answer === 'leadership') scores.leadership += 15;
          if (answer === 'team') scores.collaboration += 15;
          if (answer === 'creative') scores.creativity += 15;
          break;
        case 'personality':
          if (answer === 'plan' || answer === 'leadership') scores.leadership += 15;
          if (answer === 'collaborate' || answer === 'discussion') scores.collaboration += 15;
          if (answer === 'hands-on') scores.creativity += 15;
          break;
        case 'aptitude':
          scores.problemSolving += 10; scores.analytical += 10;
          break;
      }
    });

    const topInterest = Object.entries(interests).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    return {
      scores, interests, recommendedPath: getCareerPath(topInterest),
      completedAt: new Date().toISOString(),
      totalQuestions: questions.length,
      answeredQuestions: Object.keys(answers).length,
    };
  };

  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    setIsSubmitting(true);
    const results = calculateResults();
    await AsyncStorage.setItem('assessmentResults', JSON.stringify(results));
    setTimeout(() => { router.replace('/setup/career-roadmap'); }, 2000);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

  if (isSubmitting) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingTitle}>Processing Your Results</Text>
          <Text style={styles.loadingDesc}>Analyzing responses to create your personalized career roadmap...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Skill Assessment</Text>
          <View style={styles.timerBadge}>
            <Ionicons name="time" size={16} color={timeLeft < 120 ? '#ef4444' : '#6b7280'} />
            <Text style={[styles.timerText, timeLeft < 120 && { color: '#ef4444' }]}>{formatTime(timeLeft)}</Text>
          </View>
        </View>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>Question {currentQuestion + 1} of {questions.length}</Text>
          <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{currentQ.category}</Text>
        </View>
      </View>

      {/* Question */}
      <ScrollView style={styles.questionScroll} contentContainerStyle={styles.questionContent}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{currentQ.type.charAt(0).toUpperCase() + currentQ.type.slice(1)}</Text>
        </View>
        <Text style={styles.questionText}>{currentQ.question}</Text>

        <View style={styles.optionsContainer}>
          {currentQ.options.map((option, index) => (
            <TouchableOpacity key={index}
              style={[styles.optionCard, answers[currentQ.id] === option.value && styles.optionCardActive]}
              onPress={() => handleAnswer(currentQ.id, option.value)}>
              <View style={[styles.radioCircle, answers[currentQ.id] === option.value && styles.radioCircleActive]}>
                {answers[currentQ.id] === option.value && <View style={styles.radioDot} />}
              </View>
              <Text style={[styles.optionText, answers[currentQ.id] === option.value && styles.optionTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.prevBtn}
          onPress={() => currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1)}
          disabled={currentQuestion === 0}>
          <Text style={[styles.prevBtnText, currentQuestion === 0 && { opacity: 0.4 }]}>Previous</Text>
        </TouchableOpacity>
        {currentQuestion === questions.length - 1 ? (
          <TouchableOpacity style={[styles.submitBtn, !answers[currentQ.id] && { opacity: 0.5 }]}
            onPress={handleSubmit} disabled={!answers[currentQ.id]}>
            <Text style={styles.submitBtnText}>Submit Assessment</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.nextBtn, !answers[currentQ.id] && { opacity: 0.5 }]}
            onPress={() => answers[currentQ.id] && setCurrentQuestion(currentQuestion + 1)}
            disabled={!answers[currentQ.id]}>
            <Text style={styles.nextBtnText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Question Overview */}
      <View style={styles.overviewBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.overviewContent}>
          {questions.map((_, index) => (
            <TouchableOpacity key={index}
              style={[styles.overviewDot,
                index === currentQuestion && styles.overviewDotCurrent,
                answers[questions[index].id] && index !== currentQuestion && styles.overviewDotAnswered]}
              onPress={() => setCurrentQuestion(index)}>
              <Text style={[styles.overviewDotText,
                index === currentQuestion && styles.overviewDotTextCurrent,
                answers[questions[index].id] && index !== currentQuestion && styles.overviewDotTextAnswered]}>
                {index + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loadingContainer: { flex: 1, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingCard: { backgroundColor: '#fff', borderRadius: 16, padding: 32, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6 },
  loadingTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginTop: 16 },
  loadingDesc: { fontSize: 14, color: '#6b7280', marginTop: 8, textAlign: 'center' },
  header: { backgroundColor: '#fff', paddingTop: 50, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  timerText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressText: { fontSize: 12, color: '#6b7280' },
  progressPercent: { fontSize: 12, color: '#6b7280' },
  progressBar: { height: 6, backgroundColor: '#e5e7eb', borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: '#6366f1', borderRadius: 3 },
  categoryBadge: { marginTop: 8 },
  categoryText: { fontSize: 12, color: '#6366f1', fontWeight: '500' },
  questionScroll: { flex: 1 },
  questionContent: { padding: 16 },
  typeBadge: { backgroundColor: '#eef2ff', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 12 },
  typeText: { fontSize: 12, fontWeight: '600', color: '#6366f1' },
  questionText: { fontSize: 18, fontWeight: '600', color: '#111827', lineHeight: 26, marginBottom: 20 },
  optionsContainer: { gap: 10 },
  optionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1.5, borderColor: '#e5e7eb', gap: 12 },
  optionCardActive: { borderColor: '#6366f1', backgroundColor: '#eef2ff' },
  radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#d1d5db', justifyContent: 'center', alignItems: 'center' },
  radioCircleActive: { borderColor: '#6366f1' },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#6366f1' },
  optionText: { fontSize: 15, color: '#374151', flex: 1 },
  optionTextActive: { color: '#4338ca', fontWeight: '500' },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  prevBtn: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#f3f4f6', borderRadius: 10 },
  prevBtnText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  nextBtn: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#6366f1', borderRadius: 10 },
  nextBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  submitBtn: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#10b981', borderRadius: 10 },
  submitBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  overviewBar: { backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  overviewContent: { flexDirection: 'row', gap: 6 },
  overviewDot: { width: 28, height: 28, borderRadius: 6, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  overviewDotCurrent: { backgroundColor: '#6366f1' },
  overviewDotAnswered: { backgroundColor: '#d1fae5' },
  overviewDotText: { fontSize: 12, fontWeight: '600', color: '#9ca3af' },
  overviewDotTextCurrent: { color: '#fff' },
  overviewDotTextAnswered: { color: '#059669' },
});
