import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { getCourseRecommendations, searchCourses } from '../../src/store/slices/courseSlice';

const { width } = Dimensions.get('window');

const fallbackCourses = [
  { id: 1, title: 'Complete React Developer', provider: 'TechAcademy', rating: 4.8, students: '12.5k', duration: '40 hours', level: 'Intermediate', price: '$49.99', emoji: '🚀', category: 'Web Development', skills: ['React', 'JavaScript', 'Redux', 'Hooks'], description: 'Master React from beginner to advanced. Build real-world projects with modern React patterns.', url: 'https://www.coursera.org/learn/react' },
  { id: 2, title: 'Data Science with Python', provider: 'DataLearn', rating: 4.9, students: '25k', duration: '60 hours', level: 'Beginner', price: '$59.99', emoji: '📊', category: 'Data Science', skills: ['Python', 'Pandas', 'NumPy', 'Machine Learning'], description: 'Learn data science from scratch with Python, pandas, and machine learning.', url: 'https://www.coursera.org/specializations/jhu-data-science' },
  { id: 3, title: 'UI/UX Design Masterclass', provider: 'DesignHub', rating: 4.7, students: '8k', duration: '30 hours', level: 'Beginner', price: '$39.99', emoji: '🎨', category: 'Design', skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'], description: 'Become a professional UI/UX designer with hands-on Figma projects.', url: 'https://www.coursera.org/professional-certificates/google-ux-design' },
  { id: 4, title: 'Cloud Architecture on AWS', provider: 'CloudMaster', rating: 4.8, students: '15k', duration: '45 hours', level: 'Advanced', price: '$79.99', emoji: '☁️', category: 'Cloud', skills: ['AWS', 'Lambda', 'EC2', 'Terraform'], description: 'Design and deploy scalable cloud solutions on Amazon Web Services.', url: 'https://www.coursera.org/professional-certificates/aws-cloud-solutions-architect' },
  { id: 5, title: 'Machine Learning A-Z', provider: 'AI Academy', rating: 4.9, students: '50k', duration: '80 hours', level: 'Intermediate', price: '$69.99', emoji: '🤖', category: 'Data Science', skills: ['Python', 'TensorFlow', 'Deep Learning', 'NLP'], description: 'Comprehensive machine learning course covering supervised and unsupervised learning.', url: 'https://www.coursera.org/learn/machine-learning' },
  { id: 6, title: 'Full-Stack Web Development', provider: 'CodeCamp', rating: 4.6, students: '30k', duration: '100 hours', level: 'Beginner', price: 'Free', emoji: '💻', category: 'Web Development', skills: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'MongoDB'], description: 'Build complete web applications from front-end to back-end.', url: 'https://www.coursera.org/specializations/full-stack-react' },
];

const categories = ['All', 'Web Development', 'Data Science', 'Design', 'Cloud'];
const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

const emojiList = ['🚀', '📊', '🎨', '☁️', '🤖', '💻', '📚', '🎯', '🔬', '🛠️'];

export default function CoursesScreen() {
  const dispatch = useDispatch<any>();
  const { recommendations, isLoading } = useSelector((state: any) => state.course);
  const [selectedCat, setSelectedCat] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [enrolled, setEnrolled] = useState<number[]>([]);

  useEffect(() => {
    dispatch(getCourseRecommendations());
  }, []);

  // Use backend data if available, otherwise fallback to local mock data
  const allCourses = (recommendations && recommendations.length > 0)
    ? recommendations.map((course: any, i: number) => ({
      id: i + 1,
      title: course.title || 'Course',
      provider: course.provider || 'Online',
      rating: course.rating || 4.5,
      students: course.students ? `${(course.students / 1000).toFixed(1)}k` : 'N/A',
      duration: course.duration || 'Self-paced',
      level: course.difficulty || 'Beginner',
      price: course.price ? `$${course.price}` : 'Free',
      emoji: emojiList[i % emojiList.length],
      category: 'Web Development',
      skills: course.skills || [],
      description: course.description || '',
      url: course.url || '',
    }))
    : fallbackCourses;

  const filtered = allCourses
    .filter((c: any) => selectedCat === 'All' || c.category === selectedCat)
    .filter((c: any) => selectedLevel === 'All Levels' || c.level === selectedLevel);

  const handleEnroll = async (course: any) => {
    if (course.url) {
      try {
        await Linking.openURL(course.url);
      } catch (error) {
        Alert.alert('Error', 'Could not open course link.');
      }
    } else {
      Alert.alert('Info', 'No URL provided for this course.');
    }
    if (!enrolled.includes(course.id)) {
      setEnrolled([...enrolled, course.id]);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#6366f1', '#8b5cf6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <Text style={styles.headerTitle}>Course Marketplace</Text>
        <Text style={styles.headerSubtitle}>Discover courses to advance your career</Text>
      </LinearGradient>

      {/* Category Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {categories.map((cat) => (
          <TouchableOpacity key={cat} style={[styles.filterBtn, selectedCat === cat && styles.filterActive]} onPress={() => setSelectedCat(cat)}>
            <Text style={[styles.filterText, selectedCat === cat && styles.filterActiveText]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Level Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.levelRow} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {levels.map((lvl) => (
          <TouchableOpacity key={lvl} style={[styles.levelBtn, selectedLevel === lvl && styles.levelActive]} onPress={() => setSelectedLevel(lvl)}>
            <Text style={[styles.levelBtnText, selectedLevel === lvl && styles.levelActiveText]}>{lvl}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filtered.map((course) => (
          <View key={course.id} style={styles.card}>
            <TouchableOpacity onPress={() => { setSelectedCourse(course); setShowDetail(true); }} activeOpacity={0.7}>
              <View style={styles.cardTop}>
                <Text style={styles.cardEmoji}>{course.emoji}</Text>
                <View style={styles.priceBadge}>
                  <Text style={styles.priceText}>{course.price}</Text>
                </View>
              </View>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <Text style={styles.provider}>{course.provider}</Text>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}><Ionicons name="star" size={14} color="#f59e0b" /><Text style={styles.infoText}>{course.rating}</Text></View>
                <View style={styles.infoItem}><Ionicons name="people-outline" size={14} color="#6b7280" /><Text style={styles.infoText}>{course.students}</Text></View>
                <View style={styles.infoItem}><Ionicons name="time-outline" size={14} color="#6b7280" /><Text style={styles.infoText}>{course.duration}</Text></View>
              </View>
              <View style={styles.skillTags}>
                {course.skills.slice(0, 3).map((s, i) => (
                  <View key={i} style={styles.skillTag}><Text style={styles.skillTagText}>{s}</Text></View>
                ))}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.enrollBtn, enrolled.includes(course.id) && styles.enrolledBtn]}
              onPress={() => handleEnroll(course)}
              activeOpacity={0.8}
            >
              <Text style={[styles.enrollBtnText, enrolled.includes(course.id) && styles.enrolledBtnText]}>
                {enrolled.includes(course.id) ? '✓ Enrolled' : 'Enroll Now'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
        {filtered.length === 0 && (
          <View style={styles.emptyState}><Ionicons name="search-outline" size={48} color="#d1d5db" /><Text style={styles.emptyText}>No courses match your filters</Text></View>
        )}
      </ScrollView>

      {/* Course Detail Modal */}
      <Modal visible={showDetail} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle} numberOfLines={1}>Course Details</Text>
            <TouchableOpacity onPress={() => setShowDetail(false)}>
              <Ionicons name="close" size={28} color="#111827" />
            </TouchableOpacity>
          </View>
          {selectedCourse && (
            <ScrollView contentContainerStyle={styles.detailContent}>
              <Text style={styles.detailEmoji}>{selectedCourse.emoji}</Text>
              <Text style={styles.detailTitle}>{selectedCourse.title}</Text>
              <Text style={styles.detailProvider}>by {selectedCourse.provider}</Text>
              <View style={styles.detailStats}>
                <View style={styles.detailStat}><Ionicons name="star" size={18} color="#f59e0b" /><Text style={styles.detailStatText}>{selectedCourse.rating}</Text></View>
                <View style={styles.detailStat}><Ionicons name="people" size={18} color="#6366f1" /><Text style={styles.detailStatText}>{selectedCourse.students}</Text></View>
                <View style={styles.detailStat}><Ionicons name="time" size={18} color="#10b981" /><Text style={styles.detailStatText}>{selectedCourse.duration}</Text></View>
              </View>
              <View style={styles.detailPriceRow}>
                <Text style={styles.detailPrice}>{selectedCourse.price}</Text>
                <View style={styles.detailLevelBadge}><Text style={styles.detailLevelText}>{selectedCourse.level}</Text></View>
              </View>
              <Text style={styles.detailDesc}>{selectedCourse.description}</Text>
              <Text style={styles.detailSectionTitle}>Skills You'll Learn</Text>
              <View style={styles.detailSkills}>
                {selectedCourse.skills.map((s: string, i: number) => (
                  <View key={i} style={styles.detailSkillChip}><Text style={styles.detailSkillText}>{s}</Text></View>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.enrollBigBtn, enrolled.includes(selectedCourse.id) && styles.enrolledBigBtn]}
                onPress={() => { handleEnroll(selectedCourse); setShowDetail(false); }}
              >
                <Text style={styles.enrollBigBtnText}>{enrolled.includes(selectedCourse.id) ? '✓ Already Enrolled' : 'Enroll Now'}</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  headerSubtitle: { fontSize: 16, color: '#e0e7ff' },
  filterRow: { marginTop: -10, marginBottom: 6, flexGrow: 0, maxHeight: 50 },
  filterBtn: { backgroundColor: '#fff', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#e5e7eb', height: 40, justifyContent: 'center' as const },
  filterActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  filterActiveText: { color: '#fff' },
  levelRow: { marginBottom: 8, flexGrow: 0, maxHeight: 44 },
  levelBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, marginRight: 10, backgroundColor: '#f3f4f6', height: 36, justifyContent: 'center' as const },
  levelActive: { backgroundColor: '#eef2ff' },
  levelBtnText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  levelActiveText: { color: '#6366f1' },
  content: { flex: 1, paddingHorizontal: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardEmoji: { fontSize: 36 },
  priceBadge: { backgroundColor: '#10b98120', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  priceText: { fontSize: 14, fontWeight: 'bold', color: '#10b981' },
  courseTitle: { fontSize: 17, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  provider: { fontSize: 13, color: '#6b7280', marginBottom: 10 },
  infoRow: { flexDirection: 'row', marginBottom: 10 },
  infoItem: { flexDirection: 'row', alignItems: 'center', marginRight: 14 },
  infoText: { fontSize: 12, color: '#6b7280', marginLeft: 4 },
  skillTags: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  skillTag: { backgroundColor: '#eef2ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginRight: 6, marginBottom: 4 },
  skillTagText: { fontSize: 11, color: '#6366f1', fontWeight: '600' },
  enrollBtn: { backgroundColor: '#6366f1', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  enrollBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  enrolledBtn: { backgroundColor: '#f3f4f6' },
  enrolledBtnText: { color: '#10b981' },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { marginTop: 12, fontSize: 16, color: '#9ca3af' },
  modalContainer: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', flex: 1 },
  detailContent: { alignItems: 'center', padding: 24 },
  detailEmoji: { fontSize: 56, marginBottom: 12 },
  detailTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 4 },
  detailProvider: { fontSize: 15, color: '#6b7280', marginBottom: 16 },
  detailStats: { flexDirection: 'row', gap: 20, marginBottom: 16 },
  detailStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailStatText: { fontSize: 15, fontWeight: '600', color: '#111827' },
  detailPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  detailPrice: { fontSize: 28, fontWeight: 'bold', color: '#10b981' },
  detailLevelBadge: { backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  detailLevelText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  detailDesc: { fontSize: 15, color: '#6b7280', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  detailSectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', alignSelf: 'flex-start', marginBottom: 12 },
  detailSkills: { flexDirection: 'row', flexWrap: 'wrap', width: '100%', marginBottom: 24 },
  detailSkillChip: { backgroundColor: '#eef2ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginRight: 8, marginBottom: 8 },
  detailSkillText: { fontSize: 13, color: '#6366f1', fontWeight: '600' },
  enrollBigBtn: { backgroundColor: '#6366f1', paddingVertical: 16, paddingHorizontal: 48, borderRadius: 14, width: '100%', alignItems: 'center' },
  enrolledBigBtn: { backgroundColor: '#10b981' },
  enrollBigBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
