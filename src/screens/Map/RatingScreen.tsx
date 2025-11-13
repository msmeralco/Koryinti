import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList } from '@/types/navigation';
import { useState } from 'react';

type Props = NativeStackScreenProps<MapStackParamList, 'Rating'>;

/**
 * RatingScreen allows users to rate their charging experience
 * and provide feedback after completing a charging session.
 */
export default function RatingScreen({ navigation }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    navigation.navigate('MapHome');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Rate Your Experience</Text>
        <Text style={styles.subtitle}>How was your charging session?</Text>

        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Text style={styles.star}>{star <= rating ? '⭐' : '☆'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Additional Comments (Optional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Tell us about your experience..."
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={rating === 0}
        >
          <Text style={styles.submitButtonText}>Submit Review</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSubmit}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 30,
  },
  star: {
    fontSize: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  skipButton: {
    marginTop: 15,
    padding: 10,
  },
  skipText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
});
