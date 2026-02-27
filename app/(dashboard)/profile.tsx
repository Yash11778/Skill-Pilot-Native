import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Switch,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { logout } from '../../src/store/slices/authSlice';
import { getProfile, updateProfile } from '../../src/store/slices/userSlice';

const ALL_SKILLS = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'TypeScript', 'Java', 'Data Analysis', 'Machine Learning', 'AWS', 'Docker', 'Figma', 'Swift', 'Kotlin', 'Go'];
const ALL_INTERESTS = ['Web Development', 'Data Science', 'Mobile Development', 'Cloud Computing', 'AI/ML', 'Cybersecurity', 'DevOps', 'Product Management', 'UX Design', 'Blockchain'];

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch<any>();
  const { user } = useSelector((state: any) => state.auth);
  const { profile, isLoading } = useSelector((state: any) => state.user);

  // Fetch profile from backend on mount
  useEffect(() => {
    dispatch(getProfile());
  }, []);

  // Sync backend profile with local state when it arrives
  useEffect(() => {
    if (profile) {
      if (profile.firstName) setFirstName(profile.firstName);
      if (profile.lastName) setLastName(profile.lastName);
      if (profile.age) setAge(profile.age.toString());
      if (profile.careerStage) setCareerStage(profile.careerStage);
      if (profile.skills) setSkills(Array.isArray(profile.skills) ? profile.skills.map((s: any) => typeof s === 'string' ? s : s.name || '') : []);
      if (profile.interests) setInterests(profile.interests);
    }
  }, [profile]);

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [careerStage, setCareerStage] = useState(user?.careerStage || 'Student');
  const [skills, setSkills] = useState<string[]>(user?.skills || ['JavaScript', 'React', 'Python']);
  const [interests, setInterests] = useState<string[]>(user?.interests || ['Web Development', 'Data Science']);
  const [showSkillPicker, setShowSkillPicker] = useState(false);
  const [showInterestPicker, setShowInterestPicker] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Notification preferences
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [courseUpdates, setCourseUpdates] = useState(true);
  const [mentorMessages, setMentorMessages] = useState(true);

  // Settings state
  const [autoPlay, setAutoPlay] = useState(true);
  const [downloadWifi, setDownloadWifi] = useState(true);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => { dispatch(logout()); router.replace('/(auth)/login'); } },
    ]);
  };

  const handleSave = async () => {
    try {
      await dispatch(updateProfile({
        firstName,
        lastName,
        age: parseInt(age) || undefined,
        careerStage,
        skills,
        interests,
      })).unwrap();
      Alert.alert('Profile Updated', 'Your profile has been saved successfully.');
      setEditing(false);
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to update profile');
    }
  };

  const toggleSkill = (s: string) => setSkills(skills.includes(s) ? skills.filter(x => x !== s) : [...skills, s]);
  const toggleInterest = (i: string) => setInterests(interests.includes(i) ? interests.filter(x => x !== i) : [...interests, i]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#6366f1', '#8b5cf6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{firstName?.charAt(0)}{lastName?.charAt(0)}</Text>
          </View>
          <Text style={styles.name}>{firstName} {lastName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <TouchableOpacity style={styles.editHeaderBtn} onPress={() => setEditing(!editing)}>
            <Ionicons name={editing ? 'close' : 'create-outline'} size={18} color="#6366f1" />
            <Text style={styles.editHeaderText}>{editing ? 'Cancel' : 'Edit Profile'}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}><Text style={styles.statValue}>{skills.length}</Text><Text style={styles.statLabel}>Skills</Text></View>
          <View style={styles.statItem}><Text style={styles.statValue}>{interests.length}</Text><Text style={styles.statLabel}>Interests</Text></View>
          <View style={styles.statItem}><Text style={styles.statValue}>2.4k</Text><Text style={styles.statLabel}>Points</Text></View>
        </View>

        {/* Personal Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          {editing ? (
            <>
              <View style={styles.row}>
                <View style={styles.halfInput}><Text style={styles.label}>First Name</Text><TextInput style={styles.input} value={firstName} onChangeText={setFirstName} /></View>
                <View style={styles.halfInput}><Text style={styles.label}>Last Name</Text><TextInput style={styles.input} value={lastName} onChangeText={setLastName} /></View>
              </View>
              <Text style={styles.label}>Age</Text>
              <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="number-pad" maxLength={3} />
              <Text style={styles.label}>Career Stage</Text>
              <Text style={styles.readOnly}>{careerStage}</Text>
            </>
          ) : (
            <>
              <View style={styles.infoRow}><Ionicons name="person-outline" size={18} color="#6b7280" /><Text style={styles.infoText}>{firstName} {lastName}</Text></View>
              <View style={styles.infoRow}><Ionicons name="mail-outline" size={18} color="#6b7280" /><Text style={styles.infoText}>{user?.email}</Text></View>
              {age ? <View style={styles.infoRow}><Ionicons name="calendar-outline" size={18} color="#6b7280" /><Text style={styles.infoText}>{age} years old</Text></View> : null}
              <View style={styles.infoRow}><Ionicons name="briefcase-outline" size={18} color="#6b7280" /><Text style={styles.infoText}>{careerStage}</Text></View>
            </>
          )}
        </View>

        {/* Skills */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {editing && <TouchableOpacity onPress={() => setShowSkillPicker(true)}><Ionicons name="add-circle-outline" size={24} color="#6366f1" /></TouchableOpacity>}
          </View>
          <View style={styles.chips}>
            {skills.map((s, i) => (
              <View key={i} style={styles.chip}>
                <Text style={styles.chipText}>{s}</Text>
                {editing && <TouchableOpacity onPress={() => toggleSkill(s)}><Ionicons name="close-circle" size={16} color="#6366f1" /></TouchableOpacity>}
              </View>
            ))}
          </View>
        </View>

        {/* Interests */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Interests</Text>
            {editing && <TouchableOpacity onPress={() => setShowInterestPicker(true)}><Ionicons name="add-circle-outline" size={24} color="#10b981" /></TouchableOpacity>}
          </View>
          <View style={styles.chips}>
            {interests.map((item, i) => (
              <View key={i} style={[styles.chip, { backgroundColor: '#ecfdf5' }]}>
                <Text style={[styles.chipText, { color: '#10b981' }]}>{item}</Text>
                {editing && <TouchableOpacity onPress={() => toggleInterest(item)}><Ionicons name="close-circle" size={16} color="#10b981" /></TouchableOpacity>}
              </View>
            ))}
          </View>
        </View>

        {editing && (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        )}

        {/* Menu */}
        {!editing && (
          <View style={styles.menuContainer}>
            {[
              { icon: 'notifications-outline', label: 'Notifications', onPress: () => setShowNotifications(true) },
              { icon: 'settings-outline', label: 'Settings', onPress: () => setShowSettings(true) },
              { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => setShowHelp(true) },
              { icon: 'document-text-outline', label: 'Terms & Privacy', onPress: () => setShowTerms(true) },
            ].map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIcon}><Ionicons name={item.icon as any} size={22} color="#6366f1" /></View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Skill Picker Modal */}
      <Modal visible={showSkillPicker} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.pickerModal}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select Skills</Text>
            <TouchableOpacity onPress={() => setShowSkillPicker(false)}><Ionicons name="close" size={28} color="#111827" /></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.pickerGrid}>
            {ALL_SKILLS.map((s, i) => (
              <TouchableOpacity key={i} style={[styles.pickerChip, skills.includes(s) && styles.pickerChipActive]} onPress={() => toggleSkill(s)}>
                <Text style={[styles.pickerChipText, skills.includes(s) && styles.pickerChipTextActive]}>{s}</Text>
                {skills.includes(s) && <Ionicons name="checkmark-circle" size={16} color="#fff" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Interest Picker Modal */}
      <Modal visible={showInterestPicker} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.pickerModal}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select Interests</Text>
            <TouchableOpacity onPress={() => setShowInterestPicker(false)}><Ionicons name="close" size={28} color="#111827" /></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.pickerGrid}>
            {ALL_INTERESTS.map((item, i) => (
              <TouchableOpacity key={i} style={[styles.pickerChip, interests.includes(item) && { backgroundColor: '#10b981' }]} onPress={() => toggleInterest(item)}>
                <Text style={[styles.pickerChipText, interests.includes(item) && styles.pickerChipTextActive]}>{item}</Text>
                {interests.includes(item) && <Ionicons name="checkmark-circle" size={16} color="#fff" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal visible={showNotifications} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.pickerModal}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Notifications</Text>
            <TouchableOpacity onPress={() => setShowNotifications(false)}><Ionicons name="close" size={28} color="#111827" /></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={styles.settingsGroupTitle}>Notification Preferences</Text>
            <View style={styles.settingsCard}>
              <View style={styles.settingRow}>
                <View><Text style={styles.settingLabel}>Push Notifications</Text><Text style={styles.settingDesc}>Receive push notifications on your device</Text></View>
                <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ true: '#6366f1' }} />
              </View>
              <View style={styles.settingRow}>
                <View><Text style={styles.settingLabel}>Email Notifications</Text><Text style={styles.settingDesc}>Receive updates via email</Text></View>
                <Switch value={emailEnabled} onValueChange={setEmailEnabled} trackColor={{ true: '#6366f1' }} />
              </View>
              <View style={styles.settingRow}>
                <View><Text style={styles.settingLabel}>Course Updates</Text><Text style={styles.settingDesc}>New lessons, assignments, and deadlines</Text></View>
                <Switch value={courseUpdates} onValueChange={setCourseUpdates} trackColor={{ true: '#6366f1' }} />
              </View>
              <View style={styles.settingRow}>
                <View><Text style={styles.settingLabel}>Mentor Messages</Text><Text style={styles.settingDesc}>Messages from your mentors</Text></View>
                <Switch value={mentorMessages} onValueChange={setMentorMessages} trackColor={{ true: '#6366f1' }} />
              </View>
            </View>
            <TouchableOpacity style={styles.saveSettingsBtn} onPress={() => { setShowNotifications(false); Alert.alert('Saved', 'Notification preferences updated.'); }}>
              <Text style={styles.saveSettingsBtnText}>Save Preferences</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={showSettings} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.pickerModal}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Settings</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}><Ionicons name="close" size={28} color="#111827" /></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={styles.settingsGroupTitle}>App Settings</Text>
            <View style={styles.settingsCard}>
              <View style={styles.settingRow}>
                <View><Text style={styles.settingLabel}>Auto-play Videos</Text><Text style={styles.settingDesc}>Auto-play course videos when opened</Text></View>
                <Switch value={autoPlay} onValueChange={setAutoPlay} trackColor={{ true: '#6366f1' }} />
              </View>
              <View style={styles.settingRow}>
                <View><Text style={styles.settingLabel}>Download on Wi-Fi Only</Text><Text style={styles.settingDesc}>Only download content when on Wi-Fi</Text></View>
                <Switch value={downloadWifi} onValueChange={setDownloadWifi} trackColor={{ true: '#6366f1' }} />
              </View>
            </View>
            <Text style={styles.settingsGroupTitle}>Account</Text>
            <View style={styles.settingsCard}>
              <TouchableOpacity style={styles.settingAction} onPress={() => Alert.alert('Change Password', 'A password reset link has been sent to your email.')}>
                <Ionicons name="lock-closed-outline" size={20} color="#6366f1" />
                <Text style={styles.settingActionText}>Change Password</Text>
                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingAction} onPress={() => Alert.alert('Export Data', 'Your data export will be sent to your email within 24 hours.')}>
                <Ionicons name="download-outline" size={20} color="#6366f1" />
                <Text style={styles.settingActionText}>Export My Data</Text>
                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.settingAction, { borderBottomWidth: 0 }]} onPress={() => Alert.alert('Delete Account', 'Are you sure? This action cannot be undone.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive' }])}>
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                <Text style={[styles.settingActionText, { color: '#ef4444' }]}>Delete Account</Text>
                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            <Text style={styles.appVersion}>SkillPilot v1.0.0</Text>
          </ScrollView>
        </View>
      </Modal>

      {/* Help & Support Modal */}
      <Modal visible={showHelp} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.pickerModal}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Help & Support</Text>
            <TouchableOpacity onPress={() => setShowHelp(false)}><Ionicons name="close" size={28} color="#111827" /></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={styles.settingsGroupTitle}>Frequently Asked Questions</Text>
            {[
              { q: 'How do I reset my password?', a: 'Go to Settings > Change Password or use the "Forgot Password" option on the login screen.' },
              { q: 'How can I contact a mentor?', a: 'Navigate to the Mentors tab, select a mentor, and click "Book Session" to schedule a meeting.' },
              { q: 'Are the courses free?', a: 'Many courses offer free audit options. Premium features may require a subscription.' },
              { q: 'How do I track my progress?', a: 'Your dashboard shows overall progress, completed courses, and skill assessments.' },
              { q: 'Can I download courses offline?', a: 'Yes! Enable "Download on Wi-Fi Only" in Settings for offline access to enrolled courses.' },
            ].map((faq, i) => (
              <View key={i} style={styles.faqCard}>
                <Text style={styles.faqQuestion}>{faq.q}</Text>
                <Text style={styles.faqAnswer}>{faq.a}</Text>
              </View>
            ))}
            <Text style={styles.settingsGroupTitle}>Contact Us</Text>
            <View style={styles.settingsCard}>
              <TouchableOpacity style={styles.settingAction} onPress={() => Linking.openURL('mailto:support@skillpilot.com')}>
                <Ionicons name="mail-outline" size={20} color="#6366f1" />
                <Text style={styles.settingActionText}>Email Support</Text>
                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.settingAction, { borderBottomWidth: 0 }]} onPress={() => Alert.alert('Live Chat', 'Live chat is available Mon-Fri, 9AM-6PM IST.')}>
                <Ionicons name="chatbubbles-outline" size={20} color="#6366f1" />
                <Text style={styles.settingActionText}>Live Chat</Text>
                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Terms & Privacy Modal */}
      <Modal visible={showTerms} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.pickerModal}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Terms & Privacy</Text>
            <TouchableOpacity onPress={() => setShowTerms(false)}><Ionicons name="close" size={28} color="#111827" /></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={styles.termsHeading}>Terms of Service</Text>
            <Text style={styles.termsText}>
              By using SkillPilot, you agree to these terms. SkillPilot provides an educational platform for skill development, career guidance, and mentorship connections.{'\n\n'}
              <Text style={{ fontWeight: '700' }}>1. Account Responsibility</Text>{'\n'}
              You are responsible for maintaining the security of your account and password. SkillPilot cannot be held liable for any loss or damage from your failure to comply with this obligation.{'\n\n'}
              <Text style={{ fontWeight: '700' }}>2. Content Usage</Text>{'\n'}
              Course materials and content are for personal educational use only. Redistribution or commercial use without permission is prohibited.{'\n\n'}
              <Text style={{ fontWeight: '700' }}>3. Mentorship Services</Text>{'\n'}
              Mentor sessions are subject to availability. Cancellations must be made at least 24 hours before the scheduled session.
            </Text>
            <Text style={styles.termsHeading}>Privacy Policy</Text>
            <Text style={styles.termsText}>
              SkillPilot respects your privacy. We collect only the data necessary to provide our services.{'\n\n'}
              <Text style={{ fontWeight: '700' }}>Data We Collect:</Text> Name, email, educational background, career interests, and assessment results.{'\n\n'}
              <Text style={{ fontWeight: '700' }}>How We Use It:</Text> To personalize your learning path, recommend courses, and connect you with relevant mentors.{'\n\n'}
              <Text style={{ fontWeight: '700' }}>Data Protection:</Text> Your data is encrypted and stored securely. We never sell your personal information to third parties.
            </Text>
            <Text style={styles.termsLastUpdated}>Last updated: January 2026</Text>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20 },
  profileSection: { alignItems: 'center' },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#6366f1' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  email: { fontSize: 15, color: '#e0e7ff', marginBottom: 12 },
  editHeaderBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  editHeaderText: { fontSize: 13, fontWeight: '600', color: '#6366f1' },
  content: { padding: 16, marginTop: -16 },
  statsContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 2 },
  statLabel: { fontSize: 12, color: '#6b7280' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 10 },
  halfInput: { flex: 1 },
  label: { fontSize: 13, fontWeight: '600', color: '#6b7280', marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: '#f3f4f6', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: '#111827', borderWidth: 1, borderColor: '#e5e7eb' },
  readOnly: { backgroundColor: '#f3f4f6', borderRadius: 10, padding: 12, fontSize: 15, color: '#6b7280' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  infoText: { fontSize: 15, color: '#374151' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#eef2ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  chipText: { fontSize: 13, fontWeight: '600', color: '#6366f1' },
  saveBtn: { backgroundColor: '#6366f1', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 14 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  menuContainer: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuLabel: { fontSize: 15, fontWeight: '500', color: '#111827' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#ef4444', marginLeft: 8 },
  pickerModal: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  pickerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 20 },
  pickerChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f3f4f6', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  pickerChipActive: { backgroundColor: '#6366f1' },
  pickerChipText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  pickerChipTextActive: { color: '#fff' },
  // New modal styles
  settingsGroupTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12, marginTop: 8 },
  settingsCard: { backgroundColor: '#fff', borderRadius: 14, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  settingLabel: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 2 },
  settingDesc: { fontSize: 12, color: '#6b7280', maxWidth: 240 },
  settingAction: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  settingActionText: { fontSize: 15, fontWeight: '500', color: '#111827', flex: 1 },
  saveSettingsBtn: { backgroundColor: '#6366f1', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveSettingsBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  appVersion: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginTop: 20 },
  faqCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  faqQuestion: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 6 },
  faqAnswer: { fontSize: 13, color: '#6b7280', lineHeight: 19 },
  termsHeading: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12, marginTop: 16 },
  termsText: { fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 4 },
  termsLastUpdated: { fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 20, marginBottom: 40 },
});
