import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { register } from '../../src/store/slices/authSlice';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    careerStage: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showCareerPicker, setShowCareerPicker] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state: any) => state.auth);

  const careerStages = [
    'Student',
    'Fresh Graduate',
    'Early Career (0-2 years)',
    'Mid Career (3-7 years)',
    'Senior (8+ years)',
    'Career Changer',
  ];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleRegister = async () => {
    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const email = formData.email.trim().toLowerCase();
    const { password, confirmPassword } = formData;

    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      Alert.alert('Terms Required', 'Please agree to the Terms of Service.');
      return;
    }

    try {
      const result = await dispatch(register({
        firstName,
        lastName,
        email,
        password,
      }) as any);

      if (register.fulfilled.match(result)) {
        router.replace('/setup');
      } else {
        const msg = (result.payload as string) || 'Registration failed. Please try again.';
        Alert.alert('Registration Failed', msg);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="flash" size={40} color="#6366f1" />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start your learning journey today</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John"
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                autoCapitalize="words"
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Doe"
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="john@example.com"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="25"
                value={formData.age}
                onChangeText={(text) => setFormData({ ...formData, age: text })}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Career Stage</Text>
              <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowCareerPicker(!showCareerPicker)}>
                <Text style={[styles.pickerBtnText, !formData.careerStage && { color: '#9ca3af' }]}>
                  {formData.careerStage || 'Select...'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>

          {showCareerPicker && (
            <View style={styles.pickerDropdown}>
              {careerStages.map((stage) => (
                <TouchableOpacity
                  key={stage}
                  style={[styles.pickerOption, formData.careerStage === stage && styles.pickerOptionActive]}
                  onPress={() => {
                    setFormData({ ...formData, careerStage: stage });
                    setShowCareerPicker(false);
                  }}
                >
                  <Text style={[styles.pickerOptionText, formData.careerStage === stage && styles.pickerOptionTextActive]}>
                    {stage}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.termsRow} onPress={() => setAgreeTerms(!agreeTerms)}>
            <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
              {agreeTerms && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.link}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  eyeIcon: {
    padding: 12,
  },
  button: {
    backgroundColor: '#6366f1',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  link: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  pickerBtn: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  pickerBtnText: {
    fontSize: 15,
    color: '#111827',
  },
  pickerDropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 16,
    marginTop: -8,
    overflow: 'hidden',
  },
  pickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  pickerOptionActive: {
    backgroundColor: '#eef2ff',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  pickerOptionTextActive: {
    color: '#6366f1',
    fontWeight: '600',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: '#6b7280',
  },
  termsLink: {
    color: '#6366f1',
    fontWeight: '600',
  },
});
