import { useAuth } from '@clerk/clerk-expo';
import { useMutation } from '@tanstack/react-query';
import type { BudgetRange, ItineraryPlan, ItinerarySlot } from '@wanderai/shared';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { GripVertical, Share2 } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { type RenderItemParams } from 'react-native-draggable-flatlist';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '../../../components/GlassCard';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { TextField } from '../../../components/TextField';
import { theme } from '../../../constants/theme';
import { generateItinerary } from '../../../services/itinerary';
import { usePreferencesStore } from '../../../stores/preferencesStore';

const budgetOptions: readonly BudgetRange[] = ['budget', 'midrange', 'premium'];

const planToSlots = (plan: ItineraryPlan | null): ItinerarySlot[] =>
  plan ? plan.days.flatMap((day) => day.slots) : [];

const renderPdfHtml = (plan: ItineraryPlan, slots: readonly ItinerarySlot[]): string => `
  <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 32px;">
      <h1>${plan.destination}</h1>
      <p>Budget: ${plan.budgetRange} • Estimated spend: $${plan.totalEstimatedSpend}</p>
      ${slots
        .map(
          (slot) => `
          <section style="margin: 20px 0; padding: 16px; border: 1px solid #ddd; border-radius: 8px;">
            <h2>Day ${slot.day}: ${slot.startTime} - ${slot.endTime}</h2>
            <h3>${slot.title}</h3>
            <p>${slot.description}</p>
            <p><strong>Estimated spend:</strong> $${slot.estimatedSpend}</p>
          </section>
        `,
        )
        .join('')}
    </body>
  </html>
`;

export default function ItineraryScreen(): JSX.Element {
  const { getToken, userId } = useAuth();
  const travelStyle = usePreferencesStore((state) => state.travelStyle);
  const [destination, setDestination] = useState('Ho Chi Minh City');
  const [days, setDays] = useState('3');
  const [budgetRange, setBudgetRange] = useState<BudgetRange>('midrange');
  const [plan, setPlan] = useState<ItineraryPlan | null>(null);
  const [slots, setSlots] = useState<ItinerarySlot[]>([]);

  const mutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return generateItinerary(
        {
          destination,
          days: Number.parseInt(days, 10),
          budgetRange,
          travelStyle,
          userId: userId ?? undefined,
        },
        token,
      );
    },
    onSuccess: (data) => {
      setPlan(data);
      setSlots(planToSlots(data));
    },
  });

  useEffect(() => {
    setSlots(planToSlots(plan));
  }, [plan]);

  const total = useMemo(() => slots.reduce((sum, slot) => sum + slot.estimatedSpend, 0), [slots]);

  const exportPdf = async (): Promise<void> => {
    if (!plan) {
      return;
    }
    try {
      const file = await Print.printToFileAsync({
        html: renderPdfHtml(plan, slots),
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri);
      }
    } catch {
      // Sharing/PDF export depends on device capabilities.
    }
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<ItinerarySlot>): JSX.Element => (
    <TouchableOpacity activeOpacity={0.9} onLongPress={drag} disabled={isActive}>
      <GlassCard className="mb-3">
        <View className="flex-row gap-3">
          <GripVertical color={theme.colors.muted} size={18} />
          <View className="flex-1">
            <Text className="font-inter-semibold text-white">
              Day {item.day} • {item.startTime}-{item.endTime}
            </Text>
            <Text className="mt-1 font-inter-bold text-xl text-white">{item.title}</Text>
            <Text className="mt-2 font-inter text-sm text-zinc-300">{item.description}</Text>
            {item.place ? (
              <Text className="mt-2 font-inter-semibold text-primary">{item.place.name}</Text>
            ) : null}
            <Text className="mt-2 font-inter text-sm text-zinc-300">${item.estimatedSpend}</Text>
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <DraggableFlatList
        ListHeaderComponent={
          <View className="gap-4 px-5 pb-4 pt-5">
            <View>
              <Text className="font-inter-bold text-4xl text-white">Itinerary</Text>
              <Text className="mt-2 font-inter text-base text-zinc-300">
                Generate, reorder, export, and share a real Places-linked plan.
              </Text>
            </View>
            <GlassCard>
              <View className="gap-3">
                <TextField
                  value={destination}
                  onChangeText={setDestination}
                  placeholder="Destination city"
                />
                <TextField
                  value={days}
                  onChangeText={setDays}
                  keyboardType="number-pad"
                  placeholder="Days"
                />
                <View className="flex-row gap-2">
                  {budgetOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      className={`flex-1 rounded-lg px-3 py-2 ${budgetRange === option ? 'bg-primary' : 'bg-white/10'}`}
                      onPress={() => setBudgetRange(option)}
                    >
                      <Text className="text-center font-inter-semibold text-white">{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <PrimaryButton
                  label="Generate plan"
                  loading={mutation.isPending}
                  onPress={() => mutation.mutate()}
                />
              </View>
            </GlassCard>
            {plan ? (
              <GlassCard>
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="font-inter-bold text-2xl text-white">${total}</Text>
                    <Text className="font-inter text-sm text-zinc-300">Estimated trip spend</Text>
                  </View>
                  <PrimaryButton
                    label="Export"
                    icon={Share2}
                    variant="ghost"
                    onPress={() => void exportPdf()}
                  />
                </View>
              </GlassCard>
            ) : null}
          </View>
        }
        contentContainerStyle={{ paddingBottom: 120 }}
        data={slots}
        keyExtractor={(item) => item.id}
        onDragEnd={({ data }) => setSlots(data)}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}
