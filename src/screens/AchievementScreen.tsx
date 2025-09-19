import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Allocation } from '../../App';

const AchievementScreen: React.FC = () => {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<{ [month: string]: string }>({});

  // Load allocations
  const loadAllocations = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@allocations');
      const data: Allocation[] = jsonValue ? JSON.parse(jsonValue) : [];
      setAllocations(data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load allocations');
    }
  };

  useEffect(() => {
    loadAllocations();
  }, []);

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setAchievements({});
    } else {
      const alloc = allocations.find((a) => a.id === id);
      if (!alloc) return;
      const initialAchv: { [month: string]: string } = {};
      alloc.monthlyTargets.forEach((m) => {
        initialAchv[m.month] = m.achieved?.toString() || '';
      });
      setAchievements(initialAchv);
      setExpandedId(id);
    }
  };

  const calculateTotal = () => {
    return Object.values(achievements)
      .map((v) => parseInt(v || '0', 10))
      .reduce((sum, val) => sum + val, 0);
  };

  const saveAchievements = async () => {
    if (!expandedId) return;

    const updatedAllocations = allocations.map((a) => {
      if (a.id === expandedId) {
        const updatedMonthly = a.monthlyTargets.map((m) => ({
          ...m,
          achieved: parseInt(achievements[m.month] || '0', 10),
        }));

        const totalAch = updatedMonthly.reduce((sum, m) => sum + (m.achieved || 0), 0);

        return {
          ...a,
          monthlyTargets: updatedMonthly,
          totalAchieved: totalAch,
        };
      }
      return a;
    });

    try {
      await AsyncStorage.setItem('@allocations', JSON.stringify(updatedAllocations));
      setAllocations(updatedAllocations);
      Alert.alert('Success', 'Achievements saved successfully');
      setExpandedId(null);
      setAchievements({});
    } catch (e) {
      Alert.alert('Error', 'Failed to save achievements');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Achievements</Text>

      {allocations.map((alloc) => (
        <View key={alloc.id} style={styles.card}>
          <TouchableOpacity onPress={() => toggleExpand(alloc.id)}>
            <Text style={styles.cardTitle}>
              {alloc.name} ({alloc.financialYear}) - {alloc.type}
            </Text>
            <Text>Total Target: {alloc.monthlyTargets.reduce((sum, m) => sum + m.value, 0)}</Text>
            <Text>Total Achieved: {alloc.totalAchieved || 0}</Text>
          </TouchableOpacity>

          {expandedId === alloc.id && (
            <View style={{ marginTop: 10 }}>
              <ScrollView horizontal>
                <View>
                  <View style={[styles.row, styles.headerRow]}>
                    <Text style={[styles.cell, { width: 120 }]}>Month</Text>
                    <Text style={[styles.cell, { width: 100 }]}>Target</Text>
                    <Text style={[styles.cell, { width: 120 }]}>Achieved</Text>
                  </View>

                  {alloc.monthlyTargets.map((m) => (
                    <View key={m.month} style={styles.row}>
                      <Text style={[styles.cell, { width: 120 }]}>{m.month}</Text>
                      <Text style={[styles.cell, { width: 100 }]}>{m.value}</Text>
                      <TextInput
                        style={[styles.cell, { width: 120 }]}
                        keyboardType="numeric"
                        value={achievements[m.month]}
                        onChangeText={(text) =>
                          setAchievements({ ...achievements, [m.month]: text })
                        }
                      />
                    </View>
                  ))}
                </View>
              </ScrollView>

              <Text style={{ fontWeight: 'bold', marginTop: 8 }}>
                Total Achieved: {calculateTotal()}
              </Text>

              <TouchableOpacity style={styles.saveButton} onPress={saveAchievements}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save Achievements</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

export default AchievementScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#d9d9d9' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 12 },
  cardTitle: { fontWeight: 'bold', fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  headerRow: { backgroundColor: '#ddd' },
  cell: { borderWidth: 1, borderColor: '#ccc', padding: 8, textAlign: 'center' },
  saveButton: { backgroundColor: '#4caf50', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
});
