import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const steps = [
  { id: 1, title: 'Personal', icon: 'person' },
  { id: 2, title: 'Education', icon: 'school' },
  { id: 3, title: 'Experience', icon: 'briefcase' },
  { id: 4, title: 'Skills', icon: 'flash' },
  { id: 5, title: 'Goals', icon: 'flag' },
  { id: 6, title: 'Background', icon: 'document-text' },
];

const careerStages = [
  'Student (High School)', 'Student (College/University)', 'Recent Graduate',
  'Entry Level (0-2 years)', 'Mid Level (3-5 years)', 'Senior Level (5+ years)',
  'Career Changer', 'Freelancer/Entrepreneur',
];

const educationLevels = [
  { value: 'high-school', label: 'High School' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'bachelors', label: "Bachelor's Degree" },
  { value: 'masters', label: "Master's Degree" },
  { value: 'phd', label: 'PhD' },
  { value: 'other', label: 'Other' },
];

const degreeOptions: Record<string, string[]> = {
  'high-school': ['High School Diploma', 'GED', 'Other'],
  'diploma': ['Engineering Diploma', 'Science Diploma', 'Commerce Diploma', 'Arts Diploma', 'Other'],
  'bachelors': ['B.Tech/B.E.', 'B.Sc', 'B.Com', 'B.A.', 'BBA', 'BCA', 'Other'],
  'masters': ['M.Tech/M.E.', 'M.Sc', 'M.Com', 'M.A.', 'MBA', 'MCA', 'Other'],
  'phd': ['PhD in Engineering', 'PhD in Science', 'PhD in Commerce', 'PhD in Arts', 'Other'],
  'other': ['Other'],
};

const majorOptions = [
  'Computer Science', 'Information Technology', 'Electronics & Communication',
  'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering',
  'Biotechnology', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'Business Administration', 'Economics', 'Finance', 'Marketing', 'Psychology', 'Other',
];

const technicalSkillOptions = [
  'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'HTML/CSS',
  'SQL', 'MongoDB', 'Git', 'AWS', 'Docker', 'Machine Learning',
  'Data Analysis', 'UI/UX Design', 'Mobile Development', 'DevOps',
];

const interestOptions = [
  'Web Development', 'Mobile App Development', 'Data Science',
  'Machine Learning', 'Artificial Intelligence', 'Cybersecurity',
  'Cloud Computing', 'DevOps', 'UI/UX Design', 'Product Management',
  'Digital Marketing', 'Business Analytics', 'Blockchain', 'IoT',
];

const learningStyles = [
  'Visual (videos, diagrams)', 'Auditory (lectures, podcasts)',
  'Reading/Writing (articles, notes)', 'Kinesthetic (hands-on practice)', 'Mixed approach',
];

const locationOptions = [
  'Mumbai, India', 'Delhi, India', 'Bangalore, India', 'Hyderabad, India',
  'Chennai, India', 'Kolkata, India', 'Pune, India', 'Ahmedabad, India',
  'Jaipur, India', 'Nagpur, India', 'Other',
];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPicker, setShowPicker] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    firstName: '', lastName: '', email: '', phone: '', age: '', location: '',
    education: '', degree: '', major: '', graduationYear: '', currentGPA: '',
    careerStage: '', currentRole: '', experience: '', industry: '',
    technicalSkills: [] as string[], softSkills: [] as string[], interests: [] as string[],
    careerGoals: '', learningStyle: '', timeCommitment: '', budget: '',
    codingExperience: '', projectExperience: '', onlineLearning: '', certifications: [] as string[],
  });

  const handleChange = (field: string, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const toggleArrayItem = (field: string, value: string) => {
    setProfileData(prev => {
      const arr = (prev as any)[field] as string[];
      const updated = arr.includes(value) ? arr.filter(i => i !== value) : [...arr, value];
      return { ...prev, [field]: updated };
    });
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    switch (step) {
      case 1:
        if (!profileData.firstName.trim()) newErrors.firstName = 'First name is required';
        else if (profileData.firstName.trim().length < 2) newErrors.firstName = 'Min 2 characters';
        if (!profileData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!profileData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(profileData.email))
          newErrors.email = 'Invalid email address';
        if (!profileData.age) newErrors.age = 'Age is required';
        else if (parseInt(profileData.age) < 16 || parseInt(profileData.age) > 100)
          newErrors.age = 'Age must be 16-100';
        if (!profileData.location) newErrors.location = 'Location is required';
        break;
      case 2:
        if (!profileData.education) newErrors.education = 'Education level is required';
        if (profileData.education && profileData.education !== 'high-school' && !profileData.degree)
          newErrors.degree = 'Degree is required';
        if (['bachelors', 'masters', 'phd'].includes(profileData.education) && !profileData.major)
          newErrors.major = 'Major is required';
        if (!profileData.graduationYear) newErrors.graduationYear = 'Graduation year is required';
        break;
      case 3:
        if (!profileData.careerStage) newErrors.careerStage = 'Career stage is required';
        if (profileData.careerStage && !profileData.careerStage.includes('Student')) {
          if (!profileData.experience) newErrors.experience = 'Experience is required';
          if (!profileData.currentRole) newErrors.currentRole = 'Current role is required';
        }
        break;
      case 4:
        if (profileData.interests.length === 0) newErrors.interests = 'Select at least one interest';
        if (profileData.interests.length > 5) newErrors.interests = 'Max 5 interests';
        break;
      case 5:
        if (!profileData.careerGoals.trim()) newErrors.careerGoals = 'Career goals are required';
        else if (profileData.careerGoals.trim().length < 50)
          newErrors.careerGoals = 'At least 50 characters required';
        if (!profileData.learningStyle) newErrors.learningStyle = 'Learning style is required';
        if (!profileData.timeCommitment) newErrors.timeCommitment = 'Time commitment is required';
        if (!profileData.budget) newErrors.budget = 'Budget preference is required';
        break;
      case 6: break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 6) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    }
  };

  const prevStep = () => {
    if (currentStep > 1) { setCurrentStep(currentStep - 1); setErrors({}); }
  };

  const handleComplete = async () => {
    if (validateStep(currentStep)) {
      await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
      router.push('/setup/assessment-intro');
    }
  };

  const yearOptions = Array.from({ length: 31 }, (_, i) => (new Date().getFullYear() + 10 - i).toString());

  // Picker modal
  const renderPicker = (field: string, options: { value: string; label: string }[] | string[], title: string) => {
    if (showPicker !== field) return null;
    const items = typeof options[0] === 'string'
      ? (options as string[]).map(o => ({ value: o, label: o }))
      : options as { value: string; label: string }[];
    return (
      <View style={styles.pickerOverlay}>
        <TouchableOpacity style={styles.pickerBackdrop} activeOpacity={1} onPress={() => setShowPicker(null)} />
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>{title}</Text>
            <TouchableOpacity onPress={() => setShowPicker(null)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.pickerScroll}>
            {items.map(item => (
              <TouchableOpacity key={item.value}
                style={[styles.pickerItem, (profileData as any)[field] === item.value && styles.pickerItemActive]}
                onPress={() => {
                  handleChange(field, item.value);
                  if (field === 'education') { handleChange('degree', ''); handleChange('major', ''); }
                  setShowPicker(null);
                }}>
                <Text style={[styles.pickerItemText,
                  (profileData as any)[field] === item.value && styles.pickerItemTextActive
                ]}>{item.label}</Text>
                {(profileData as any)[field] === item.value && <Ionicons name="checkmark" size={20} color="#6366f1" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderDropdown = (field: string, placeholder: string, options: any[], _title: string) => (
    <TouchableOpacity style={[styles.dropdown, errors[field] ? styles.inputError : null]}
      onPress={() => setShowPicker(field)}>
      <Text style={[styles.dropdownText, !(profileData as any)[field] && styles.placeholderText]}>
        {(typeof options[0] === 'string' || typeof options[0] === 'number'
          ? (profileData as any)[field]
          : (options as { value: string; label: string }[]).find(o => o.value === (profileData as any)[field])?.label
        ) || placeholder}
      </Text>
      <Ionicons name="chevron-down" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.label}>First Name *</Text>
          <TextInput style={[styles.input, errors.firstName && styles.inputError]}
            value={profileData.firstName} onChangeText={v => handleChange('firstName', v)}
            placeholder="First name" placeholderTextColor="#9ca3af" />
          {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
        </View>
        <View style={styles.halfField}>
          <Text style={styles.label}>Last Name *</Text>
          <TextInput style={[styles.input, errors.lastName && styles.inputError]}
            value={profileData.lastName} onChangeText={v => handleChange('lastName', v)}
            placeholder="Last name" placeholderTextColor="#9ca3af" />
          {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
        </View>
      </View>
      <Text style={styles.label}>Email *</Text>
      <TextInput style={[styles.input, errors.email && styles.inputError]}
        value={profileData.email} onChangeText={v => handleChange('email', v)}
        placeholder="Email address" keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#9ca3af" />
      {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

      <Text style={styles.label}>Phone</Text>
      <TextInput style={styles.input} value={profileData.phone}
        onChangeText={v => handleChange('phone', v.replace(/[^0-9]/g, '').slice(0, 10))}
        placeholder="10 digit mobile number" keyboardType="phone-pad" maxLength={10} placeholderTextColor="#9ca3af" />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.label}>Age *</Text>
          <TextInput style={[styles.input, errors.age && styles.inputError]}
            value={profileData.age} onChangeText={v => handleChange('age', v.replace(/[^0-9]/g, ''))}
            placeholder="Age" keyboardType="number-pad" maxLength={3} placeholderTextColor="#9ca3af" />
          {errors.age ? <Text style={styles.errorText}>{errors.age}</Text> : null}
        </View>
        <View style={styles.halfField}>
          <Text style={styles.label}>Location *</Text>
          {renderDropdown('location', 'Select location', locationOptions, 'Location')}
          {errors.location ? <Text style={styles.errorText}>{errors.location}</Text> : null}
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>Educational Background</Text>
      <Text style={styles.label}>Highest Education *</Text>
      {renderDropdown('education', 'Select education level', educationLevels, 'Education Level')}
      {errors.education ? <Text style={styles.errorText}>{errors.education}</Text> : null}

      {profileData.education ? (
        <>
          <Text style={styles.label}>Degree/Program {profileData.education !== 'high-school' ? '*' : ''}</Text>
          {renderDropdown('degree', 'Select degree', degreeOptions[profileData.education] || [], 'Degree')}
          {errors.degree ? <Text style={styles.errorText}>{errors.degree}</Text> : null}
        </>
      ) : null}

      {['bachelors', 'masters', 'phd'].includes(profileData.education) ? (
        <>
          <Text style={styles.label}>Major/Field of Study *</Text>
          {renderDropdown('major', 'Select major', majorOptions, 'Major')}
          {errors.major ? <Text style={styles.errorText}>{errors.major}</Text> : null}
        </>
      ) : null}

      {profileData.education ? (
        <>
          <Text style={styles.label}>Graduation Year *</Text>
          {renderDropdown('graduationYear', 'Select year', yearOptions, 'Graduation Year')}
          {errors.graduationYear ? <Text style={styles.errorText}>{errors.graduationYear}</Text> : null}
        </>
      ) : null}

      <Text style={styles.label}>Current GPA/Percentage</Text>
      <TextInput style={styles.input} value={profileData.currentGPA}
        onChangeText={v => handleChange('currentGPA', v)}
        placeholder="e.g., 3.8/4.0 or 85%" placeholderTextColor="#9ca3af" />
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>Experience & Career</Text>
      <Text style={styles.label}>Career Stage *</Text>
      {renderDropdown('careerStage', 'Select career stage', careerStages, 'Career Stage')}
      {errors.careerStage ? <Text style={styles.errorText}>{errors.careerStage}</Text> : null}

      {profileData.careerStage && !profileData.careerStage.includes('Student') ? (
        <>
          <Text style={styles.label}>Current Role/Position *</Text>
          <TextInput style={[styles.input, errors.currentRole && styles.inputError]}
            value={profileData.currentRole} onChangeText={v => handleChange('currentRole', v)}
            placeholder="e.g., Software Engineer" placeholderTextColor="#9ca3af" />
          {errors.currentRole ? <Text style={styles.errorText}>{errors.currentRole}</Text> : null}

          <Text style={styles.label}>Years of Experience *</Text>
          {renderDropdown('experience', 'Select experience',
            ['No experience', '0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years'], 'Experience')}
          {errors.experience ? <Text style={styles.errorText}>{errors.experience}</Text> : null}
        </>
      ) : null}

      {profileData.careerStage ? (
        <>
          <Text style={styles.label}>Industry</Text>
          <TextInput style={styles.input} value={profileData.industry}
            onChangeText={v => handleChange('industry', v)}
            placeholder="e.g., Technology, Healthcare" placeholderTextColor="#9ca3af" />
        </>
      ) : null}
    </View>
  );

  const renderStep4 = () => (
    <View>
      <Text style={styles.stepTitle}>Skills & Interests</Text>
      <Text style={styles.label}>Technical Skills</Text>
      <View style={styles.chipContainer}>
        {technicalSkillOptions.map(skill => (
          <TouchableOpacity key={skill}
            style={[styles.chip, profileData.technicalSkills.includes(skill) && styles.chipActive]}
            onPress={() => toggleArrayItem('technicalSkills', skill)}>
            <Text style={[styles.chipText, profileData.technicalSkills.includes(skill) && styles.chipTextActive]}>
              {skill}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { marginTop: 16 }]}>Areas of Interest * (1-5)</Text>
      <View style={styles.chipContainer}>
        {interestOptions.map(interest => (
          <TouchableOpacity key={interest}
            style={[styles.chip, profileData.interests.includes(interest) && styles.chipActive,
              !profileData.interests.includes(interest) && profileData.interests.length >= 5 && styles.chipDisabled]}
            onPress={() => {
              if (profileData.interests.includes(interest) || profileData.interests.length < 5)
                toggleArrayItem('interests', interest);
            }}>
            <Text style={[styles.chipText, profileData.interests.includes(interest) && styles.chipTextActive]}>
              {interest}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.counterText}>Selected: {profileData.interests.length}/5</Text>
      {errors.interests ? <Text style={styles.errorText}>{errors.interests}</Text> : null}
    </View>
  );

  const renderStep5 = () => (
    <View>
      <Text style={styles.stepTitle}>Goals & Preferences</Text>
      <Text style={styles.label}>Career Goals * (50-500 chars)</Text>
      <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }, errors.careerGoals && styles.inputError]}
        value={profileData.careerGoals}
        onChangeText={v => { if (v.length <= 500) handleChange('careerGoals', v); }}
        placeholder="Describe your career aspirations..." multiline numberOfLines={4} placeholderTextColor="#9ca3af" />
      <Text style={[styles.counterText, profileData.careerGoals.length < 50 && { color: '#ef4444' }]}>
        {profileData.careerGoals.length}/500 characters
      </Text>
      {errors.careerGoals ? <Text style={styles.errorText}>{errors.careerGoals}</Text> : null}

      <Text style={styles.label}>Preferred Learning Style *</Text>
      {renderDropdown('learningStyle', 'Select learning style', learningStyles, 'Learning Style')}
      {errors.learningStyle ? <Text style={styles.errorText}>{errors.learningStyle}</Text> : null}

      <Text style={styles.label}>Time Commitment *</Text>
      {renderDropdown('timeCommitment', 'Select time',
        ['1-3 hours/week', '4-6 hours/week', '7-10 hours/week', '10+ hours/week'], 'Time Commitment')}
      {errors.timeCommitment ? <Text style={styles.errorText}>{errors.timeCommitment}</Text> : null}

      <Text style={styles.label}>Budget for Learning *</Text>
      {renderDropdown('budget', 'Select budget',
        ['Free resources only', '₹0 - ₹5,000', '₹5,000 - ₹20,000', '₹20,000+'], 'Budget')}
      {errors.budget ? <Text style={styles.errorText}>{errors.budget}</Text> : null}
    </View>
  );

  const renderStep6 = () => (
    <View>
      <Text style={styles.stepTitle}>Background Questions</Text>
      <Text style={styles.label}>Programming/Coding Experience</Text>
      {renderDropdown('codingExperience', 'Select your level',
        ['No experience', 'Basic (Hello World)', 'Intermediate (small projects)', 'Advanced (professional)'],
        'Coding Experience')}

      <Text style={styles.label}>Project Experience</Text>
      <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
        value={profileData.projectExperience} onChangeText={v => handleChange('projectExperience', v)}
        placeholder="Describe any projects..." multiline numberOfLines={3} placeholderTextColor="#9ca3af" />

      <Text style={styles.label}>Online Learning Experience</Text>
      {renderDropdown('onlineLearning', 'Select experience',
        ['No experience', 'Some experience', 'Extensive experience'], 'Online Learning')}

      <Text style={styles.label}>Current Certifications</Text>
      <TextInput style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
        value={profileData.certifications.join(', ')}
        onChangeText={v => handleChange('certifications', v.split(',').map((s: string) => s.trim()).filter(Boolean))}
        placeholder="List certifications (comma separated)" multiline placeholderTextColor="#9ca3af" />
    </View>
  );

  const stepRenderers = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6];

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Welcome to Skill Pilot!</Text>
          <Text style={styles.headerSubtitle}>Set up your profile for a personalized career roadmap</Text>
        </View>

        <View style={styles.progressContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stepsRow}>
            {steps.map((step, index) => (
              <View key={step.id} style={styles.stepWrapper}>
                <View style={[styles.stepCircle, currentStep >= step.id && styles.stepCircleActive]}>
                  {currentStep > step.id
                    ? <Ionicons name="checkmark" size={14} color="#fff" />
                    : <Ionicons name={step.icon as any} size={14} color={currentStep >= step.id ? '#fff' : '#9ca3af'} />}
                </View>
                <Text style={[styles.stepLabel, currentStep >= step.id && styles.stepLabelActive]} numberOfLines={1}>
                  {step.title}
                </Text>
                {index < steps.length - 1 && <View style={[styles.stepLine, currentStep > step.id && styles.stepLineActive]} />}
              </View>
            ))}
          </ScrollView>
          <Text style={styles.stepCounter}>Step {currentStep} of {steps.length}</Text>
        </View>

        {Object.keys(errors).length > 0 && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color="#dc2626" />
            <Text style={styles.errorBannerText}>Please fix the errors below</Text>
          </View>
        )}

        <ScrollView style={styles.formScroll} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
          {stepRenderers[currentStep - 1]()}
        </ScrollView>

        <View style={styles.navButtons}>
          <TouchableOpacity style={[styles.navBtn, styles.prevBtn]} onPress={prevStep} disabled={currentStep === 1}>
            <Text style={[styles.prevBtnText, currentStep === 1 && { opacity: 0.4 }]}>Previous</Text>
          </TouchableOpacity>
          {currentStep === 6 ? (
            <TouchableOpacity style={[styles.navBtn, styles.nextBtn]} onPress={handleComplete}>
              <Text style={styles.nextBtnText}>Complete Setup</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.navBtn, styles.nextBtn]} onPress={nextStep}>
              <Text style={styles.nextBtnText}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      {renderPicker('location', locationOptions, 'Select Location')}
      {renderPicker('education', educationLevels, 'Education Level')}
      {profileData.education ? renderPicker('degree', degreeOptions[profileData.education] || [], 'Select Degree') : null}
      {renderPicker('major', majorOptions, 'Select Major')}
      {renderPicker('graduationYear', yearOptions, 'Graduation Year')}
      {renderPicker('careerStage', careerStages, 'Career Stage')}
      {renderPicker('experience', ['No experience', '0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years'], 'Experience')}
      {renderPicker('learningStyle', learningStyles, 'Learning Style')}
      {renderPicker('timeCommitment', ['1-3 hours/week', '4-6 hours/week', '7-10 hours/week', '10+ hours/week'], 'Time Commitment')}
      {renderPicker('budget', ['Free resources only', '₹0 - ₹5,000', '₹5,000 - ₹20,000', '₹20,000+'], 'Budget')}
      {renderPicker('codingExperience', ['No experience', 'Basic (Hello World)', 'Intermediate (small projects)', 'Advanced (professional)'], 'Coding Experience')}
      {renderPicker('onlineLearning', ['No experience', 'Some experience', 'Extensive experience'], 'Online Learning')}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#fff', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#111827' },
  headerSubtitle: { fontSize: 13, color: '#6b7280', marginTop: 4, textAlign: 'center' },
  progressContainer: { backgroundColor: '#fff', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  stepsRow: { flexDirection: 'row', paddingHorizontal: 12, paddingTop: 10, alignItems: 'center' },
  stepWrapper: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' },
  stepCircleActive: { backgroundColor: '#6366f1' },
  stepLabel: { fontSize: 10, color: '#9ca3af', marginLeft: 3, maxWidth: 52 },
  stepLabelActive: { color: '#6366f1', fontWeight: '600' },
  stepLine: { width: 10, height: 2, backgroundColor: '#e5e7eb', marginHorizontal: 2 },
  stepLineActive: { backgroundColor: '#6366f1' },
  stepCounter: { fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 6 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', paddingHorizontal: 16, paddingVertical: 10, marginHorizontal: 16, marginTop: 8, borderRadius: 8, borderWidth: 1, borderColor: '#fecaca' },
  errorBannerText: { fontSize: 13, color: '#dc2626', marginLeft: 8, fontWeight: '500' },
  formScroll: { flex: 1 },
  formContent: { padding: 16, paddingBottom: 30 },
  stepTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827' },
  inputError: { borderColor: '#ef4444' },
  errorText: { fontSize: 12, color: '#ef4444', marginTop: 4 },
  counterText: { fontSize: 11, color: '#9ca3af', marginTop: 4, textAlign: 'right' },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  dropdown: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdownText: { fontSize: 15, color: '#111827', flex: 1 },
  placeholderText: { color: '#9ca3af' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#f3f4f6', borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb' },
  chipActive: { backgroundColor: '#eef2ff', borderColor: '#6366f1' },
  chipDisabled: { opacity: 0.4 },
  chipText: { fontSize: 13, color: '#374151' },
  chipTextActive: { color: '#6366f1', fontWeight: '600' },
  navButtons: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  navBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 10 },
  prevBtn: { backgroundColor: '#f3f4f6' },
  prevBtnText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  nextBtn: { backgroundColor: '#6366f1' },
  nextBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  pickerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end', zIndex: 100 },
  pickerBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  pickerContainer: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%', paddingBottom: 30 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  pickerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  pickerScroll: { paddingHorizontal: 20 },
  pickerItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  pickerItemActive: { backgroundColor: '#eef2ff' },
  pickerItemText: { fontSize: 15, color: '#374151' },
  pickerItemTextActive: { color: '#6366f1', fontWeight: '600' },
});
