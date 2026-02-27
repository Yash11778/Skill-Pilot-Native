import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, TextInput, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const mentors = [
  {
    id: 1,
    name: 'Yash Dharme',
    role: 'Senior Software Engineer @ Google',
    expertise: ['React', 'Node.js', 'System Design'],
    rating: 4.9,
    sessions: 127,
    price: '₹1200/session',
    avatar: '👨‍💻',
    availability: 'Available',
    bio: 'Experienced software engineer with 8+ years at top tech companies. Passionate about helping junior developers grow their careers.'
  },
  {
    id: 2,
    name: 'Maithili Dorkhande',
    role: 'Data Science Manager @ Netflix',
    expertise: ['Python', 'Machine Learning', 'Statistics'],
    rating: 4.8,
    sessions: 89,
    price: '₹1500/session',
    avatar: '👩‍🔬',
    availability: 'Busy',
    bio: 'Data science leader specializing in machine learning and analytics. Helped 50+ professionals transition into data science.'
  },
  {
    id: 3,
    name: 'Harkirat Singh',
    role: 'Lead UX Designer @ Apple',
    expertise: ['Figma', 'User Research', 'Design Systems'],
    rating: 4.9,
    sessions: 156,
    price: '₹1000/session',
    avatar: '�‍🎨',
    availability: 'Available',
    bio: 'Award-winning UX designer with a passion for creating intuitive user experiences. Mentor to designers worldwide.'
  },
];

const communityPosts = [
  { id: 1, author: 'Sneha K.', avatar: '👩', content: 'Just completed the ML specialization! The roadmap helped me stay focused. Highly recommend the Andrew Ng course first.', likes: 42, comments: 8, tags: ['ML', 'Success Story'], time: '2h ago' },
  { id: 2, author: 'Rohan M.', avatar: '👨', content: 'Looking for a study buddy for the data science track. Anyone interested in doing weekly problem-solving sessions?', likes: 28, comments: 15, tags: ['Study Group', 'Data Science'], time: '5h ago' },
  { id: 3, author: 'Aisha P.', avatar: '👩‍🎓', content: 'Tips for beginners: Start with Python basics, don\'t jump into advanced topics. Build projects from day 1!', likes: 65, comments: 12, tags: ['Tips', 'Beginner'], time: '1d ago' },
  { id: 4, author: 'Dev R.', avatar: '🧑‍💻', content: 'Landed my first internship after completing the full-stack simulation! The portfolio projects made a huge difference.', likes: 89, comments: 20, tags: ['Full Stack', 'Success'], time: '2d ago' },
  { id: 5, author: 'Tanvi S.', avatar: '👩‍💼', content: 'Cybersecurity career path is amazing. The vulnerability assessment simulation was very realistic. Thanks SkillPilot!', likes: 35, comments: 6, tags: ['Cybersecurity', 'Review'], time: '3d ago' },
];

const sessionTypes = ['1-on-1 Mentoring', 'Code Review', 'Career Guidance', 'Mock Interview'];

export default function CommunityMentorsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'mentors' | 'community'>('mentors');
  const [showBooking, setShowBooking] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [bookingType, setBookingType] = useState(sessionTypes[0]);
  const [bookingMessage, setBookingMessage] = useState('');
  const [postLikes, setPostLikes] = useState<Record<number, boolean>>({});

  const openBooking = (mentor: any) => {
    setSelectedMentor(mentor);
    setBookingMessage('');
    setShowBooking(true);
  };

  const submitBooking = () => {
    setShowBooking(false);
    Alert.alert('Booking Requested! 🎉', `Your session with ${selectedMentor.name} has been requested. You'll receive a confirmation shortly.`);
  };

  const toggleLike = (postId: number) => {
    setPostLikes(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleFinish = async () => {
    await AsyncStorage.setItem('onboardingComplete', 'true');
    router.replace('/(dashboard)');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>👥 Community & Mentors</Text>
        <Text style={styles.subtitle}>Connect with experts and fellow learners</Text>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity style={[styles.tab, activeTab === 'mentors' && styles.tabActive]}
            onPress={() => setActiveTab('mentors')}>
            <Text style={[styles.tabText, activeTab === 'mentors' && styles.tabTextActive]}>
              Mentors ({mentors.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'community' && styles.tabActive]}
            onPress={() => setActiveTab('community')}>
            <Text style={[styles.tabText, activeTab === 'community' && styles.tabTextActive]}>
              Community ({communityPosts.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'mentors' ? (
          <>
            {mentors.map(mentor => (
              <View key={mentor.id} style={styles.card}>
                <View style={styles.mentorHeader}>
                  <Text style={styles.avatar}>{mentor.avatar}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.mentorName}>{mentor.name}</Text>
                    <Text style={styles.mentorRole}>{mentor.role}</Text>
                  </View>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>⭐ {mentor.rating}</Text>
                  </View>
                </View>
                <Text style={styles.bio}>{mentor.bio}</Text>
                <View style={styles.chipRow}>
                  {mentor.expertise.map((e, idx) => (
                    <View key={idx} style={styles.chip}><Text style={styles.chipText}>{e}</Text></View>
                  ))}
                </View>
                <View style={styles.mentorMeta}>
                  <Text style={styles.metaItem}>📅 {mentor.availability}</Text>
                  <Text style={styles.metaItem}>🎓 {mentor.sessions} sessions</Text>
                  <Text style={styles.metaPrice}>{mentor.price}</Text>
                </View>
                <TouchableOpacity style={styles.bookBtn} onPress={() => openBooking(mentor)}>
                  <Text style={styles.bookBtnText}>Book Session</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        ) : (
          <>
            {communityPosts.map(post => (
              <View key={post.id} style={styles.card}>
                <View style={styles.postHeader}>
                  <Text style={styles.postAvatar}>{post.avatar}</Text>
                  <View>
                    <Text style={styles.postAuthor}>{post.author}</Text>
                    <Text style={styles.postTime}>{post.time}</Text>
                  </View>
                </View>
                <Text style={styles.postContent}>{post.content}</Text>
                <View style={styles.chipRow}>
                  {post.tags.map((tag, idx) => (
                    <View key={idx} style={styles.tagChip}><Text style={styles.tagChipText}>#{tag}</Text></View>
                  ))}
                </View>
                <View style={styles.postActions}>
                  <TouchableOpacity style={styles.postAction} onPress={() => toggleLike(post.id)}>
                    <Ionicons name={postLikes[post.id] ? 'heart' : 'heart-outline'}
                      size={18} color={postLikes[post.id] ? '#ef4444' : '#6b7280'} />
                    <Text style={styles.postActionText}>{post.likes + (postLikes[post.id] ? 1 : 0)}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.postAction}>
                    <Ionicons name="chatbubble-outline" size={18} color="#6b7280" />
                    <Text style={styles.postActionText}>{post.comments}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.postAction}>
                    <Ionicons name="share-outline" size={18} color="#6b7280" />
                    <Text style={styles.postActionText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Finish Button */}
        <TouchableOpacity style={styles.primaryBtn} onPress={handleFinish}>
          <Text style={styles.primaryBtnText}>🎉 Go to Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.congrats}>Congratulations! You've completed the onboarding. Your personalized learning journey awaits!</Text>
      </ScrollView>

      {/* Booking Modal */}
      <Modal visible={showBooking} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Session</Text>
              <TouchableOpacity onPress={() => setShowBooking(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            {selectedMentor && (
              <>
                <View style={styles.modalMentor}>
                  <Text style={styles.modalAvatar}>{selectedMentor.avatar}</Text>
                  <View>
                    <Text style={styles.modalMentorName}>{selectedMentor.name}</Text>
                    <Text style={styles.modalMentorPrice}>{selectedMentor.price}</Text>
                  </View>
                </View>

                <Text style={styles.fieldLabel}>Session Type</Text>
                <View style={styles.typeOptions}>
                  {sessionTypes.map(type => (
                    <TouchableOpacity key={type}
                      style={[styles.typeOption, bookingType === type && styles.typeOptionActive]}
                      onPress={() => setBookingType(type)}>
                      <Text style={[styles.typeOptionText, bookingType === type && styles.typeOptionTextActive]}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.fieldLabel}>Message (optional)</Text>
                <TextInput style={styles.messageInput} multiline numberOfLines={4}
                  placeholder="Tell the mentor what you'd like to discuss..."
                  placeholderTextColor="#9ca3af"
                  value={bookingMessage} onChangeText={setBookingMessage} />

                <TouchableOpacity style={styles.submitBtn} onPress={submitBooking}>
                  <Text style={styles.submitBtnText}>Request Booking</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  mentorHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  avatar: { fontSize: 36 },
  mentorName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  mentorRole: { fontSize: 12, color: '#6366f1', marginTop: 2 },
  ratingBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingText: { fontSize: 12, fontWeight: '600', color: '#92400e' },
  bio: { fontSize: 13, color: '#6b7280', lineHeight: 18, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  chip: { backgroundColor: '#eef2ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  chipText: { fontSize: 11, fontWeight: '500', color: '#6366f1' },
  mentorMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  metaItem: { fontSize: 12, color: '#6b7280' },
  metaPrice: { fontSize: 14, fontWeight: '700', color: '#059669' },
  bookBtn: { backgroundColor: '#6366f1', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  bookBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  postAvatar: { fontSize: 28 },
  postAuthor: { fontSize: 14, fontWeight: '600', color: '#111827' },
  postTime: { fontSize: 11, color: '#9ca3af' },
  postContent: { fontSize: 14, color: '#374151', lineHeight: 20, marginBottom: 10 },
  tagChip: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagChipText: { fontSize: 11, fontWeight: '500', color: '#6b7280' },
  postActions: { flexDirection: 'row', gap: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  postAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  postActionText: { fontSize: 12, color: '#6b7280' },
  primaryBtn: { backgroundColor: '#6366f1', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 20, shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  primaryBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
  congrats: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginTop: 12, lineHeight: 18 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  modalMentor: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20, backgroundColor: '#f9fafb', padding: 14, borderRadius: 12 },
  modalAvatar: { fontSize: 36 },
  modalMentorName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  modalMentorPrice: { fontSize: 14, color: '#059669', fontWeight: '500' },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  typeOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeOption: { backgroundColor: '#f3f4f6', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  typeOptionActive: { backgroundColor: '#6366f1' },
  typeOptionText: { fontSize: 13, fontWeight: '500', color: '#374151' },
  typeOptionTextActive: { color: '#fff' },
  messageInput: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 14, fontSize: 14, color: '#111827', borderWidth: 1, borderColor: '#e5e7eb', minHeight: 100, textAlignVertical: 'top', marginBottom: 16 },
  submitBtn: { backgroundColor: '#6366f1', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
