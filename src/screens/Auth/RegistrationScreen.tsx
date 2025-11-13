import React from 'react';
import { StyleSheet, Image, Pressable, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const welcomeLogo = require('../../../assets/welcomelogo.png');

type Props = NativeStackScreenProps<RootStackParamList, 'Registration'>;

export default function RegistrationScreen({ navigation }: Props) {
  const handleGetStarted = () => {
    navigation.navigate('AddVehicle');
  };

  return (
    <Pressable style={styles.container} onPress={handleGetStarted}>
      <View>
        <Image source={welcomeLogo} style={styles.logo} resizeMode="contain" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerFrame: {
    width: '90%',
    height: '90%',
    borderWidth: 3,
    borderRadius: 16,
    borderColor: '#A855F7', // light purple border like the sample
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '70%',
    height: undefined,
    aspectRatio: 3, // tweak if needed to match your actual image
  },
});
