import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../src/config/network-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QUICK_QUESTIONS = [
  'What career suits me?',
  'How to improve my resume?',
  'Best skills to learn in 2025?',
  'How to prepare for interviews?',
  'Salary negotiation tips',
];

type Message = { id: string; text: string; isUser: boolean; timestamp: Date };

export default function AIChatScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Hello! I'm your AI Career Mentor. Ask me anything about careers, skills, interviews, or your professional growth! 🚀", isUser: false, timestamp: new Date() },
  ]);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const callAI = async (userMsg: string, history: Message[]): Promise<string> => {
    try {
      const token = await AsyncStorage.getItem('token');
      const conversationHistory = history.slice(-10).map(m => ({
        role: m.isUser ? 'user' : 'assistant',
        content: m.text,
      }));

      const response = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: userMsg, conversationHistory }),
        signal: AbortSignal.timeout(60000),
      });

      const data = await response.json();
      if (data?.success && data?.data?.response) {
        return data.data.response;
      }
      return "I couldn't generate a response right now. Please try again.";
    } catch (error: any) {
      if (error?.name === 'TimeoutError') {
        return "Server is starting up. Please send your message again in a moment!";
      }
      return "I'm having trouble connecting right now. Please check your internet and try again.";
    }
  };

  const sendMessage = async (text?: string) => {
    const msg = (text || message).trim();
    if (!msg || loading) return;
    const userMsg: Message = { id: Date.now().toString(), text: msg, isUser: true, timestamp: new Date() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setMessage('');
    setLoading(true);

    const aiText = await callAI(msg, messages);
    const aiMsg: Message = { id: (Date.now() + 1).toString(), text: aiText, isUser: false, timestamp: new Date() };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isUser && styles.userMessage]}>
      {!item.isUser && (
        <View style={styles.aiBadge}><Ionicons name="flash" size={14} color="#fff" /></View>
      )}
      <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, item.isUser && styles.userText]}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container} keyboardVerticalOffset={100}>
      <View style={styles.header}>
        <View style={styles.aiAvatar}><Ionicons name="flash" size={24} color="#fff" /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>AI Career Mentor</Text>
          <Text style={styles.headerSubtitle}>{loading ? 'Thinking...' : 'Powered by AI • Always here to help'}</Text>
        </View>
        <TouchableOpacity onPress={() => setMessages([messages[0]])} style={styles.clearBtn}>
          <Ionicons name="trash-outline" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {messages.length <= 1 && (
        <View style={styles.suggestionsArea}>
          <Text style={styles.suggestTitle}>Quick Questions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {QUICK_QUESTIONS.map((q, i) => (
              <TouchableOpacity key={i} style={styles.suggestChip} onPress={() => sendMessage(q)}>
                <Ionicons name="chatbubble-ellipses-outline" size={14} color="#6366f1" />
                <Text style={styles.suggestText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {loading && (
        <View style={styles.typingRow}>
          <ActivityIndicator size="small" color="#6366f1" />
          <Text style={styles.typingText}>AI is thinking...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Ask me anything about your career..." value={message} onChangeText={setMessage} multiline editable={!loading} />
        <TouchableOpacity style={[styles.sendButton, (!message.trim() || loading) && { opacity: 0.5 }]} onPress={() => sendMessage()} disabled={!message.trim() || loading}>
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingTop: 60, paddingBottom: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  aiAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  headerSubtitle: { fontSize: 12, color: '#6b7280', marginTop: 1 },
  clearBtn: { padding: 8 },
  suggestionsArea: { paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  suggestTitle: { fontSize: 13, fontWeight: '600', color: '#6b7280', marginLeft: 16, marginBottom: 8 },
  suggestChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#eef2ff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  suggestText: { fontSize: 13, color: '#6366f1', fontWeight: '500' },
  messagesList: { padding: 16, paddingBottom: 8 },
  messageContainer: { marginBottom: 14, flexDirection: 'row', alignItems: 'flex-end' },
  userMessage: { justifyContent: 'flex-end' },
  aiBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginRight: 8, marginBottom: 2 },
  messageBubble: { maxWidth: '78%', padding: 12, borderRadius: 16 },
  aiBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  userBubble: { backgroundColor: '#6366f1', borderBottomRightRadius: 4, marginLeft: 'auto' },
  messageText: { fontSize: 15, color: '#111827', lineHeight: 22 },
  userText: { color: '#fff' },
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingBottom: 8 },
  typingText: { fontSize: 13, color: '#6b7280' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  input: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100, marginRight: 10 },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center' },
});
