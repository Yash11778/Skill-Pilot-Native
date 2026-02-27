import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import aiService from '../../src/services/aiService';

const { width } = Dimensions.get('window');

const FALLBACK_QUESTIONS: Record<string, any[]> = {
  Aptitude: [
    { question: 'What comes next: 2, 6, 12, 20, ?', options: ['28', '30', '32', '36'], correctAnswer: 1, explanation: 'Pattern is n(n+1): 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30' },
    { question: 'If all roses are flowers and some flowers fade quickly, which is true?', options: ['All roses fade quickly', 'Some roses may fade quickly', 'No roses fade quickly', 'Cannot determine'], correctAnswer: 1, explanation: 'Only some flowers fade; roses may or may not be in that group.' },
    { question: 'A train travels 60 km in 40 minutes. What is its speed in km/h?', options: ['80', '90', '100', '120'], correctAnswer: 1, explanation: '60 km in 40 min = 60/(40/60) = 90 km/h' },
    { question: 'Which number is the odd one out: 3, 5, 11, 14, 17?', options: ['3', '5', '14', '17'], correctAnswer: 2, explanation: '14 is the only even number; the rest are odd/prime.' },
    { question: 'Complete the analogy: Book is to Reading as Fork is to ...', options: ['Drawing', 'Writing', 'Eating', 'Cooking'], correctAnswer: 2, explanation: 'A book is used for reading; a fork is used for eating.' },
  ],
  Personality: [
    { question: 'In group projects, you typically...', options: ['Take the lead', 'Support others', 'Work independently', 'Observe first'], correctAnswer: 0, explanation: 'Leadership indicates a proactive personality.' },
    { question: 'When facing a new challenge, you usually...', options: ['Jump right in', 'Research thoroughly first', 'Ask others for advice', 'Wait to see what happens'], correctAnswer: 1, explanation: 'Thorough research shows analytical thinking.' },
    { question: 'Your ideal work environment is...', options: ['Busy open office', 'Quiet private space', 'Remote from home', 'Varies by task'], correctAnswer: 3, explanation: 'Flexibility shows adaptability.' },
    { question: 'When making decisions, you rely more on...', options: ['Logic and data', 'Gut feelings', 'Others opinions', 'Past experiences'], correctAnswer: 0, explanation: 'Data-driven decisions indicate analytical thinking.' },
    { question: 'How do you handle workplace conflict?', options: ['Address it directly', 'Avoid confrontation', 'Seek mediation', 'Compromise quickly'], correctAnswer: 0, explanation: 'Direct communication is generally most effective.' },
  ],
  Skills: [
    { question: 'Which skill is most important for a tech career?', options: ['Coding only', 'Problem solving', 'Communication', 'All of the above'], correctAnswer: 3, explanation: 'Tech careers need a blend of technical and soft skills.' },
    { question: 'What does "version control" primarily help with?', options: ['Tracking code changes', 'Running tests', 'Deploying apps', 'Designing UI'], correctAnswer: 0, explanation: 'Version control (like Git) tracks code changes.' },
    { question: 'Which is a key soft skill for career growth?', options: ['Speed typing', 'Emotional intelligence', 'Memory', 'Physical fitness'], correctAnswer: 1, explanation: 'EQ is crucial for teamwork and leadership.' },
    { question: 'Best approach to learning a new programming language?', options: ['Read the entire manual', 'Build projects', 'Watch all tutorials', 'Memorize syntax'], correctAnswer: 1, explanation: 'Building projects provides practical experience.' },
    { question: 'What is machine learning primarily about?', options: ['Building robots', 'Learning from data patterns', 'Making computers faster', 'Web development'], correctAnswer: 1, explanation: 'ML is about algorithms learning from data patterns.' },
  ],
  Interests: [
    { question: 'Which activity excites you most?', options: ['Solving puzzles', 'Creating art', 'Helping people', 'Building things'], correctAnswer: 0, explanation: 'Puzzle-solving indicates analytical interests.' },
    { question: 'What type of content do you consume most?', options: ['Tech blogs', 'Business news', 'Creative media', 'Scientific articles'], correctAnswer: 0, explanation: 'Content preferences reflect career interests.' },
    { question: 'Your dream project would involve...', options: ['AI and automation', 'Social impact', 'Creative design', 'Financial systems'], correctAnswer: 0, explanation: 'Project preferences align with career paths.' },
    { question: 'What would you do with unlimited resources?', options: ['Build a tech company', 'Create art galleries', 'Fund research', 'Travel the world'], correctAnswer: 0, explanation: 'Aspirations indicate core interests.' },
    { question: 'Which industry fascinates you most?', options: ['Technology', 'Healthcare', 'Entertainment', 'Finance'], correctAnswer: 0, explanation: 'Industry interest helps determine career paths.' },
  ],
  Values: [
    { question: 'What matters most in a career?', options: ['High salary', 'Work-life balance', 'Making a difference', 'Learning opportunities'], correctAnswer: 3, explanation: 'Values drive career satisfaction.' },
    { question: 'Your ideal company culture values...', options: ['Competition', 'Collaboration', 'Autonomy', 'Structure'], correctAnswer: 1, explanation: 'Collaborative cultures foster innovation.' },
    { question: 'How important is career advancement to you?', options: ['Top priority', 'Important but not everything', 'Less important than work-life balance', 'Not important'], correctAnswer: 1, explanation: 'Balance between growth and fulfillment matters.' },
    { question: 'What would you sacrifice for your dream job?', options: ['Location', 'Salary', 'Free time', 'Nothing'], correctAnswer: 0, explanation: 'Understanding trade-offs helps in career planning.' },
    { question: 'Which motivates you most?', options: ['Recognition', 'Financial rewards', 'Personal growth', 'Team success'], correctAnswer: 2, explanation: 'Personal growth leads to sustained motivation.' },
  ],
};

export default function AssessmentsScreen() {
  const [activeTab, setActiveTab] = useState('available');
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<any>(null);
  const [quizStage, setQuizStage] = useState<'intro' | 'quiz' | 'results'>('intro');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [completedAssessments, setCompletedAssessments] = useState<any[]>([
    { id: 99, title: 'Personality Assessment', score: 85, date: '2 days ago', icon: 'happy-outline', color: '#8b5cf6', category: 'Personality' },
  ]);

  const assessments = [
    { id: 1, title: 'Aptitude Assessment', description: 'Measure cognitive abilities, problem-solving, and logical reasoning', duration: '15-20 min', questions: 5, icon: 'bulb-outline', color: '#f59e0b', category: 'Aptitude' },
    { id: 2, title: 'Personality Assessment', description: 'Discover your personality traits and career alignment', duration: '10-15 min', questions: 5, icon: 'happy-outline', color: '#8b5cf6', category: 'Personality' },
    { id: 3, title: 'Skills Assessment', description: 'Evaluate your technical and interpersonal skills', duration: '15-20 min', questions: 5, icon: 'flash-outline', color: '#3b82f6', category: 'Skills' },
    { id: 4, title: 'Interest Inventory', description: 'Identify careers that match your passions and interests', duration: '10-15 min', questions: 5, icon: 'heart-outline', color: '#10b981', category: 'Interests' },
    { id: 5, title: 'Values Assessment', description: 'Understand your core work values and motivations', duration: '10-15 min', questions: 5, icon: 'shield-checkmark-outline', color: '#ec4899', category: 'Values' },
  ];

  const generateQuestions = async (category: string) => {
    setLoading(true);
    try {
      const prompt = `Generate 5 multiple choice ${category} assessment questions for career counseling. Each has 4 options, one correct answer, and a brief explanation. Format as JSON array: [{"question":"...","options":["A","B","C","D"],"correctAnswer":0,"explanation":"..."}]. Return ONLY the JSON array.`;
      const response = await aiService.chatWithAI(prompt, []);
      if (response.success && response.data?.response) {
        const text = response.data.response;
        const match = text.match(/\[[\s\S]*\]/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (parsed.length >= 3) { setQuestions(parsed.slice(0, 5)); setLoading(false); return; }
        }
      }
    } catch (e) {
      console.log('AI question generation failed, using fallback...');
    }
    setQuestions(FALLBACK_QUESTIONS[category] || FALLBACK_QUESTIONS['Aptitude']);
    setLoading(false);
  };

  const startAssessment = (assessment: any) => {
    setCurrentAssessment(assessment);
    setShowQuiz(true);
    setQuizStage('intro');
    setCurrentQ(0);
    setAnswers([]);
    setQuestions([]);
  };

  const beginQuiz = async () => {
    setQuizStage('quiz');
    await generateQuestions(currentAssessment.category);
  };

  const handleAnswer = (idx: number) => {
    const newAnswers = [...answers, idx];
    setAnswers(newAnswers);
    if (currentQ < questions.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 300);
    } else {
      setTimeout(() => {
        setQuizStage('results');
        const score = questions.reduce((acc, q, i) => acc + (newAnswers[i] === q.correctAnswer ? 1 : 0), 0);
        const pct = Math.round((score / questions.length) * 100);
        setCompletedAssessments(prev => [...prev.filter(a => a.title !== currentAssessment.title), {
          id: Date.now(), title: currentAssessment.title, score: pct, date: 'Just now',
          icon: currentAssessment.icon, color: currentAssessment.color, category: currentAssessment.category,
        }]);
      }, 300);
    }
  };

  const score = quizStage === 'results' ? questions.reduce((acc, q, i) => acc + (answers[i] === q.correctAnswer ? 1 : 0), 0) : 0;
  const scorePercent = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Career Assessments</Text>
        <Text style={styles.headerSubtitle}>
          Discover your strengths and ideal career paths
        </Text>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{completedAssessments.length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{assessments.length}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.activeTab]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
            Available
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'available' ? (
          assessments.map((assessment) => (
            <TouchableOpacity key={assessment.id} style={styles.card} onPress={() => startAssessment(assessment)}>
              <View style={[styles.iconContainer, { backgroundColor: assessment.color + '20' }]}>
                <Ionicons name={assessment.icon as any} size={32} color={assessment.color} />
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{assessment.title}</Text>
                  <View style={[styles.badge, { backgroundColor: assessment.color + '20' }]}>
                    <Text style={[styles.badgeText, { color: assessment.color }]}>{assessment.category}</Text>
                  </View>
                </View>
                <Text style={styles.cardDescription}>{assessment.description}</Text>
                <View style={styles.cardFooter}>
                  <View style={styles.infoItem}>
                    <Ionicons name="time-outline" size={16} color="#6b7280" />
                    <Text style={styles.infoText}>{assessment.duration}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="help-circle-outline" size={16} color="#6b7280" />
                    <Text style={styles.infoText}>{assessment.questions} questions</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.startButton} onPress={() => startAssessment(assessment)}>
                  <Text style={styles.startButtonText}>Start Assessment</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          completedAssessments.length > 0 ? completedAssessments.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon as any} size={32} color={item.color} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreLabel}>Score:</Text>
                  <Text style={[styles.scoreValue, { color: item.score >= 60 ? '#10b981' : '#f59e0b' }]}>{item.score}%</Text>
                </View>
                <Text style={styles.dateText}>Completed {item.date}</Text>
                <TouchableOpacity style={styles.viewButton} onPress={() => startAssessment({ ...item, questions: 5 })}>
                  <Text style={styles.viewButtonText}>Retake Assessment</Text>
                </TouchableOpacity>
              </View>
            </View>
          )) : (
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No completed assessments yet</Text>
            </View>
          )
        )}
      </ScrollView>

      {/* Quiz Modal */}
      <Modal visible={showQuiz} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle} numberOfLines={1}>{currentAssessment?.title || 'Assessment'}</Text>
            <TouchableOpacity onPress={() => setShowQuiz(false)}>
              <Ionicons name="close" size={28} color="#111827" />
            </TouchableOpacity>
          </View>

          {quizStage === 'intro' && (
            <View style={styles.introContent}>
              <View style={[styles.introIcon, { backgroundColor: (currentAssessment?.color || '#6366f1') + '20' }]}>
                <Ionicons name={currentAssessment?.icon as any || 'clipboard-outline'} size={48} color={currentAssessment?.color || '#6366f1'} />
              </View>
              <Text style={styles.introTitle}>{currentAssessment?.title}</Text>
              <Text style={styles.introDesc}>{currentAssessment?.description}</Text>
              <View style={styles.introStats}>
                <View style={styles.introStat}>
                  <Ionicons name="time-outline" size={20} color="#6b7280" />
                  <Text style={styles.introStatText}>{currentAssessment?.duration}</Text>
                </View>
                <View style={styles.introStat}>
                  <Ionicons name="help-circle-outline" size={20} color="#6b7280" />
                  <Text style={styles.introStatText}>5 questions</Text>
                </View>
              </View>
              <Text style={styles.introNote}>Questions are generated by AI for a personalized experience. Answer honestly for the best career guidance.</Text>
              <TouchableOpacity style={styles.beginBtn} onPress={beginQuiz}>
                <LinearGradient colors={['#6366f1', '#8b5cf6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.beginBtnGrad}>
                  <Text style={styles.beginBtnText}>Begin Assessment</Text>
                  <Ionicons name="arrow-forward" size={22} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {quizStage === 'quiz' && (
            loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.loadingText}>AI is creating your personalized questions...</Text>
              </View>
            ) : questions.length > 0 ? (
              <View style={styles.quizContent}>
                <View style={styles.quizProgressBar}>
                  <View style={[styles.quizProgressFill, { width: `${((currentQ + 1) / questions.length) * 100}%` }]} />
                </View>
                <Text style={styles.quizCounter}>Question {currentQ + 1} of {questions.length}</Text>
                <Text style={styles.quizQuestion}>{questions[currentQ]?.question}</Text>
                {questions[currentQ]?.options.map((opt: string, i: number) => (
                  <TouchableOpacity key={i} style={styles.quizOption} onPress={() => handleAnswer(i)}>
                    <View style={styles.optLetter}><Text style={styles.optLetterText}>{String.fromCharCode(65 + i)}</Text></View>
                    <Text style={styles.optText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null
          )}

          {quizStage === 'results' && (
            <ScrollView contentContainerStyle={styles.resultsContent}>
              <Text style={styles.resultEmoji}>{scorePercent >= 80 ? '🏆' : scorePercent >= 60 ? '👏' : '💪'}</Text>
              <Text style={styles.resultTitle}>Assessment Complete!</Text>
              <Text style={styles.resultSubtitle}>{currentAssessment?.title}</Text>
              <View style={styles.scoreBig}>
                <Text style={[styles.scoreBigText, { color: scorePercent >= 60 ? '#10b981' : '#f59e0b' }]}>{scorePercent}%</Text>
                <Text style={styles.scoreDetail}>{score}/{questions.length} correct</Text>
              </View>
              {questions.map((q, i) => (
                <View key={i} style={[styles.reviewItem, { borderLeftColor: answers[i] === q.correctAnswer ? '#10b981' : '#ef4444' }]}>
                  <Text style={styles.reviewQ}>Q{i + 1}: {q.question}</Text>
                  <Text style={styles.reviewA}>Your answer: {q.options[answers[i]]}</Text>
                  {answers[i] !== q.correctAnswer && (
                    <Text style={styles.reviewCorrect}>Correct: {q.options[q.correctAnswer]}</Text>
                  )}
                  <Text style={styles.reviewExpl}>{q.explanation}</Text>
                </View>
              ))}
              <TouchableOpacity style={styles.doneBtn} onPress={() => setShowQuiz(false)}>
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  statsRow: {
    flexDirection: 'row',
    padding: 20,
    marginTop: -20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#6366f1',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#6366f1',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 12,
  },
  viewButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { marginTop: 12, fontSize: 16, color: '#9ca3af' },
  modalContainer: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', flex: 1, marginRight: 12 },
  introContent: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 40 },
  introIcon: { width: 96, height: 96, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  introTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 8, textAlign: 'center' },
  introDesc: { fontSize: 15, color: '#6b7280', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  introStats: { flexDirection: 'row', gap: 24, marginBottom: 24 },
  introStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  introStatText: { fontSize: 14, color: '#6b7280' },
  introNote: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 32, lineHeight: 20, paddingHorizontal: 16 },
  beginBtn: { width: '100%', borderRadius: 14, overflow: 'hidden' },
  beginBtnGrad: { flexDirection: 'row', paddingVertical: 16, alignItems: 'center', justifyContent: 'center', gap: 8 },
  beginBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6b7280', textAlign: 'center' },
  quizContent: { flex: 1, padding: 20 },
  quizProgressBar: { height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, marginBottom: 16, overflow: 'hidden' },
  quizProgressFill: { height: '100%', backgroundColor: '#6366f1', borderRadius: 3 },
  quizCounter: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  quizQuestion: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 24, lineHeight: 26 },
  quizOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 14, marginBottom: 12 },
  optLetter: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  optLetterText: { fontSize: 14, fontWeight: 'bold', color: '#6b7280' },
  optText: { flex: 1, fontSize: 15, color: '#374151' },
  resultsContent: { padding: 20, alignItems: 'center' },
  resultEmoji: { fontSize: 48, marginBottom: 8 },
  resultTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  resultSubtitle: { fontSize: 16, color: '#6b7280', marginBottom: 16 },
  scoreBig: { alignItems: 'center', marginBottom: 24 },
  scoreBigText: { fontSize: 48, fontWeight: 'bold' },
  scoreDetail: { fontSize: 16, color: '#6b7280', marginTop: 4 },
  reviewItem: { width: '100%', backgroundColor: '#f9fafb', padding: 14, borderRadius: 12, marginBottom: 12, borderLeftWidth: 4 },
  reviewQ: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 6 },
  reviewA: { fontSize: 13, color: '#6b7280', marginBottom: 2 },
  reviewCorrect: { fontSize: 13, color: '#10b981', fontWeight: '600', marginBottom: 2 },
  reviewExpl: { fontSize: 12, color: '#9ca3af', marginTop: 4, fontStyle: 'italic' },
  doneBtn: { backgroundColor: '#6366f1', paddingVertical: 14, paddingHorizontal: 48, borderRadius: 12, marginTop: 16 },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
