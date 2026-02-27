import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const coursesDB: Record<string, Record<string, any[]>> = {
  'ai-ml': {
    coursera: [
      { id: 1, title: 'Machine Learning by Andrew Ng', provider: 'Stanford / Coursera', rating: 4.9, students: '4.8M', duration: '11 weeks', level: 'Beginner', price: 'Free Audit', skills: ['Python', 'ML Algorithms', 'Regression'], description: 'Comprehensive intro to machine learning, data mining, and statistical pattern recognition.', url: 'https://www.coursera.org/learn/machine-learning' },
      { id: 2, title: 'Deep Learning Specialization', provider: 'deeplearning.ai / Coursera', rating: 4.8, students: '850K', duration: '4 months', level: 'Intermediate', price: '₹3,500/mo', skills: ['Neural Networks', 'TensorFlow', 'CNN', 'RNN'], description: 'Master deep learning from neural networks to convolutional networks.', url: 'https://www.coursera.org/specializations/deep-learning' },
      { id: 3, title: 'AI For Everyone', provider: 'deeplearning.ai / Coursera', rating: 4.7, students: '1.2M', duration: '6 hours', level: 'Beginner', price: 'Free Audit', skills: ['AI Concepts', 'Strategy'], description: 'Non-technical course to understand the impact of AI on your business.', url: 'https://www.coursera.org/learn/ai-for-everyone' },
    ],
    nptel: [
      { id: 4, title: 'Intro to Machine Learning', provider: 'IIT Kharagpur / NPTEL', rating: 4.7, students: '50K', duration: '12 weeks', level: 'Intermediate', price: 'Free', skills: ['ML', 'Pattern Recognition', 'Statistics'], description: 'Comprehensive ML course by IIT Kharagpur faculty.', url: 'https://nptel.ac.in/courses/106105152' },
      { id: 5, title: 'Deep Learning', provider: 'IIT Madras / NPTEL', rating: 4.6, students: '35K', duration: '12 weeks', level: 'Advanced', price: 'Free', skills: ['Deep Learning', 'Neural Nets', 'PyTorch'], description: 'Deep understanding of neural network architectures.', url: 'https://nptel.ac.in/courses/106106184' },
    ],
    swayam: [
      { id: 6, title: 'Artificial Intelligence: Search Methods', provider: 'IIT Bombay / Swayam', rating: 4.5, students: '18K', duration: '8 weeks', level: 'Intermediate', price: 'Free', skills: ['Search Algorithms', 'Optimization'], description: 'AI search methods for problem-solving.', url: 'https://swayam.gov.in/nd1_noc19_cs47' },
    ],
  },
  'data-science': {
    coursera: [
      { id: 7, title: 'Data Science Specialization', provider: 'Johns Hopkins / Coursera', rating: 4.7, students: '1.5M', duration: '6 months', level: 'Beginner', price: 'Free Audit', skills: ['R', 'Statistics', 'Data Analysis'], description: 'Master data science from scratch with R programming.', url: 'https://www.coursera.org/specializations/jhu-data-science' },
      { id: 8, title: 'Applied Data Science with Python', provider: 'U of Michigan / Coursera', rating: 4.8, students: '900K', duration: '4 months', level: 'Intermediate', price: '₹3,500/mo', skills: ['Python', 'Pandas', 'ML'], description: 'Applied data science for real-world problems.', url: 'https://www.coursera.org/specializations/data-science-python' },
    ],
    nptel: [
      { id: 9, title: 'Data Science for Engineers', provider: 'IIT Madras / NPTEL', rating: 4.6, students: '40K', duration: '12 weeks', level: 'Intermediate', price: 'Free', skills: ['Python', 'Statistics', 'Data Handling'], description: 'Data science techniques for engineering applications.', url: 'https://nptel.ac.in/courses/106106177' },
    ],
    swayam: [
      { id: 10, title: 'Intro to Data Analytics', provider: 'IGNOU / Swayam', rating: 4.5, students: '10K', duration: '8 weeks', level: 'Beginner', price: 'Free', skills: ['Analytics', 'Excel', 'Basics'], description: 'Foundational data analytics concepts.', url: 'https://swayam.gov.in' },
    ],
  },
  'fullstack': {
    coursera: [
      { id: 11, title: 'Full-Stack Web Dev with React', provider: 'HKUST / Coursera', rating: 4.7, students: '250K', duration: '4 months', level: 'Intermediate', price: '₹3,500/mo', skills: ['React', 'Node.js', 'MongoDB'], description: 'Complete full-stack web development training.', url: 'https://www.coursera.org/specializations/full-stack-react' },
      { id: 12, title: 'Web Applications for Everybody', provider: 'U of Michigan / Coursera', rating: 4.8, students: '1.1M', duration: '6 months', level: 'Beginner', price: 'Free Audit', skills: ['HTML', 'CSS', 'PHP', 'SQL'], description: 'Build web apps from scratch.', url: 'https://www.coursera.org/specializations/web-applications' },
    ],
    nptel: [
      { id: 13, title: 'Data Structures & Algorithms', provider: 'IIT Delhi / NPTEL', rating: 4.8, students: '60K', duration: '12 weeks', level: 'Intermediate', price: 'Free', skills: ['DSA', 'C++', 'Algorithms'], description: 'Core DSA concepts for software engineers.', url: 'https://nptel.ac.in/courses/106102064' },
    ],
    swayam: [
      { id: 14, title: 'Web Development', provider: 'IIT Bombay / Swayam', rating: 4.5, students: '12K', duration: '10 weeks', level: 'Beginner', price: 'Free', skills: ['HTML', 'CSS', 'JS'], description: 'Comprehensive web development fundamentals.', url: 'https://swayam.gov.in' },
    ],
  },
  'cybersecurity': {
    coursera: [
      { id: 15, title: 'Google Cybersecurity Certificate', provider: 'Google / Coursera', rating: 4.8, students: '500K', duration: '6 months', level: 'Beginner', price: 'Free (7 day trial)', skills: ['Linux', 'SIEM', 'Python'], description: 'Google\'s professional cybersecurity certificate.', url: 'https://www.coursera.org/professional-certificates/google-cybersecurity' },
    ],
    nptel: [
      { id: 16, title: 'Network Security', provider: 'IIT Kharagpur / NPTEL', rating: 4.5, students: '25K', duration: '12 weeks', level: 'Intermediate', price: 'Free', skills: ['Cryptography', 'Protocols'], description: 'Network security fundamentals from IIT.', url: 'https://nptel.ac.in/courses/106105031' },
    ],
    swayam: [
      { id: 17, title: 'Cyber Security Fundamentals', provider: 'IGNOU / Swayam', rating: 4.4, students: '8K', duration: '8 weeks', level: 'Beginner', price: 'Free', skills: ['Basics', 'Threats', 'Prevention'], description: 'Fundamentals of cyber security.', url: 'https://swayam.gov.in' },
    ],
  },
};

const jobsDB: Record<string, any[]> = {
  'ai-ml': [
    { title: 'ML Engineer', company: 'Google India', type: 'Full-time', salary: '₹12-22 LPA', skills: ['Python', 'TensorFlow', 'MLOps'] },
    { title: 'AI Research Intern', company: 'Microsoft Research', type: 'Internship', salary: '₹60K/month', skills: ['Deep Learning', 'Python'] },
    { title: 'Data Scientist', company: 'Flipkart', type: 'Full-time', salary: '₹10-18 LPA', skills: ['ML', 'SQL', 'Python'] },
  ],
  'data-science': [
    { title: 'Data Analyst', company: 'Swiggy', type: 'Full-time', salary: '₹6-10 LPA', skills: ['SQL', 'Python', 'Tableau'] },
    { title: 'Analytics Intern', company: 'Zomato', type: 'Internship', salary: '₹30K/month', skills: ['Data Analysis', 'Excel'] },
    { title: 'Business Analyst', company: 'Deloitte', type: 'Full-time', salary: '₹8-14 LPA', skills: ['Statistics', 'Python'] },
  ],
  'fullstack': [
    { title: 'Frontend Developer', company: 'Razorpay', type: 'Full-time', salary: '₹8-14 LPA', skills: ['React', 'TypeScript'] },
    { title: 'Full Stack Intern', company: 'PhonePe', type: 'Internship', salary: '₹40K/month', skills: ['React', 'Node.js'] },
    { title: 'Backend Developer', company: 'Zerodha', type: 'Full-time', salary: '₹10-18 LPA', skills: ['Node.js', 'PostgreSQL'] },
  ],
  'cybersecurity': [
    { title: 'Security Analyst', company: 'TCS', type: 'Full-time', salary: '₹6-12 LPA', skills: ['SIEM', 'Network Security'] },
    { title: 'SOC Analyst Intern', company: 'Wipro', type: 'Internship', salary: '₹25K/month', skills: ['Incident Response'] },
    { title: 'Security Engineer', company: 'Paytm', type: 'Full-time', salary: '₹10-16 LPA', skills: ['Pen Testing', 'Linux'] },
  ],
};

const platforms = ['all', 'coursera', 'nptel', 'swayam'];

export default function CourseRecommendationsScreen() {
  const router = useRouter();
  const [pathId, setPathId] = useState('fullstack');
  const [activePlatform, setActivePlatform] = useState('all');
  const [activeTab, setActiveTab] = useState<'courses' | 'jobs'>('courses');
  const [savedCourses, setSavedCourses] = useState<number[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      const roadmapRaw = await AsyncStorage.getItem('careerRoadmap');
      if (roadmapRaw) {
        const roadmap = JSON.parse(roadmapRaw);
        setPathId(roadmap.careerPath?.id || 'fullstack');
      }
    })();
  }, []);

  const allCourses = coursesDB[pathId] || coursesDB['fullstack'];
  const filteredCourses = activePlatform === 'all'
    ? Object.values(allCourses).flat()
    : allCourses[activePlatform] || [];
  const searchedCourses = search
    ? filteredCourses.filter((c: any) => c.title.toLowerCase().includes(search.toLowerCase()) || c.skills.some((s: string) => s.toLowerCase().includes(search.toLowerCase())))
    : filteredCourses;
  const jobs = jobsDB[pathId] || jobsDB['fullstack'];

  const toggleSave = (id: number) => {
    setSavedCourses(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleContinue = async () => {
    await AsyncStorage.setItem('savedCourses', JSON.stringify(savedCourses));
    await AsyncStorage.setItem('courseRecommendations', JSON.stringify({
      pathId, savedCourses,
      courses: searchedCourses.filter((c: any) => savedCourses.includes(c.id)),
      viewedAt: new Date().toISOString(),
    }));
    router.push('/setup/career-simulation');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>📚 Course Recommendations</Text>
        <Text style={styles.subtitle}>Curated courses for your career path</Text>

        {/* Tab Switcher */}
        <View style={styles.tabRow}>
          <TouchableOpacity style={[styles.tab, activeTab === 'courses' && styles.tabActive]}
            onPress={() => setActiveTab('courses')}>
            <Text style={[styles.tabText, activeTab === 'courses' && styles.tabTextActive]}>Courses</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'jobs' && styles.tabActive]}
            onPress={() => setActiveTab('jobs')}>
            <Text style={[styles.tabText, activeTab === 'jobs' && styles.tabTextActive]}>Job Opportunities</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'courses' ? (
          <>
            {/* Search */}
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color="#9ca3af" />
              <TextInput style={styles.searchInput} placeholder="Search courses or skills..."
                placeholderTextColor="#9ca3af" value={search} onChangeText={setSearch} />
            </View>

            {/* Platform Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {platforms.map(p => (
                <TouchableOpacity key={p} style={[styles.filterChip, activePlatform === p && styles.filterChipActive]}
                  onPress={() => setActivePlatform(p)}>
                  <Text style={[styles.filterChipText, activePlatform === p && styles.filterChipTextActive]}>
                    {p === 'all' ? '🌐 All' : p === 'coursera' ? '🎓 Coursera' : p === 'nptel' ? '📘 NPTEL' : '🇮🇳 Swayam'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.count}>{searchedCourses.length} courses found</Text>

            {/* Course Cards */}
            {searchedCourses.map((course: any) => {
              const isSaved = savedCourses.includes(course.id);
              return (
                <View key={course.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{course.title}</Text>
                      <Text style={styles.cardProvider}>{course.provider}</Text>
                    </View>
                    <TouchableOpacity onPress={() => toggleSave(course.id)}>
                      <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={24}
                        color={isSaved ? '#6366f1' : '#9ca3af'} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.cardDesc}>{course.description}</Text>
                  <View style={styles.chipContainer}>
                    {course.skills.map((s: string, i: number) => (
                      <View key={i} style={styles.chip}><Text style={styles.chipText}>{s}</Text></View>
                    ))}
                  </View>
                  <View style={styles.cardMeta}>
                    <Text style={styles.metaItem}>⭐ {course.rating}</Text>
                    <Text style={styles.metaItem}>👥 {course.students}</Text>
                    <Text style={styles.metaItem}>⏱️ {course.duration}</Text>
                    <Text style={styles.metaItem}>📊 {course.level}</Text>
                  </View>
                  <View style={styles.cardFooter}>
                    <Text style={styles.price}>{course.price}</Text>
                    <TouchableOpacity style={styles.enrollBtn} onPress={() => { if (course.url) Linking.openURL(course.url); }}>
                      <Text style={styles.enrollBtnText}>Enroll Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>🎯 Matching Opportunities</Text>
            {jobs.map((job: any, i: number) => (
              <View key={i} style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <View style={[styles.typeBadge, job.type === 'Internship' ? { backgroundColor: '#dbeafe' } : { backgroundColor: '#dcfce7' }]}>
                    <Text style={[styles.typeBadgeText, job.type === 'Internship' ? { color: '#2563eb' } : { color: '#059669' }]}>{job.type}</Text>
                  </View>
                </View>
                <Text style={styles.jobCompany}>{job.company}</Text>
                <Text style={styles.jobSalary}>💰 {job.salary}</Text>
                <View style={styles.chipContainer}>
                  {job.skills.map((s: string, idx: number) => (
                    <View key={idx} style={styles.chip}><Text style={styles.chipText}>{s}</Text></View>
                  ))}
                </View>
                <TouchableOpacity style={styles.applyBtn}>
                  <Text style={styles.applyBtnText}>Apply Now</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* Continue */}
        <TouchableOpacity style={styles.primaryBtn} onPress={handleContinue}>
          <Text style={styles.primaryBtnText}>Continue to Simulations →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipBtn} onPress={() => router.push('/setup/career-simulation')}>
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
  tabRow: { flexDirection: 'row', backgroundColor: '#e5e7eb', borderRadius: 12, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '500', color: '#6b7280' },
  tabTextActive: { color: '#6366f1', fontWeight: '600' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 12 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#111827' },
  filterScroll: { marginBottom: 12 },
  filterChip: { backgroundColor: '#f3f4f6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  filterChipActive: { backgroundColor: '#6366f1' },
  filterChipText: { fontSize: 13, fontWeight: '500', color: '#374151' },
  filterChipTextActive: { color: '#fff' },
  count: { fontSize: 13, color: '#6b7280', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  cardProvider: { fontSize: 12, color: '#6366f1', marginTop: 2 },
  cardDesc: { fontSize: 13, color: '#6b7280', lineHeight: 18, marginBottom: 10 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  chip: { backgroundColor: '#eef2ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  chipText: { fontSize: 11, fontWeight: '500', color: '#6366f1' },
  cardMeta: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  metaItem: { fontSize: 12, color: '#6b7280' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 14, fontWeight: '700', color: '#059669' },
  enrollBtn: { backgroundColor: '#6366f1', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  enrollBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
  jobCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  jobTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  typeBadgeText: { fontSize: 11, fontWeight: '600' },
  jobCompany: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  jobSalary: { fontSize: 14, fontWeight: '600', color: '#059669', marginBottom: 8 },
  applyBtn: { backgroundColor: '#10b981', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  applyBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  primaryBtn: { backgroundColor: '#6366f1', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 20 },
  primaryBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
  skipBtn: { paddingVertical: 12, alignItems: 'center' },
  skipBtnText: { fontSize: 14, color: '#6b7280' },
});
