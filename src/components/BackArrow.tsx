import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  onPress?: () => void;
  size?: number;
  color?: string;
  testID?: string;
};

export default function BackArrow({ onPress, size = 26, color = '#00F470', testID }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={{ padding: 6 }} testID={testID}>
      <Ionicons name="arrow-back" size={size} color={color} />
    </TouchableOpacity>
  );
}
