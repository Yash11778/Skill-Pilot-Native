import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { getCareerRecommendations, getJobMatches } from '../../src/store/slices/careerSlice';

const { width } = Dimensions.get('window');

const fallbackCareers = [
  { id: 1, title: 'Software Engineer', match: 95, salary: '$80k-$150k', growth: '+22%', icon: 'code-slash', color: '#6366f1', category: 'Technology', description: 'Design, develop, and maintain software applications. Work with cutting-edge technologies.', skills: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL'], companies: ['Google', 'Microsoft', 'Amazon', 'Meta'] },
  { id: 2, title: 'Data Scientist', match: 88, salary: '$90k-$180k', growth: '+31%', icon: 'analytics', color: '#8b5cf6', category: 'Technology', description: 'Analyze complex datasets to extract insights and build predictive models.', skills: ['Python', 'R', 'Machine Learning', 'SQL', 'Statistics'], companies: ['Netflix', 'Spotify', 'Uber', 'Airbnb'] },
  { id: 3, title: 'Product Manager', match: 82, salary: '$100k-$200k', growth: '+14%', icon: 'briefcase', color: '#10b981', category: 'Business', description: 'Lead product strategy, roadmap, and cross-functional teams.', skills: ['Strategy', 'Analytics', 'Communication', 'Agile', 'UX'], companies: ['Apple', 'Google', 'Salesforce', 'Stripe'] },
  { id: 4, title: 'UX Designer', match: 78, salary: '$70k-$130k', growth: '+18%', icon: 'color-palette', color: '#f59e0b', category: 'Design', description: 'Create intuitive and beautiful user experiences for digital products.', skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'], companies: ['Apple', 'Airbnb', 'Figma', 'Adobe'] },
  { id: 5, title: 'Cybersecurity Analyst', match: 75, salary: '$85k-$155k', growth: '+33%', icon: 'shield-checkmark', color: '#ef4444', category: 'Technology', description: 'Protect organizations from cyber threats and security breaches.', skills: ['Network Security', 'Ethical Hacking', 'SIEM', 'Risk Assessment'], companies: ['CrowdStrike', 'Palo Alto', 'IBM', 'Deloitte'] },
  { id: 6, title: 'Cloud Architect', match: 85, salary: '$120k-$200k', growth: '+25%', icon: 'cloud', color: '#06b6d4', category: 'Technology', description: 'Design and manage cloud infrastructure and services.', skills: ['AWS', 'Azure', 'Kubernetes', 'Terraform', 'DevOps'], companies: ['AWS', 'Microsoft', 'Google Cloud', 'HashiCorp'] },
  { id: 7, title: 'Marketing Manager', match: 68, salary: '$65k-$130k', growth: '+10%', icon: 'megaphone', color: '#ec4899', category: 'Business', description: 'Develop and execute marketing strategies to drive growth.', skills: ['Digital Marketing', 'Analytics', 'Content Strategy', 'SEO'], companies: ['HubSpot', 'Coca-Cola', 'Nike', 'P&G'] },
  { id: 8, title: 'AI/ML Engineer', match: 90, salary: '$110k-$220k', growth: '+40%', icon: 'hardware-chip', color: '#7c3aed', category: 'Technology', description: 'Build and deploy artificial intelligence and machine learning systems.', skills: ['Python', 'TensorFlow', 'PyTorch', 'NLP', 'Deep Learning'], companies: ['OpenAI', 'DeepMind', 'NVIDIA', 'Tesla'] },
  { id: 9, title: 'Financial Analyst', match: 65, salary: '$60k-$120k', growth: '+8%', icon: 'trending-up', color: '#059669', category: 'Finance', description: 'Analyze financial data and provide investment recommendations.', skills: ['Financial Modeling', 'Excel', 'SQL', 'Risk Analysis'], companies: ['Goldman Sachs', 'JP Morgan', 'Morgan Stanley'] },
  { id: 10, title: 'DevOps Engineer', match: 80, salary: '$95k-$170k', growth: '+21%', icon: 'git-branch', color: '#f97316', category: 'Technology', description: 'Automate and streamline software development and deployment.', skills: ['Docker', 'CI/CD', 'Linux', 'Kubernetes', 'AWS'], companies: ['Netflix', 'Spotify', 'GitLab', 'Atlassian'] },
];

const categories = ['All', 'Technology', 'Business', 'Design', 'Finance'];

const iconColors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#7c3aed', '#059669', '#f97316'];

export default function CareersScreen() {
  const dispatch = useDispatch<any>();
  const { recommendations, jobMatches, isLoading } = useSelector((state: any) => state.career);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCareer, setSelectedCareer] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    dispatch(getCareerRecommendations());
    dispatch(getJobMatches());
  }, []);

  // Use backend data if available, otherwise fallback to local mock data
  const allCareers = (recommendations && recommendations.length > 0)
    ? recommendations.map((rec: any, i: number) => ({
      id: i + 1,
      title: rec.jobTitle || rec.title || 'Career',
      match: rec.matchScore || 0,
      salary: rec.salaryRange ? `$${(rec.salaryRange.min / 1000).toFixed(0)}k-$${(rec.salaryRange.max / 1000).toFixed(0)}k` : 'N/A',
      growth: rec.growth || 'N/A',
      icon: 'briefcase',
      color: iconColors[i % iconColors.length],
      category: 'Technology',
      description: rec.reasons?.join('. ') || '',
      skills: rec.skillGaps || [],
      companies: [],
    }))
    : fallbackCareers;

  const filtered = selectedCategory === 'All' ? allCareers : allCareers.filter((c: any) => c.category === selectedCategory);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#6366f1', '#8b5cf6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <Text style={styles.headerTitle}>Career Paths</Text>
        <Text style={styles.headerSubtitle}>Explore careers matched to your skills</Text>
      </LinearGradient>

      {/* Category Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {categories.map((cat) => (
          <TouchableOpacity key={cat} style={[styles.filterBtn, selectedCategory === cat && styles.filterBtnActive]} onPress={() => setSelectedCategory(cat)}>
            <Text style={[styles.filterText, selectedCategory === cat && styles.filterTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filtered.map((career) => (
          <TouchableOpacity key={career.id} style={styles.card} onPress={() => { setSelectedCareer(career); setShowDetail(true); }}>
            <View style={[styles.iconContainer, { backgroundColor: career.color + '20' }]}>
              <Ionicons name={career.icon as any} size={32} color={career.color} />
            </View>
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{career.title}</Text>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchText}>{career.match}%</Text>
                </View>
              </View>
              <Text style={styles.cardDesc} numberOfLines={2}>{career.description}</Text>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Ionicons name="cash-outline" size={16} color="#6b7280" />
                  <Text style={styles.infoText}>{career.salary}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="trending-up-outline" size={16} color="#10b981" />
                  <Text style={[styles.infoText, { color: '#10b981' }]}>{career.growth}</Text>
                </View>
              </View>
              <View style={styles.skillRow}>
                {career.skills.slice(0, 3).map((s, i) => (
                  <View key={i} style={styles.skillChip}><Text style={styles.skillChipText}>{s}</Text></View>
                ))}
                {career.skills.length > 3 && <Text style={styles.moreSkills}>+{career.skills.length - 3}</Text>}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Career Detail Modal */}
      <Modal visible={showDetail} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeaderBar}>
            <TouchableOpacity onPress={() => setShowDetail(false)}>
              <Ionicons name="close" size={28} color="#111827" />
            </TouchableOpacity>
          </View>
          {selectedCareer && (
            <ScrollView contentContainerStyle={styles.detailContent}>
              <View style={[styles.detailIcon, { backgroundColor: selectedCareer.color + '20' }]}>
                <Ionicons name={selectedCareer.icon} size={48} color={selectedCareer.color} />
              </View>
              <Text style={styles.detailTitle}>{selectedCareer.title}</Text>
              <View style={styles.detailMatchBadge}>
                <Text style={styles.detailMatchText}>{selectedCareer.match}% Match</Text>
              </View>
              <Text style={styles.detailDesc}>{selectedCareer.description}</Text>

              <View style={styles.detailStatsRow}>
                <View style={styles.detailStatBox}>
                  <Ionicons name="cash-outline" size={22} color="#6366f1" />
                  <Text style={styles.detailStatLabel}>Salary Range</Text>
                  <Text style={styles.detailStatValue}>{selectedCareer.salary}</Text>
                </View>
                <View style={styles.detailStatBox}>
                  <Ionicons name="trending-up-outline" size={22} color="#10b981" />
                  <Text style={styles.detailStatLabel}>Job Growth</Text>
                  <Text style={styles.detailStatValue}>{selectedCareer.growth}</Text>
                </View>
              </View>

              <Text style={styles.detailSectionTitle}>Required Skills</Text>
              <View style={styles.detailSkills}>
                {selectedCareer.skills.map((s: string, i: number) => (
                  <View key={i} style={styles.detailSkillChip}><Text style={styles.detailSkillText}>{s}</Text></View>
                ))}
              </View>

              <Text style={styles.detailSectionTitle}>Top Companies</Text>
              <View style={styles.companiesRow}>
                {selectedCareer.companies?.map((c: string, i: number) => (
                  <View key={i} style={styles.companyChip}>
                    <Ionicons name="business-outline" size={14} color="#6b7280" />
                    <Text style={styles.companyText}>{c}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={() => { Alert.alert('Saved!', `${selectedCareer.title} has been saved to your career paths.`); setShowDetail(false); }}>
                <Ionicons name="bookmark-outline" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>Save Career Path</Text>
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
  filters: { marginTop: -10, marginBottom: 8, flexGrow: 0, maxHeight: 50 },
  filterBtn: { backgroundColor: '#fff', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#e5e7eb', height: 40, justifyContent: 'center' as const },
  filterBtnActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  filterText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  filterTextActive: { color: '#fff' },
  content: { flex: 1, padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  iconContainer: { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  cardContent: { flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#111827', flex: 1 },
  cardDesc: { fontSize: 13, color: '#6b7280', marginBottom: 10, lineHeight: 18 },
  matchBadge: { backgroundColor: '#10b98120', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  matchText: { fontSize: 13, fontWeight: 'bold', color: '#10b981' },
  infoRow: { flexDirection: 'row', marginBottom: 10 },
  infoItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  infoText: { fontSize: 13, color: '#6b7280', marginLeft: 4 },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  skillChip: { backgroundColor: '#eef2ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginRight: 6, marginBottom: 4 },
  skillChipText: { fontSize: 11, color: '#6366f1', fontWeight: '600' },
  moreSkills: { fontSize: 12, color: '#9ca3af', fontWeight: '500' },
  modalContainer: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  modalHeaderBar: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, paddingBottom: 10 },
  detailContent: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 40 },
  detailIcon: { width: 80, height: 80, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  detailTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  detailMatchBadge: { backgroundColor: '#10b98120', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 14, marginBottom: 16 },
  detailMatchText: { fontSize: 16, fontWeight: 'bold', color: '#10b981' },
  detailDesc: { fontSize: 15, color: '#6b7280', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  detailStatsRow: { flexDirection: 'row', width: '100%', gap: 12, marginBottom: 24 },
  detailStatBox: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 14, padding: 16, alignItems: 'center' },
  detailStatLabel: { fontSize: 12, color: '#6b7280', marginTop: 6 },
  detailStatValue: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginTop: 4 },
  detailSectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', alignSelf: 'flex-start', marginBottom: 12 },
  detailSkills: { flexDirection: 'row', flexWrap: 'wrap', width: '100%', marginBottom: 24 },
  detailSkillChip: { backgroundColor: '#eef2ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginRight: 8, marginBottom: 8 },
  detailSkillText: { fontSize: 13, color: '#6366f1', fontWeight: '600' },
  companiesRow: { flexDirection: 'row', flexWrap: 'wrap', width: '100%', marginBottom: 24 },
  companyChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginRight: 8, marginBottom: 8, gap: 6 },
  companyText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  saveBtn: { flexDirection: 'row', backgroundColor: '#6366f1', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, alignItems: 'center', gap: 8, marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
