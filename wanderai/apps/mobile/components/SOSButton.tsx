import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { ShieldAlert } from 'lucide-react-native';
import { Text, TouchableOpacity } from 'react-native';
import { theme } from '../constants/theme';

type SOSButtonProps = {
  emergencyContact?: string;
};

export const SOSButton = ({ emergencyContact }: SOSButtonProps): JSX.Element => {
  const sendSOS = async (): Promise<void> => {
    try {
      const available = await SMS.isAvailableAsync();
      if (!available || !emergencyContact) {
        return;
      }
      const permission = await Location.requestForegroundPermissionsAsync();
      const coords =
        permission.status === Location.PermissionStatus.GRANTED
          ? await Location.getCurrentPositionAsync({})
          : null;
      const locationText = coords
        ? `GPS: ${coords.coords.latitude}, ${coords.coords.longitude}`
        : 'GPS unavailable';
      await SMS.sendSMSAsync([emergencyContact], `WanderAI SOS: I need help. ${locationText}`);
    } catch {
      // SOS remains best-effort because SMS availability varies by device and region.
    }
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Send SOS"
      className="absolute bottom-24 right-5 flex-row items-center gap-2 rounded-full bg-danger px-4 py-3 shadow-lg"
      onPress={() => {
        void sendSOS();
      }}
    >
      <ShieldAlert size={18} color={theme.colors.text} />
      <Text className="font-inter-bold text-white">SOS</Text>
    </TouchableOpacity>
  );
};
