import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDashboard, getProfile } from '../../src/store/slices/userSlice';
import { getCourseRecommendations } from '../../src/store/slices/courseSlice';

const { width } = Dimensions.get('window');

const courseSuggestions: Record<string, any[]> = {
  'ai-ml': [
    { id: 'ml-basics-1', title: 'Machine Learning Fundamentals', provider: 'Coursera', platform: 'coursera', rating: 4.9, duration: '4 weeks', level: 'Beginner', progress: 0, totalQuizzes: 6, completedQuizzes: 0, skills: ['Python', 'Machine Learning', 'NumPy'], description: 'Learn the basics of machine learning algorithms.', matchScore: 98, url: 'https://www.coursera.org/learn/machine-learning' },
    { id: 'deep-learning-1', title: 'Deep Learning Specialization', provider: 'DeepLearning.AI', platform: 'coursera', rating: 4.8, duration: '3 months', level: 'Intermediate', progress: 0, totalQuizzes: 5, completedQuizzes: 0, skills: ['Neural Networks', 'TensorFlow', 'PyTorch'], description: 'Master deep learning and build neural networks.', matchScore: 95, url: 'https://www.coursera.org/specializations/deep-learning' },
    { id: 'python-ml-1', title: 'Python for Data Science', provider: 'IIT Madras', platform: 'nptel', rating: 4.7, duration: '8 weeks', level: 'Beginner', progress: 0, totalQuizzes: 6, completedQuizzes: 0, skills: ['Python', 'Pandas', 'Data Analysis'], description: 'Comprehensive Python for data science applications.', matchScore: 92, url: 'https://nptel.ac.in/courses/106106212' },
  ],
  'data-science': [
    { id: 'data-analysis-1', title: 'Data Analysis with Python', provider: 'University of Michigan', platform: 'coursera', rating: 4.6, duration: '4 weeks', level: 'Beginner', progress: 0, totalQuizzes: 5, completedQuizzes: 0, skills: ['Python', 'Pandas', 'Data Visualization'], description: 'Learn data analysis techniques using Python.', matchScore: 97, url: 'https://www.coursera.org/specializations/data-analysis-python' },
    { id: 'sql-basics-1', title: 'SQL for Data Science', provider: 'IBM', platform: 'coursera', rating: 4.7, duration: '3 weeks', level: 'Beginner', progress: 0, totalQuizzes: 6, completedQuizzes: 0, skills: ['SQL', 'Database', 'Data Querying'], description: 'Master SQL for data science and analytics.', matchScore: 94, url: 'https://www.coursera.org/learn/sql-for-data-science' },
    { id: 'stats-ds-1', title: 'Statistics for Data Science', provider: 'IIT Bombay', platform: 'nptel', rating: 4.5, duration: '10 weeks', level: 'Intermediate', progress: 0, totalQuizzes: 5, completedQuizzes: 0, skills: ['Statistics', 'Probability', 'R'], description: 'Statistical methods for data science applications.', matchScore: 90, url: 'https://nptel.ac.in/courses/103108065' },
  ],
  'fullstack': [
    { id: 'react-basics-1', title: 'React - The Complete Guide', provider: 'Meta', platform: 'coursera', rating: 4.8, duration: '6 weeks', level: 'Beginner', progress: 0, totalQuizzes: 6, completedQuizzes: 0, skills: ['React', 'JavaScript', 'Frontend'], description: 'Master React.js from basics to advanced concepts.', matchScore: 96, url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer' },
    { id: 'nodejs-basics-1', title: 'Node.js Backend Development', provider: 'IBM', platform: 'coursera', rating: 4.7, duration: '5 weeks', level: 'Intermediate', progress: 0, totalQuizzes: 5, completedQuizzes: 0, skills: ['Node.js', 'Express', 'MongoDB'], description: 'Build scalable backend applications with Node.js.', matchScore: 93, url: 'https://www.coursera.org/specializations/node-js' },
    { id: 'web-dev-1', title: 'Full Stack Web Development', provider: 'IIT Kharagpur', platform: 'nptel', rating: 4.6, duration: '12 weeks', level: 'Beginner', progress: 0, totalQuizzes: 6, completedQuizzes: 0, skills: ['HTML', 'CSS', 'JavaScript', 'PHP'], description: 'Complete web development from frontend to backend.', matchScore: 91, url: 'https://nptel.ac.in/courses/106105084' },
  ],
};

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'coursera': return '🎓';
    case 'nptel': return '🏛️';
    case 'swayam': return '🇮🇳';
    default: return '📚';
  }
};

const getPlatformColor = (platform: string): [string, string] => {
  switch (platform) {
    case 'coursera': return ['#60a5fa', '#2563eb'];
    case 'nptel': return ['#a78bfa', '#7c3aed'];
    case 'swayam': return ['#4ade80', '#16a34a'];
    default: return ['#9ca3af', '#4b5563'];
  }
};

export default function DashboardScreen() {
  const router = useRouter();
  const dispatch = useDispatch<any>();
  const { user } = useSelector((state: any) => state.auth);
  const { profile, dashboardData, isLoading: userLoading } = useSelector((state: any) => state.user);
  const { recommendations: courseRecs } = useSelector((state: any) => state.course);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizCourse, setQuizCourse] = useState<any>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizDone, setQuizDone] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);

  const [userProfile, setUserProfile] = useState<any>(null);
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [assessmentResults, setAssessmentResults] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [jobFitScore, setJobFitScore] = useState(0);
  const [skillProgressData, setSkillProgressData] = useState<Record<string, number>>({});
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([]);

  useEffect(() => {
    // Fetch from backend
    dispatch(getDashboard());
    dispatch(getProfile());
    dispatch(getCourseRecommendations());
    // Also load from AsyncStorage as fallback
    loadLocalData();
  }, []);

  // When backend data arrives, update local state
  useEffect(() => {
    if (dashboardData) {
      if (dashboardData.assessmentResults) setAssessmentResults(dashboardData.assessmentResults);
      if (dashboardData.achievements) setAchievements(dashboardData.achievements);
      if (dashboardData.jobFitScore) setJobFitScore(dashboardData.jobFitScore);
      if (dashboardData.skillProgress) setSkillProgressData(dashboardData.skillProgress);
    }
  }, [dashboardData]);

  useEffect(() => {
    if (profile) {
      setUserProfile(profile);
    }
  }, [profile]);

  // Use backend course recommendations if available
  useEffect(() => {
    if (courseRecs && courseRecs.length > 0) {
      setRecommendedCourses(courseRecs.map((c: any, i: number) => ({
        id: c._id || `rec-${i}`,
        title: c.title || 'Course',
        provider: c.provider || 'Online',
        platform: 'coursera',
        rating: c.rating || 4.5,
        duration: c.duration || 'Self-paced',
        level: c.difficulty || 'Beginner',
        progress: 0,
        totalQuizzes: 5,
        completedQuizzes: 0,
        skills: c.skills || [],
        description: c.description || '',
        matchScore: c.matchScore || 90,
      })));
    }
  }, [courseRecs]);

  const loadLocalData = async () => {
    try {
      const [profileStr, roadmapStr, assessmentStr, achieveStr] = await Promise.all([
        AsyncStorage.getItem('userProfile'),
        AsyncStorage.getItem('careerRoadmap'),
        AsyncStorage.getItem('assessmentResults'),
        AsyncStorage.getItem('achievements'),
      ]);
      const localProfile = profileStr ? JSON.parse(profileStr) : {};
      const roadmap = roadmapStr ? JSON.parse(roadmapStr) : {};
      const assessment = assessmentStr ? JSON.parse(assessmentStr) : {};
      const achvs = achieveStr ? JSON.parse(achieveStr) : [];

      // Only use local data if backend data hasn't arrived
      if (!profile) setUserProfile(localProfile);
      setRoadmapData(roadmap);
      if (!dashboardData?.assessmentResults) setAssessmentResults(assessment);
      if (!dashboardData?.achievements) setAchievements(achvs);

      // Calculate job-fit score
      const p = profile || localProfile;
      if (p?.firstName && roadmap?.careerPath && assessment?.scores) {
        let score = 0;
        const scores = assessment.scores as Record<string, number>;
        const avgScore = Object.values(scores).reduce((a: number, b: number) => a + b, 0) / Object.keys(scores).length;
        score += avgScore * 0.4;
        const userSkills: string[] = p.technicalSkills || p.skills?.map((s: any) => s.name) || [];
        const requiredSkills: string[] = (Object.values(roadmap.skills || {}) as string[]).flat();
        const skillMatch = userSkills.filter((s: string) =>
          requiredSkills.some((r: string) => r.toLowerCase().includes(s.toLowerCase()))
        ).length / Math.max(requiredSkills.length, 1);
        score += skillMatch * 100 * 0.3;
        score += 50 * 0.3; // interest baseline
        if (!dashboardData?.jobFitScore) setJobFitScore(Math.min(Math.round(score), 100));

        // Skill progress
        const progress: Record<string, number> = {};
        if (roadmap.skills) {
          Object.entries(roadmap.skills).forEach(([cat, skills]: [string, any]) => {
            const matched = skills.filter((s: string) =>
              userSkills.some((us: string) =>
                us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase())
              )
            );
            progress[cat] = Math.round((matched.length / skills.length) * 100);
          });
        }
        if (!dashboardData?.skillProgress) setSkillProgressData(progress);
      }

      // Load recommended courses (local fallback)
      if (!courseRecs || courseRecs.length === 0) {
        const careerPathId = roadmap?.careerPath?.id || 'fullstack';
        const courses = courseSuggestions[careerPathId] || courseSuggestions['fullstack'];
        setRecommendedCourses(courses);
      }
    } catch (e) {
      // Fallback to defaults
      if (!courseRecs || courseRecs.length === 0) {
        setRecommendedCourses(courseSuggestions['fullstack']);
      }
    }
  };

  const displayName = userProfile?.firstName || user?.firstName || 'User';
  const hasRoadmap = roadmapData?.careerPath;
  const hasAssessment = assessmentResults?.scores;

  const stats = [
    {
      icon: 'checkmark-circle-outline',
      label: 'Job-Fit Score',
      value: jobFitScore > 0 ? `${jobFitScore}%` : '—',
      color: jobFitScore >= 80 ? '#16a34a' : jobFitScore >= 60 ? '#ca8a04' : '#6366f1',
    },
    { icon: 'flash-outline', label: 'Career Matches', value: hasRoadmap ? '1' : '0', color: '#16a34a' },
    { icon: 'clipboard-outline', label: 'Assessments', value: hasAssessment ? '1' : '0', color: '#2563eb' },
    { icon: 'trophy-outline', label: 'Achievements', value: `${achievements.length}`, color: '#7c3aed' },
  ];

  const quickActions = [
    { icon: 'clipboard-outline', label: 'Take Assessment', desc: 'Discover your skills', route: '/(dashboard)/assessments', color: '#8b5cf6' },
    { icon: 'briefcase-outline', label: 'Explore Careers', desc: 'Find your match', route: '/(dashboard)/careers', color: '#3b82f6' },
    { icon: 'book-outline', label: 'Browse Courses', desc: 'Upskill with courses', route: '/(dashboard)/courses', color: '#10b981' },
    { icon: 'people-outline', label: 'Find Mentors', desc: 'Connect with experts', route: '/(dashboard)/mentorship', color: '#7c3aed' },
  ];

  const featuredMentors = [
    {
      id: 1,
      name: 'Yash Dharme',
      title: 'Senior Software Engineer',
      company: 'Google',
      avatar: '👨‍💻',
      rating: 4.9,
      sessions: 127,
      skills: ['React', 'Node.js', 'System Design'],
      availability: 'Available',
      color: '#6366f1',
      responseTime: '< 2 hrs',
    },
    {
      id: 2,
      name: 'Maithili Dorkhande',
      title: 'Data Science Manager',
      company: 'Netflix',
      avatar: '👩‍🔬',
      rating: 4.8,
      sessions: 89,
      skills: ['Python', 'Machine Learning', 'Statistics'],
      availability: 'Busy',
      color: '#8b5cf6',
      responseTime: '< 4 hrs',
    },
    {
      id: 3,
      name: 'Harkirat Singh',
      title: 'Lead UX Designer',
      company: 'Apple',
      avatar: '👨‍🎨',
      rating: 4.9,
      sessions: 156,
      skills: ['Figma', 'User Research', 'Design Systems'],
      availability: 'Available',
      color: '#10b981',
      responseTime: '< 1 hr',
    },
  ];

  const recentActivity = [
    { title: 'Completed Personality Assessment', desc: 'Scored high in analytical thinking', time: '2 hours ago', icon: 'checkmark-circle', color: '#6366f1' },
    { title: 'New Career Match Found', desc: 'Data Scientist - 95% match', time: '1 day ago', icon: 'flash', color: '#16a34a' },
    { title: 'Course Recommendation', desc: 'Machine Learning Basics on Coursera', time: '2 days ago', icon: 'book', color: '#2563eb' },
  ];

  // Fallback skill progress for display
  const displaySkillProgress = Object.keys(skillProgressData).length > 0
    ? Object.entries(skillProgressData).map(([name, level]) => ({
      name: name.replace(/([A-Z])/g, ' $1').trim(),
      level,
      color: level >= 80 ? '#16a34a' : level >= 60 ? '#ca8a04' : level >= 40 ? '#f97316' : '#ef4444',
    }))
    : [
      { name: 'JavaScript', level: 85, color: '#f59e0b' },
      { name: 'Python', level: 72, color: '#3b82f6' },
      { name: 'React', level: 90, color: '#6366f1' },
      { name: 'Data Analysis', level: 60, color: '#10b981' },
      { name: 'SQL', level: 78, color: '#8b5cf6' },
    ];

  const OPENROUTER_API_KEY = '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';

  const handleEnroll = async (course: any) => {
    const url = course.url;
    if (url) {
      try {
        await Linking.openURL(url);
      } catch (e) {
        Alert.alert('Error', 'Could not open course link.');
      }
    } else {
      router.push('/(dashboard)/courses');
    }
  };

  const handleStartQuiz = async (course: any) => {
    setQuizCourse(course);
    setShowQuizModal(true);
    setQuizLoading(true);
    setQuizDone(false);
    setCurrentQ(0);
    setQuizAnswers([]);

    let generated: any[] = [];
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'X-Title': 'SkillPilot Mobile',
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [{
            role: 'user',
            content: `Generate 5 multiple choice quiz questions about ${course.title}. Each question should have 4 options and one correct answer.
Format as JSON array: [{"question":"...","options":["A","B","C","D"],"correctAnswer":0,"explanation":"..."}]
Return ONLY the JSON array, no markdown.`,
          }],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices[0].message.content;
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          generated = JSON.parse(jsonMatch[0]).slice(0, 5);
        }
      }
    } catch (e) {
      console.error('Quiz gen error:', e);
    }

    if (generated.length === 0) {
      generated = [
        { question: `What is a key concept in ${course.title}?`, options: ['Fundamentals', 'Advanced Topics', 'Best Practices', 'All of the above'], correctAnswer: 3, explanation: 'All are important aspects.' },
        { question: 'Which skill is most essential for this field?', options: ['Problem Solving', 'Communication', 'Technical Knowledge', 'All of these'], correctAnswer: 3, explanation: 'A combination of skills is needed.' },
        { question: 'What is the best learning approach?', options: ['Theory only', 'Practice only', 'Both theory and practice', 'Neither'], correctAnswer: 2, explanation: 'Combining theory with practice is most effective.' },
      ];
    }
    setQuizQuestions(generated);
    setQuizLoading(false);
  };

  const handleQuizAnswer = (idx: number) => {
    const newAnswers = [...quizAnswers, idx];
    setQuizAnswers(newAnswers);
    if (currentQ < quizQuestions.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 300);
    } else {
      setTimeout(() => setQuizDone(true), 300);
    }
  };

  const quizScore = quizDone
    ? quizQuestions.reduce((acc, q, i) => acc + (quizAnswers[i] === q.correctAnswer ? 1 : 0), 0)
    : 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Welcome Header */}
      <LinearGradient colors={['#6366f1', '#7c3aed']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Welcome to your career journey,</Text>
            <Text style={styles.name}>{displayName}! 🚀</Text>
            <Text style={styles.headerSub}>Let's continue building your path to success.</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/(dashboard)/profile')}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{displayName.charAt(0)}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={styles.statRow}>
              <View>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              </View>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
                <Ionicons name={stat.icon as any} size={22} color={stat.color} />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Recommended Courses */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>🎯 Recommended Courses</Text>
            <Text style={styles.sectionDesc}>Personalized based on your career path</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(dashboard)/courses')}>
            <Text style={styles.seeAll}>View All →</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recommendedCourses.map((course) => (
            <View key={course.id} style={styles.courseCard}>
              {/* Course Header with Platform */}
              <LinearGradient
                colors={getPlatformColor(course.platform)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.courseHeader}
              >
                <Text style={styles.coursePlatformIcon}>{getPlatformIcon(course.platform)}</Text>
                <Text style={styles.coursePlatformName}>{course.provider}</Text>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchBadgeText}>{course.matchScore}% Match</Text>
                </View>
              </LinearGradient>

              <View style={styles.courseBody}>
                <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
                <Text style={styles.courseDesc} numberOfLines={2}>{course.description}</Text>

                <View style={styles.courseMetaGrid}>
                  <View style={styles.courseMeta}>
                    <Text style={styles.courseMetaIcon}>⭐</Text>
                    <Text style={styles.courseMetaText}>{course.rating}</Text>
                  </View>
                  <View style={styles.courseMeta}>
                    <Text style={styles.courseMetaIcon}>⏱️</Text>
                    <Text style={styles.courseMetaText}>{course.duration}</Text>
                  </View>
                  <View style={styles.courseMeta}>
                    <Text style={styles.courseMetaIcon}>📊</Text>
                    <Text style={styles.courseMetaText}>{course.level}</Text>
                  </View>
                  <View style={styles.courseMeta}>
                    <Text style={styles.courseMetaIcon}>📝</Text>
                    <Text style={styles.courseMetaText}>{course.totalQuizzes} Quizzes</Text>
                  </View>
                </View>

                <View style={styles.courseSkillTags}>
                  {course.skills.slice(0, 3).map((skill: string, i: number) => (
                    <View key={i} style={styles.courseSkillTag}>
                      <Text style={styles.courseSkillTagText}>{skill}</Text>
                    </View>
                  ))}
                </View>

                {/* Progress Bar */}
                <View style={styles.courseProgressContainer}>
                  <View style={styles.courseProgressHeader}>
                    <Text style={styles.courseProgressLabel}>Progress</Text>
                    <Text style={styles.courseProgressPercent}>{course.progress}%</Text>
                  </View>
                  <View style={styles.courseProgressBar}>
                    <View style={[styles.courseProgressFill, { width: `${Math.max(course.progress, 2)}%` }]} />
                  </View>
                  <Text style={styles.courseQuizCount}>{course.completedQuizzes}/{course.totalQuizzes} quizzes</Text>
                </View>

                <View style={styles.courseActions}>
                  <TouchableOpacity style={styles.enrollBtn} onPress={() => handleEnroll(course)}>
                    <Text style={styles.enrollBtnText}>📚 Enroll</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quizBtn} onPress={() => handleStartQuiz(course)}>
                    <Text style={styles.quizBtnText}>📝 Quiz</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Career Path & Skill Progress */}
      {hasRoadmap && (
        <View style={styles.section}>
          <View style={styles.twoColRow}>
            {/* Career Path */}
            <View style={styles.halfCard}>
              <Text style={styles.cardTitle}>Your Career Path</Text>
              <LinearGradient
                colors={['#6366f1', '#8b5cf6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.careerPathBox}
              >
                <Text style={styles.careerPathEmoji}>{roadmapData.careerPath.icon || '💻'}</Text>
                <Text style={styles.careerPathTitle}>{roadmapData.careerPath.title}</Text>
                <Text style={styles.careerPathDesc} numberOfLines={2}>{roadmapData.careerPath.description}</Text>
              </LinearGradient>
              <View style={styles.careerDetails}>
                <View style={styles.careerDetailRow}>
                  <Text style={styles.careerDetailLabel}>Duration</Text>
                  <Text style={styles.careerDetailVal}>{roadmapData.careerPath.duration || '—'}</Text>
                </View>
                <View style={styles.careerDetailRow}>
                  <Text style={styles.careerDetailLabel}>Salary</Text>
                  <Text style={styles.careerDetailVal}>{roadmapData.careerPath.averageSalary || '—'}</Text>
                </View>
                <View style={styles.careerDetailRow}>
                  <Text style={styles.careerDetailLabel}>Growth</Text>
                  <Text style={[styles.careerDetailVal, { color: '#16a34a' }]}>{roadmapData.careerPath.jobGrowth || '—'}</Text>
                </View>
              </View>
            </View>

            {/* Skill Progress */}
            <View style={styles.halfCard}>
              <Text style={styles.cardTitle}>Skill Progress</Text>
              {displaySkillProgress.map((skill, index) => (
                <View key={index} style={styles.skillRow}>
                  <View style={styles.skillHeader}>
                    <Text style={styles.skillName} numberOfLines={1}>{skill.name}</Text>
                    <Text style={styles.skillPercent}>{skill.level}%</Text>
                  </View>
                  <View style={styles.skillBar}>
                    <View style={[styles.skillFill, { width: `${skill.level}%`, backgroundColor: skill.color }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Recent Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {achievements.slice(-4).map((a: any, i: number) => (
              <View key={i} style={styles.achievementCard}>
                <Text style={styles.achievementEmoji}>🏆</Text>
                <Text style={styles.achievementTitle} numberOfLines={1}>{a.title}</Text>
                <Text style={styles.achievementDesc} numberOfLines={2}>{a.description}</Text>
                <Text style={styles.achievementPoints}>{a.points} pts</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity key={index} style={styles.actionCard} onPress={() => router.push(action.route as any)}>
              <View style={[styles.actionIconBg, { backgroundColor: action.color + '15' }]}>
                <Ionicons name={action.icon as any} size={24} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
              <Text style={styles.actionDesc}>{action.desc}</Text>
              <View style={styles.actionArrow}>
                <Text style={[styles.actionArrowText, { color: action.color }]}>Get started →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Mentor Program */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>👨‍🏫 Mentor Program</Text>
            <Text style={styles.sectionDesc}>Connect with top industry experts</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(dashboard)/mentorship')}>
            <Text style={styles.seeAll}>View All →</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {featuredMentors.map((mentor) => (
            <View key={mentor.id} style={styles.mentorCard}>
              {/* Top gradient strip */}
              <LinearGradient
                colors={[mentor.color, mentor.color + 'aa']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.mentorCardStrip}
              />
              {/* Availability badge */}
              <View style={[
                styles.mentorAvailBadge,
                { backgroundColor: mentor.availability === 'Available' ? '#dcfce7' : '#fef3c7' }
              ]}>
                <View style={[
                  styles.mentorAvailDot,
                  { backgroundColor: mentor.availability === 'Available' ? '#16a34a' : '#d97706' }
                ]} />
                <Text style={[
                  styles.mentorAvailText,
                  { color: mentor.availability === 'Available' ? '#16a34a' : '#d97706' }
                ]}>{mentor.availability}</Text>
              </View>

              {/* Avatar */}
              <View style={[styles.mentorAvatarWrap, { borderColor: mentor.color }]}>
                <Text style={styles.mentorAvatar}>{mentor.avatar}</Text>
              </View>

              <Text style={styles.mentorName}>{mentor.name}</Text>
              <Text style={styles.mentorTitle} numberOfLines={1}>{mentor.title}</Text>
              <Text style={styles.mentorCompany}>🏢 {mentor.company}</Text>

              {/* Rating & Sessions */}
              <View style={styles.mentorStats}>
                <View style={styles.mentorStat}>
                  <Ionicons name="star" size={13} color="#f59e0b" />
                  <Text style={styles.mentorStatText}>{mentor.rating}</Text>
                </View>
                <View style={styles.mentorStatDivider} />
                <View style={styles.mentorStat}>
                  <Ionicons name="people-outline" size={13} color="#6b7280" />
                  <Text style={styles.mentorStatText}>{mentor.sessions} sessions</Text>
                </View>
                <View style={styles.mentorStatDivider} />
                <View style={styles.mentorStat}>
                  <Ionicons name="time-outline" size={13} color="#6b7280" />
                  <Text style={styles.mentorStatText}>{mentor.responseTime}</Text>
                </View>
              </View>

              {/* Skills */}
              <View style={styles.mentorSkills}>
                {mentor.skills.map((skill, i) => (
                  <View key={i} style={[styles.mentorSkillTag, { backgroundColor: mentor.color + '18' }]}>
                    <Text style={[styles.mentorSkillText, { color: mentor.color }]}>{skill}</Text>
                  </View>
                ))}
              </View>

              {/* Connect Button */}
              <TouchableOpacity
                style={[styles.mentorConnectBtn, { backgroundColor: mentor.color }]}
                onPress={() => router.push('/(dashboard)/mentorship')}
                activeOpacity={0.85}
              >
                <Ionicons name="chatbubble-outline" size={14} color="#fff" />
                <Text style={styles.mentorConnectText}>Connect</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          {recentActivity.map((activity, index) => (
            <View key={index} style={[styles.activityItem, index < recentActivity.length - 1 && styles.activityBorder]}>
              <View style={[styles.activityIcon, { backgroundColor: activity.color + '15' }]}>
                <Ionicons name={activity.icon as any} size={18} color={activity.color} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDesc}>{activity.desc}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* AI Counselor CTA */}
      <View style={styles.section}>
        <TouchableOpacity onPress={() => router.push('/(dashboard)/ai-chat')}>
          <LinearGradient
            colors={['#7c3aed', '#6366f1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaCard}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>Need Career Guidance? 💬</Text>
              <Text style={styles.ctaSub}>
                Chat with our AI Career Counselor for personalized advice and instant answers to your career questions.
              </Text>
              <View style={styles.ctaBtn}>
                <Text style={styles.ctaBtnText}>Start Chat →</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={{ height: 30 }} />

      {/* Quiz Modal */}
      <Modal visible={showQuizModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{quizCourse?.title} Quiz</Text>
            <TouchableOpacity onPress={() => setShowQuizModal(false)}>
              <Ionicons name="close" size={28} color="#111827" />
            </TouchableOpacity>
          </View>

          {quizLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366f1" />
              <Text style={styles.loadingText}>Generating quiz questions...</Text>
            </View>
          ) : quizDone ? (
            <ScrollView contentContainerStyle={styles.quizResults}>
              <Text style={styles.resultEmoji}>🎉</Text>
              <Text style={styles.resultTitle}>Quiz Complete!</Text>
              <Text style={styles.resultScore}>{quizScore}/{quizQuestions.length} correct</Text>
              <Text style={styles.resultPercent}>{Math.round((quizScore / quizQuestions.length) * 100)}%</Text>
              {quizQuestions.map((q, i) => (
                <View key={i} style={[styles.resultItem, { borderLeftColor: quizAnswers[i] === q.correctAnswer ? '#10b981' : '#ef4444' }]}>
                  <Text style={styles.resultQ}>Q{i + 1}: {q.question}</Text>
                  <Text style={styles.resultA}>Your answer: {q.options[quizAnswers[i]]}</Text>
                  {quizAnswers[i] !== q.correctAnswer && (
                    <Text style={styles.correctA}>Correct: {q.options[q.correctAnswer]}</Text>
                  )}
                  <Text style={styles.resultExpl}>{q.explanation}</Text>
                </View>
              ))}
              <TouchableOpacity style={styles.closeQuizBtn} onPress={() => setShowQuizModal(false)}>
                <Text style={styles.closeQuizBtnText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : quizQuestions.length > 0 ? (
            <View style={styles.quizContent}>
              <View style={styles.quizProgress}>
                <View style={[styles.quizProgressFill, { width: `${((currentQ + 1) / quizQuestions.length) * 100}%` }]} />
              </View>
              <Text style={styles.quizCounter}>Question {currentQ + 1} of {quizQuestions.length}</Text>
              <Text style={styles.quizQuestion}>{quizQuestions[currentQ]?.question}</Text>
              {quizQuestions[currentQ]?.options.map((opt: string, i: number) => (
                <TouchableOpacity key={i} style={styles.quizOption} onPress={() => handleQuizAnswer(i)}>
                  <View style={styles.optionLetter}><Text style={styles.optionLetterText}>{String.fromCharCode(65 + i)}</Text></View>
                  <Text style={styles.optionText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 14, color: '#c7d2fe', marginBottom: 2 },
  name: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 14, color: '#c7d2fe', marginTop: 4, lineHeight: 20 },
  profileButton: { padding: 4 },
  avatarCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#6366f1' },

  // Stats
  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, marginTop: -20 },
  statCard: { width: (width - 40) / 2, backgroundColor: '#fff', borderRadius: 16, padding: 16, margin: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 28, fontWeight: 'bold', marginTop: 2 },
  statLabel: { fontSize: 12, color: '#6b7280' },

  // Sections
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  sectionDesc: { fontSize: 13, color: '#6b7280' },
  seeAll: { fontSize: 14, color: '#6366f1', fontWeight: '600' },

  // Course Cards
  courseCard: { width: 260, backgroundColor: '#fff', borderRadius: 16, marginRight: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  courseHeader: { height: 90, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  coursePlatformIcon: { fontSize: 28, marginBottom: 2 },
  coursePlatformName: { fontSize: 12, fontWeight: '700', color: '#fff', textTransform: 'uppercase', letterSpacing: 1 },
  matchBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  matchBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#16a34a' },
  courseBody: { padding: 14 },
  courseTitle: { fontSize: 15, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  courseDesc: { fontSize: 12, color: '#6b7280', marginBottom: 10, lineHeight: 17 },
  courseMetaGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  courseMeta: { flexDirection: 'row', alignItems: 'center', width: '50%', marginBottom: 4 },
  courseMetaIcon: { fontSize: 12, marginRight: 4 },
  courseMetaText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  courseSkillTags: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  courseSkillTag: { backgroundColor: '#eef2ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginRight: 4, marginBottom: 4 },
  courseSkillTagText: { fontSize: 10, color: '#6366f1', fontWeight: '600' },
  courseProgressContainer: { marginBottom: 10 },
  courseProgressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  courseProgressLabel: { fontSize: 11, color: '#6b7280' },
  courseProgressPercent: { fontSize: 11, color: '#6b7280' },
  courseProgressBar: { height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, overflow: 'hidden' },
  courseProgressFill: { height: '100%', backgroundColor: '#16a34a', borderRadius: 3 },
  courseQuizCount: { fontSize: 10, color: '#9ca3af', marginTop: 2 },
  courseActions: { flexDirection: 'row', gap: 8 },
  enrollBtn: { flex: 1, backgroundColor: '#6366f1', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  enrollBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  quizBtn: { flex: 1, backgroundColor: '#16a34a', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  quizBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Two-column layout
  twoColRow: { flexDirection: 'row', gap: 12 },
  halfCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 10 },
  careerPathBox: { borderRadius: 12, padding: 14, marginBottom: 10 },
  careerPathEmoji: { fontSize: 24, marginBottom: 4 },
  careerPathTitle: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  careerPathDesc: { fontSize: 11, color: '#e0e7ff', marginTop: 2 },
  careerDetails: {},
  careerDetailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  careerDetailLabel: { fontSize: 11, color: '#6b7280' },
  careerDetailVal: { fontSize: 12, fontWeight: '600', color: '#111827' },

  // Skills
  skillRow: { marginBottom: 10 },
  skillHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  skillName: { fontSize: 12, fontWeight: '600', color: '#111827', flex: 1 },
  skillPercent: { fontSize: 11, fontWeight: '600', color: '#6b7280' },
  skillBar: { height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, overflow: 'hidden' },
  skillFill: { height: '100%', borderRadius: 3 },

  // Achievements
  achievementCard: { width: 140, backgroundColor: '#fefce8', borderWidth: 1, borderColor: '#fde68a', borderRadius: 12, padding: 12, marginRight: 10 },
  achievementEmoji: { fontSize: 20, marginBottom: 4 },
  achievementTitle: { fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 2 },
  achievementDesc: { fontSize: 11, color: '#6b7280', marginBottom: 4 },
  achievementPoints: { fontSize: 11, fontWeight: '600', color: '#ca8a04' },

  // Quick Actions
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  actionCard: { width: (width - 48) / 2, backgroundColor: '#fff', borderRadius: 14, padding: 16, margin: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  actionIconBg: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  actionLabel: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  actionDesc: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
  actionArrow: {},
  actionArrowText: { fontSize: 13, fontWeight: '600' },

  // Activity
  activityCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  activityItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10 },
  activityBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  activityIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 2 },
  activityDesc: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
  activityTime: { fontSize: 11, color: '#9ca3af' },

  // Mentor Cards
  mentorCard: { width: 220, backgroundColor: '#fff', borderRadius: 18, marginRight: 14, paddingBottom: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.10, shadowRadius: 10, elevation: 4 },
  mentorCardStrip: { height: 6, width: '100%' },
  mentorAvailBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginRight: 12, marginTop: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  mentorAvailDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  mentorAvailText: { fontSize: 10, fontWeight: '700' },
  mentorAvatarWrap: { width: 60, height: 60, borderRadius: 30, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 4, marginBottom: 8, backgroundColor: '#f9fafb' },
  mentorAvatar: { fontSize: 30 },
  mentorName: { fontSize: 15, fontWeight: 'bold', color: '#111827', textAlign: 'center', paddingHorizontal: 12, marginBottom: 2 },
  mentorTitle: { fontSize: 12, color: '#6b7280', textAlign: 'center', paddingHorizontal: 12, marginBottom: 2 },
  mentorCompany: { fontSize: 12, color: '#374151', fontWeight: '600', textAlign: 'center', marginBottom: 10 },
  mentorStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10, paddingHorizontal: 8 },
  mentorStat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  mentorStatText: { fontSize: 11, color: '#374151', fontWeight: '600' },
  mentorStatDivider: { width: 1, height: 12, backgroundColor: '#e5e7eb', marginHorizontal: 6 },
  mentorSkills: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: 10, gap: 4, marginBottom: 12 },
  mentorSkillTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  mentorSkillText: { fontSize: 10, fontWeight: '700' },
  mentorConnectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginHorizontal: 14, paddingVertical: 10, borderRadius: 11 },
  mentorConnectText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // CTA
  ctaCard: { padding: 24, borderRadius: 16 },
  ctaTitle: { fontSize: 19, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  ctaSub: { fontSize: 14, color: '#e0e7ff', lineHeight: 20, marginBottom: 14 },
  ctaBtn: { backgroundColor: '#fff', alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  ctaBtnText: { color: '#6366f1', fontSize: 14, fontWeight: '700' },

  // Quiz Modal
  modalContainer: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6b7280' },
  quizContent: { flex: 1, padding: 20 },
  quizProgress: { height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, marginBottom: 16, overflow: 'hidden' },
  quizProgressFill: { height: '100%', backgroundColor: '#6366f1', borderRadius: 3 },
  quizCounter: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  quizQuestion: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 24, lineHeight: 26 },
  quizOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 14, marginBottom: 12 },
  optionLetter: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  optionLetterText: { fontSize: 14, fontWeight: 'bold', color: '#6b7280' },
  optionText: { flex: 1, fontSize: 15, color: '#374151' },
  quizResults: { padding: 20, alignItems: 'center' },
  resultEmoji: { fontSize: 48, marginBottom: 8 },
  resultTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  resultScore: { fontSize: 18, color: '#6b7280', marginBottom: 4 },
  resultPercent: { fontSize: 36, fontWeight: 'bold', color: '#6366f1', marginBottom: 20 },
  resultItem: { width: '100%', backgroundColor: '#f9fafb', padding: 14, borderRadius: 12, marginBottom: 12, borderLeftWidth: 4 },
  resultQ: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 6 },
  resultA: { fontSize: 13, color: '#6b7280', marginBottom: 2 },
  correctA: { fontSize: 13, color: '#10b981', fontWeight: '600', marginBottom: 2 },
  resultExpl: { fontSize: 12, color: '#9ca3af', marginTop: 4, fontStyle: 'italic' },
  closeQuizBtn: { backgroundColor: '#6366f1', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12, marginTop: 16 },
  closeQuizBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
