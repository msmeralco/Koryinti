import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MapStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<MapStackParamList, 'Rating'>;

const ACCENT_GREEN = '#00F470';

/**
 * RatingScreen allows users to rate their charging experience
 * and provide feedback after completing a charging session.
 */
export default function RatingScreen({ navigation }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    // In a real app, send rating + comment to backend before navigating
    navigation.navigate('MapHome');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badge}>
              <Ionicons name="flash-outline" size={16} color={ACCENT_GREEN} />
              <Text style={styles.badgeText}>Charging session complete</Text>
            </View>
            <Text style={styles.title}>Rate your experience</Text>
            <Text style={styles.subtitle}>How was your charging session?</Text>
          </View>

          {/* Stars */}
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.8}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={40}
                  color={star <= rating ? '#FBBF24' : '#4B5563'}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Comment box */}
          <Text style={styles.label}>Additional comments (optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Tell us about the station, location, or charging speed…"
            placeholderTextColor="#6B7280"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Primary CTA */}
          <TouchableOpacity
            style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={rating === 0}
            activeOpacity={0.8}
          >
            <Ionicons
              name="send-outline"
              size={18}
              color={rating === 0 ? '#6B7280' : '#050816'}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.submitButtonText}>
              {rating === 0 ? 'Select a rating to submit' : 'Submit review'}
            </Text>
          </TouchableOpacity>

          {/* Skip */}
          <TouchableOpacity style={styles.skipButton} onPress={handleSubmit}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050816',
  },
  container: {
    flex: 1,
    backgroundColor: '#050816',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24, // keeps it away from the Dynamic Island
    paddingBottom: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0,244,112,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,244,112,0.5)',
    marginBottom: 12,
  },
  badgeText: {
    color: ACCENT_GREEN,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F9FAFB',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 28,
    marginTop: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E5E7EB',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.5)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 110,
    marginBottom: 20,
    backgroundColor: '#0B1020',
    color: '#F9FAFB',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT_GREEN,
    paddingVertical: 14,
    borderRadius: 999,
  },
  submitButtonDisabled: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  submitButtonText: {
    color: '#050816',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  skipButton: {
    marginTop: 14,
    paddingVertical: 8,
  },
  skipText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});
