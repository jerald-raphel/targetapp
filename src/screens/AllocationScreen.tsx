import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { employees } from '../data/employees';
import { teams } from '../data/teams';
import { generateUniqueId } from '../utils/generateId';

// Updated Allocation type
export interface Allocation {
  id: string;
  type: 'Individual' | 'Team';
  personId: string;
  name: string;
  financialYear: string; // FY 2024–2025
  monthlyTargets: {
    month: string; // Apr, May, ..., Mar
    value: number; // Target value for that month
    achieved?: number; // Optional field
  }[];
  totalTarget: number;
  totalAchieved?: number;
}

const years = ['2024', '2025', '2026', '2027', '2028', '2029', '2030'];

// Helper to generate Apr–Mar months for selected year
const getFinancialYearMonths = (startYear: number) => {
  const months = [
    'Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'
  ];
  return months.map((m, idx) => {
    const year = idx < 9 ? startYear : startYear + 1; // Jan–Mar go to next year
    return `${m} ${year}`;
  });
};

const AllocationScreen: React.FC = () => {
  const [selectionType, setSelectionType] = useState<'Individual' | 'Team' | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [monthTargets, setMonthTargets] = useState<{ [key: string]: string }>({});

  const totalTarget = Object.values(monthTargets).reduce(
    (sum, val) => sum + (parseInt(val || '0', 10) || 0),
    0
  );

  const handleAddAll = async () => {
    if (!selectionType || !selectedPerson || !selectedYear) {
      Alert.alert('Error', 'Please select person and year before adding targets');
      return;
    }

    const selectedItem =
      selectionType === 'Individual'
        ? employees.find((e) => e.id === selectedPerson)
        : teams.find((t) => t.id === selectedPerson);

    if (!selectedItem) {
      Alert.alert('Error', 'Invalid person/team');
      return;
    }

    const months = getFinancialYearMonths(parseInt(selectedYear));
    const monthlyTargetsArray = months.map((month) => ({
      month,
      value: parseInt(monthTargets[month] || '0', 10),
    }));

    if (monthlyTargetsArray.some((m) => !m.value || m.value <= 0)) {
      Alert.alert('Error', 'Please set targets for all 12 months');
      return;
    }

    const newAllocation: Allocation = {
      id: generateUniqueId(),
      type: selectionType,
      personId: selectedPerson,
      name:
        selectionType === 'Individual'
          ? (selectedItem as any).name
          : (selectedItem as any).teamName,
      financialYear: `FY ${selectedYear}-${parseInt(selectedYear) + 1}`,
      monthlyTargets: monthlyTargetsArray,
      totalTarget,
      totalAchieved: 0,
    };

    try {
      // Load existing allocations
      const jsonValue = await AsyncStorage.getItem('@allocations');
      const existingAllocations: Allocation[] = jsonValue ? JSON.parse(jsonValue) : [];

      // Append new allocation
      const updatedAllocations = [...existingAllocations, newAllocation];

      // Save back
      await AsyncStorage.setItem('@allocations', JSON.stringify(updatedAllocations));

      Alert.alert('Success', 'Allocation added successfully');

      // Reset local state
      setSelectedPerson(null);
      setSelectionType(null);
      setSelectedYear(null);
      setMonthTargets({});
    } catch (e) {
      Alert.alert('Error', 'Failed to save allocation');
    }
  };

  const personsList =
    selectionType === 'Individual'
      ? employees
      : selectionType === 'Team'
      ? teams
      : [];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Allocation</Text>

      {!selectionType && (
        <View style={styles.selectionRow}>
          <TouchableOpacity
            style={[styles.circleButton, { backgroundColor: '#4caf50' }]}
            onPress={() => setSelectionType('Individual')}
          >
            <Image source={require('../assets/employee.png')} style={styles.icon} />
            <Text style={styles.buttonText}>Individual</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.circleButton, { backgroundColor: '#2196f3' }]}
            onPress={() => setSelectionType('Team')}
          >
            <Image source={require('../assets/team.png')} style={styles.icon} />
            <Text style={styles.buttonText}>Team</Text>
          </TouchableOpacity>
        </View>
      )}

      {selectionType && !selectedPerson && (
        <View style={styles.listContainer}>
          <Text style={styles.subtitle}>Select {selectionType}:</Text>
          <ScrollView style={{ maxHeight: 180 }}>
            {personsList.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.listItem}
                onPress={() => setSelectedPerson(p.id)}
              >
                <Text style={styles.personText}>
                  {selectionType === 'Individual'
                    ? `${p.name} (${p.id})`
                    : `${p.teamName} (${p.id})`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {selectedPerson && !selectedYear && (
        <View style={styles.listContainer}>
          <Text style={styles.subtitle}>Select Financial Year Start:</Text>
          <ScrollView horizontal style={{ marginVertical: 12 }}>
            {years.map((y) => (
              <TouchableOpacity
                key={y}
                style={[
                  styles.periodButton,
                  selectedYear === y ? styles.periodSelected : {},
                ]}
                onPress={() => setSelectedYear(y)}
              >
                <Text style={styles.periodButtonText}>{`FY ${y}-${parseInt(y) + 1}`}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {selectedYear && (
        <View style={styles.listContainer}>
          <Text style={styles.subtitle}>
            Set Monthly Targets for FY {selectedYear}-{parseInt(selectedYear) + 1}
          </Text>
          {getFinancialYearMonths(parseInt(selectedYear)).map((month) => {
            const inputValue =
              monthTargets[month] !== undefined ? String(monthTargets[month]) : '';
            return (
              <View key={month} style={styles.monthRow}>
                <Text style={styles.monthLabel}>{month}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Target"
                  keyboardType="numeric"
                  value={inputValue}
                  onChangeText={(val) =>
                    setMonthTargets((prev) => ({ ...prev, [month]: val }))
                  }
                />
              </View>
            );
          })}

          <View style={styles.totalBox}>
            <Text style={styles.totalText}>Total Target: {totalTarget}</Text>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddAll}>
            <Text style={styles.buttonText}>Save Allocation</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default AllocationScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#d9d9d9' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, fontFamily: 'Roboto' },
  selectionRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  circleButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    elevation: 5,
  },
  icon: { width: 40, height: 40, marginBottom: 6, tintColor: '#fff' },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center', fontFamily: 'Roboto' },
  listContainer: { marginBottom: 16 },
  listItem: { padding: 12, backgroundColor: '#fff', marginBottom: 8, borderRadius: 6 },
  personText: { fontFamily: 'Roboto', fontWeight: 'bold', color: '#000' },
  subtitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, fontFamily: 'Roboto', color: '#000' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
    fontFamily: 'Roboto',
    color: '#000',
    fontWeight: 'bold',
    width: 100,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  periodButton: {
    padding: 10,
    marginHorizontal: 6,
    backgroundColor: '#bfbfbf',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodSelected: { backgroundColor: '#4caf50' },
  periodButtonText: { fontFamily: 'Roboto', fontWeight: 'bold', color: '#000', textAlign: 'center' },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  monthLabel: { fontFamily: 'Roboto', fontWeight: 'bold', color: '#000', width: 120 },
  totalBox: { marginTop: 12, padding: 10, backgroundColor: '#fff', borderRadius: 6 },
  totalText: { fontFamily: 'Roboto', fontWeight: 'bold', color: '#000', fontSize: 16 },
});
