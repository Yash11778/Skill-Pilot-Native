import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { getMentors, sendMentorRequest, getConnections } from '../../src/store/slices/mentorSlice';

const { width } = Dimensions.get('window');

const fallbackMentors = [
  {
    id: 1,
    name: 'Yash Dharme',
    title: 'Senior Software Engineer',
    company: 'Google',
    rating: 4.9,
    sessions: 127,
    specialty: 'software-development',
    expertise: ['software-development', 'product-management'],
    skills: ['React', 'Node.js', 'System Design', 'Career Development'],
    bio: 'Experienced software engineer with 8+ years at top tech companies. Passionate about helping junior developers grow their careers.',
    availability: 'Available',
    languages: ['English', 'Hindi'],
    experience: '8+ years',
    responseTime: '< 2 hours',
    education: 'MS Computer Science, Stanford',
    pricePerSession: 120,
    avatar: '👨‍💻',
    color: '#6366f1',
  },
  {
    id: 2,
    name: 'Maithili Dorkhande',
    title: 'Data Science Manager',
    company: 'Netflix',
    rating: 4.8,
    sessions: 89,
    specialty: 'data-science',
    expertise: ['data-science'],
    skills: ['Python', 'Machine Learning', 'Statistics', 'Team Leadership'],
    bio: 'Data science leader specializing in machine learning and analytics. Helped 50+ professionals transition into data science.',
    availability: 'Busy',
    languages: ['English', 'Hindi', 'Marathi'],
    experience: '10+ years',
    responseTime: '< 4 hours',
    education: 'PhD Data Science, MIT',
    pricePerSession: 150,
    avatar: '👩‍🔬',
    color: '#8b5cf6',
  },
  {
    id: 3,
    name: 'Harkirat Singh',
    title: 'Lead UX Designer',
    company: 'Apple',
    rating: 4.9,
    sessions: 156,
    specialty: 'design',
    expertise: ['design'],
    skills: ['Figma', 'User Research', 'Design Systems', 'Prototyping'],
    bio: 'Award-winning UX designer with a passion for creating intuitive user experiences. Mentor to designers worldwide.',
    availability: 'Available',
    languages: ['English', 'Hindi', 'Punjabi'],
    experience: '7+ years',
    responseTime: '< 1 hour',
    education: 'BFA Design, RISD',
    pricePerSession: 100,
    avatar: '👨‍🎨',
    color: '#10b981',
  },
];

const expertiseAreas = [
  { id: 'all', name: 'All Areas' },
  { id: 'software-development', name: 'Software Dev' },
  { id: 'data-science', name: 'Data Science' },
  { id: 'design', name: 'UI/UX Design' },
];

const getAvailabilityStyle = (availability: string) => {
  switch (availability) {
    case 'Available':
      return { bg: '#dcfce7', text: '#16a34a' };
    case 'Busy':
      return { bg: '#fef9c3', text: '#ca8a04' };
    default:
      return { bg: '#f3f4f6', text: '#6b7280' };
  }
};

const mentorColors = ['#6366f1', '#8b5cf6', '#10b981'];
const mentorAvatars = ['👨‍💻', '👩‍🔬', '👨‍🎨'];

export default function MentorshipScreen() {
  const dispatch = useDispatch<any>();
  const { mentors: backendMentors, connections, isLoading } = useSelector((state: any) => state.mentor);
  const [activeTab, setActiveTab] = useState('find');
  const [selectedExpertise, setSelectedExpertise] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [myMentors, setMyMentors] = useState<number[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [messagedMentors, setMessagedMentors] = useState<any[]>([]);

  useEffect(() => {
    dispatch(getMentors({}));
    dispatch(getConnections());
  }, []);

  // Use backend data if available, otherwise fallback
  const allMentors = (backendMentors && backendMentors.length > 0)
    ? backendMentors.map((m: any, i: number) => ({
      id: m._id || i + 1,
      name: `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'Mentor',
      title: m.currentRole || 'Professional',
      company: '',
      rating: 4.8,
      sessions: 0,
      specialty: m.skills?.[0]?.name?.toLowerCase() || 'general',
      expertise: m.skills?.map((s: any) => s.name?.toLowerCase()) || [],
      skills: m.skills?.map((s: any) => s.name) || [],
      bio: '',
      availability: 'Available',
      languages: ['English'],
      experience: `${m.experience?.length || 0}+ years`,
      responseTime: '< 4 hours',
      education: '',
      pricePerSession: 0,
      avatar: mentorAvatars[i % mentorAvatars.length],
      color: mentorColors[i % mentorColors.length],
    }))
    : fallbackMentors;

  const filtered =
    selectedExpertise === 'all'
      ? allMentors
      : allMentors.filter((m: any) => m.expertise.includes(selectedExpertise));

  const handleBookSession = (mentorId: any) => {
    // Try to send a real mentor request if it's a backend mentor
    if (typeof mentorId === 'string') {
      dispatch(sendMentorRequest({ mentorId }));
    }
    if (!myMentors.includes(mentorId)) {
      setMyMentors([...myMentors, mentorId]);
    }
    Alert.alert(
      'Session Booked!',
      'Your mentor session has been scheduled. Check your email for details.'
    );
    setShowDetail(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Mentorship Program</Text>
        <Text style={styles.headerSubtitle}>
          Connect with industry experts and accelerate your career growth
        </Text>
      </LinearGradient>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <View style={[styles.statIconBg, { backgroundColor: '#eef2ff' }]}>
            <Ionicons name="people" size={18} color="#6366f1" />
          </View>
          <View>
            <Text style={styles.statValue}>{myMentors.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>
        <View style={styles.statBox}>
          <View style={[styles.statIconBg, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="calendar" size={18} color="#16a34a" />
          </View>
          <View>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
        </View>
        <View style={styles.statBox}>
          <View style={[styles.statIconBg, { backgroundColor: '#dbeafe' }]}>
            <Ionicons name="time" size={18} color="#2563eb" />
          </View>
          <View>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Hours</Text>
          </View>
        </View>
        <View style={styles.statBox}>
          <View style={[styles.statIconBg, { backgroundColor: '#fef9c3' }]}>
            <Ionicons name="star" size={18} color="#ca8a04" />
          </View>
          <View>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'find' && styles.tabActive]}
          onPress={() => setActiveTab('find')}
        >
          <Text style={[styles.tabText, activeTab === 'find' && styles.tabActiveText]}>
            Find Mentors
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my' && styles.tabActive]}
          onPress={() => setActiveTab('my')}
        >
          <Text style={[styles.tabText, activeTab === 'my' && styles.tabActiveText]}>
            My Mentors ({myMentors.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'find' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center' }}
        >
          {expertiseAreas.map((area) => (
            <TouchableOpacity
              key={area.id}
              style={[
                styles.filterBtn,
                selectedExpertise === area.id && styles.filterActive,
              ]}
              onPress={() => setSelectedExpertise(area.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedExpertise === area.id && styles.filterActiveText,
                ]}
              >
                {area.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'find' ? (
          filtered.map((mentor) => {
            const availStyle = getAvailabilityStyle(mentor.availability);
            return (
              <TouchableOpacity
                key={mentor.id}
                style={styles.card}
                onPress={() => {
                  setSelectedMentor(mentor);
                  setShowDetail(true);
                }}
              >
                <View style={styles.mentorHeader}>
                  <Text style={styles.avatarEmoji}>{mentor.avatar}</Text>
                  <View style={styles.mentorInfo}>
                    <Text style={styles.mentorName}>{mentor.name}</Text>
                    <Text style={styles.mentorTitle}>{mentor.title}</Text>
                    <Text style={styles.mentorCompany}>{mentor.company}</Text>
                  </View>
                  <View style={[styles.availBadge, { backgroundColor: availStyle.bg }]}>
                    <Text style={[styles.availTextBadge, { color: availStyle.text }]}>
                      {mentor.availability}
                    </Text>
                  </View>
                </View>

                <Text style={styles.mentorBio} numberOfLines={2}>
                  {mentor.bio}
                </Text>

                <View style={styles.mentorMeta}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Rating:</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="star" size={14} color="#f59e0b" />
                      <Text style={styles.metaValue}> {mentor.rating}</Text>
                      <Text style={styles.metaSub}> ({mentor.sessions})</Text>
                    </View>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Price/hr:</Text>
                    <Text style={styles.metaValue}>${mentor.pricePerSession}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Response:</Text>
                    <Text style={styles.metaValue}>{mentor.responseTime}</Text>
                  </View>
                </View>

                <View style={styles.skillTags}>
                  {mentor.skills.slice(0, 3).map((s, i) => (
                    <View key={i} style={styles.skillTag}>
                      <Text style={styles.skillTagText}>{s}</Text>
                    </View>
                  ))}
                  {mentor.skills.length > 3 && (
                    <View style={[styles.skillTag, { backgroundColor: '#f3f4f6' }]}>
                      <Text style={[styles.skillTagText, { color: '#6b7280' }]}>
                        +{mentor.skills.length - 3}
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.connectButton,
                    myMentors.includes(mentor.id) && { backgroundColor: '#10b981' },
                  ]}
                  onPress={() => handleBookSession(mentor.id)}
                >
                  <Text style={styles.connectButtonText}>
                    {myMentors.includes(mentor.id) ? '✓ Booked' : 'Book Session'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        ) : myMentors.length > 0 ? (
          allMentors
            .filter((m) => myMentors.includes(m.id))
            .map((mentor) => (
              <View key={mentor.id} style={styles.card}>
                <View style={styles.mentorHeader}>
                  <Text style={styles.avatarEmoji}>{mentor.avatar}</Text>
                  <View style={styles.mentorInfo}>
                    <Text style={styles.mentorName}>{mentor.name}</Text>
                    <Text style={styles.mentorTitle}>
                      {mentor.title} at {mentor.company}
                    </Text>
                    <Text style={styles.metaSub}>{mentor.sessions} sessions completed</Text>
                  </View>
                </View>

                <View style={styles.nextSession}>
                  <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                  <Text style={styles.nextSessionText}>
                    Next: Mar 20, 2024 at 10:00 AM
                  </Text>
                </View>

                <View style={styles.myMentorActions}>
                  <TouchableOpacity style={styles.joinBtn} onPress={() => Alert.alert('Join Session', `Joining session with ${mentor.name}. A video call link will be sent to your email.`)}>
                    <Text style={styles.joinBtnText}>Join Session</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.msgButton} onPress={() => Alert.alert('Message Sent!', `Your message has been sent to ${mentor.name}. They will reply within ${mentor.responseTime}.`)}>
                    <Text style={styles.msgButtonText}>Message</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rescheduleBtn} onPress={() => Alert.alert('Reschedule', `A reschedule request has been sent to ${mentor.name}.`)}>
                    <Text style={styles.rescheduleBtnText}>Reschedule</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No mentors yet</Text>
            <Text style={styles.emptyText}>
              Start connecting with mentors to accelerate your career growth.
            </Text>
            <TouchableOpacity
              style={styles.findBtn}
              onPress={() => setActiveTab('find')}
            >
              <Text style={styles.findBtnText}>Find Mentors</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Mentor Detail Modal */}
      <Modal visible={showDetail} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeaderBar}>
            <TouchableOpacity onPress={() => setShowDetail(false)}>
              <Ionicons name="close" size={28} color="#111827" />
            </TouchableOpacity>
          </View>
          {selectedMentor && (
            <ScrollView contentContainerStyle={styles.detailContent}>
              <Text style={styles.detailEmoji}>{selectedMentor.avatar}</Text>
              <Text style={styles.detailName}>{selectedMentor.name}</Text>
              <Text style={styles.detailRole}>
                {selectedMentor.title} at {selectedMentor.company}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <View
                  style={[
                    styles.availBadge,
                    {
                      backgroundColor: getAvailabilityStyle(selectedMentor.availability).bg,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: getAvailabilityStyle(selectedMentor.availability).text,
                    }}
                  >
                    {selectedMentor.availability}
                  </Text>
                </View>
                <Ionicons name="star" size={16} color="#f59e0b" />
                <Text style={{ fontWeight: '600', color: '#111827' }}>
                  {selectedMentor.rating}
                </Text>
                <Text style={{ color: '#6b7280' }}>
                  ({selectedMentor.sessions} sessions)
                </Text>
              </View>

              {/* Session Details Box */}
              <View style={styles.sessionDetailsBox}>
                <Text style={styles.detailSectionTitle}>Session Details</Text>
                <View style={styles.sessionRow}>
                  <Text style={styles.sessionLabel}>Price per hour</Text>
                  <Text style={styles.sessionPrice}>
                    ${selectedMentor.pricePerSession}
                  </Text>
                </View>
                <View style={styles.sessionRow}>
                  <Text style={styles.sessionLabel}>Response time</Text>
                  <Text style={styles.sessionVal}>{selectedMentor.responseTime}</Text>
                </View>
                <View style={styles.sessionRow}>
                  <Text style={styles.sessionLabel}>Total sessions</Text>
                  <Text style={styles.sessionVal}>{selectedMentor.sessions}</Text>
                </View>
              </View>

              {/* About */}
              <Text style={styles.detailSectionTitle}>About</Text>
              <Text style={styles.detailBio}>{selectedMentor.bio}</Text>

              {/* Skills */}
              <Text style={styles.detailSectionTitle}>Expertise & Skills</Text>
              <View style={styles.detailExpertise}>
                {selectedMentor.skills.map((s: string, i: number) => (
                  <View key={i} style={styles.detailExpChip}>
                    <Text style={styles.detailExpText}>{s}</Text>
                  </View>
                ))}
              </View>

              {/* Education & Experience */}
              <Text style={styles.detailSectionTitle}>Education & Experience</Text>
              <View style={styles.eduSection}>
                <View style={styles.eduRow}>
                  <Text style={styles.eduLabel}>Education:</Text>
                  <Text style={styles.eduValue}>{selectedMentor.education}</Text>
                </View>
                <View style={styles.eduRow}>
                  <Text style={styles.eduLabel}>Experience:</Text>
                  <Text style={styles.eduValue}>{selectedMentor.experience}</Text>
                </View>
                <View style={styles.eduRow}>
                  <Text style={styles.eduLabel}>Languages:</Text>
                  <Text style={styles.eduValue}>
                    {selectedMentor.languages.join(', ')}
                  </Text>
                </View>
              </View>

              {/* Intro Call Banner */}
              <View style={styles.introBanner}>
                <Ionicons name="information-circle" size={20} color="#2563eb" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.introTitle}>Free 15-min intro call</Text>
                  <Text style={styles.introSub}>
                    Get to know your mentor before booking a full session.
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <TouchableOpacity
                style={styles.bookBtn}
                onPress={() => handleBookSession(selectedMentor.id)}
              >
                <Text style={styles.bookBtnText}>
                  {myMentors.includes(selectedMentor.id)
                    ? '✓ Session Booked'
                    : 'Book 1-hour Session'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalMsgBtn}
                onPress={() => {
                  if (!messagedMentors.includes(selectedMentor.id)) {
                    setMessagedMentors([...messagedMentors, selectedMentor.id]);
                  }
                  Alert.alert('Message Sent!', `Your message has been sent to ${selectedMentor.name}. They will reply within ${selectedMentor.responseTime}.`);
                }}
              >
                <Text style={styles.modalMsgBtnText}>
                  {messagedMentors.includes(selectedMentor.id) ? '✓ Message Sent' : 'Send Message'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.favBtn, favorites.includes(selectedMentor.id) && { backgroundColor: '#ef4444' }]}
                onPress={() => {
                  if (favorites.includes(selectedMentor.id)) {
                    setFavorites(favorites.filter((id) => id !== selectedMentor.id));
                    Alert.alert('Removed', `${selectedMentor.name} removed from favorites.`);
                  } else {
                    setFavorites([...favorites, selectedMentor.id]);
                    Alert.alert('Added!', `${selectedMentor.name} added to favorites.`);
                  }
                }}
              >
                <Ionicons name={favorites.includes(selectedMentor.id) ? 'heart' : 'heart-outline'} size={18} color="#fff" />
                <Text style={styles.favBtnText}>
                  {favorites.includes(selectedMentor.id) ? '♥ In Favorites' : 'Add to Favorites'}
                </Text>
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
  headerSubtitle: { fontSize: 14, color: '#e0e7ff', lineHeight: 20 },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginTop: -14,
    marginBottom: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 3,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  statLabel: { fontSize: 9, color: '#6b7280' },

  // Tabs
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#6366f1' },
  tabText: { fontSize: 15, fontWeight: '600', color: '#6b7280' },
  tabActiveText: { color: '#6366f1' },

  // Filters - FIXED: constrained height
  filterRow: {
    marginBottom: 8,
    flexGrow: 0,
    maxHeight: 50,
  },
  filterBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 0,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 36,
    justifyContent: 'center',
  },
  filterActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  filterActiveText: { color: '#fff' },

  // Content
  content: { flex: 1, paddingHorizontal: 16 },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  mentorHeader: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-start' },
  avatarEmoji: { fontSize: 36, marginRight: 12 },
  mentorInfo: { flex: 1 },
  mentorName: { fontSize: 17, fontWeight: 'bold', color: '#111827', marginBottom: 2 },
  mentorTitle: { fontSize: 13, color: '#6b7280', marginBottom: 1 },
  mentorCompany: { fontSize: 13, color: '#6366f1', fontWeight: '500' },
  availBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  availTextBadge: { fontSize: 11, fontWeight: '600' },

  mentorBio: { fontSize: 13, color: '#6b7280', lineHeight: 18, marginBottom: 10 },

  mentorMeta: { marginBottom: 10 },
  metaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaLabel: { fontSize: 12, color: '#9ca3af' },
  metaValue: { fontSize: 13, fontWeight: '600', color: '#111827' },
  metaSub: { fontSize: 12, color: '#6b7280' },

  skillTags: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  skillTag: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  skillTagText: { fontSize: 11, color: '#6366f1', fontWeight: '600' },

  connectButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  connectButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  // My Mentors
  nextSession: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 10,
  },
  nextSessionText: { fontSize: 13, color: '#374151', fontWeight: '500' },

  myMentorActions: { flexDirection: 'row', gap: 8 },
  joinBtn: {
    flex: 1,
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  joinBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  msgButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  msgButtonText: { color: '#374151', fontSize: 13, fontWeight: '600' },
  rescheduleBtn: {
    flex: 1,
    backgroundColor: '#16a34a',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  rescheduleBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Empty State
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginTop: 12 },
  emptyText: { fontSize: 14, color: '#6b7280', marginTop: 4, textAlign: 'center', paddingHorizontal: 32 },
  findBtn: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 16,
  },
  findBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  // Modal
  modalContainer: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  modalHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  detailContent: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 40 },
  detailEmoji: { fontSize: 56, marginBottom: 12 },
  detailName: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  detailRole: { fontSize: 15, color: '#6b7280', marginBottom: 8 },

  sessionDetailsBox: {
    width: '100%',
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sessionLabel: { fontSize: 13, color: '#6b7280' },
  sessionPrice: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  sessionVal: { fontSize: 14, fontWeight: '600', color: '#111827' },

  detailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    alignSelf: 'flex-start',
    marginBottom: 12,
    marginTop: 4,
  },
  detailBio: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  detailExpertise: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    marginBottom: 20,
  },
  detailExpChip: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  detailExpText: { fontSize: 13, color: '#6366f1', fontWeight: '600' },

  eduSection: { width: '100%', marginBottom: 20 },
  eduRow: { flexDirection: 'row', marginBottom: 6 },
  eduLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginRight: 6 },
  eduValue: { fontSize: 14, color: '#6b7280', flex: 1 },

  introBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  introTitle: { fontSize: 14, fontWeight: '600', color: '#1e40af' },
  introSub: { fontSize: 13, color: '#1d4ed8', marginTop: 2 },

  bookBtn: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  bookBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  modalMsgBtn: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalMsgBtnText: { color: '#374151', fontSize: 15, fontWeight: '600' },
  favBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  favBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
