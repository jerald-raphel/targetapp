import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Allocation } from '../../App';

interface HomeScreenProps {
  allocations: Allocation[];
  onEditAllocation?: (allocation: Allocation) => void; // optional, we handle storage internally
  onDeleteAllocation?: (id: string) => void;
}

const STORAGE_KEY = '@allocations';

const HomeScreen: React.FC<HomeScreenProps> = ({ allocations: propsAllocations, onEditAllocation, onDeleteAllocation }) => {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [editingAllocation, setEditingAllocation] = useState<Allocation | null>(null);
  const [monthTargets, setMonthTargets] = useState<{ [month: string]: string }>({});
  const [editingAchModal, setEditingAchModal] = useState<Allocation | null>(null);
  const [editingAchieved, setEditingAchieved] = useState<string>('');

  // Load from AsyncStorage
  const loadAllocations = async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      const data: Allocation[] = json ? JSON.parse(json) : propsAllocations || [];
      setAllocations(data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load allocations');
    }
  };

  // Save allocations to AsyncStorage
  const saveAllocations = async (updated: Allocation[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setAllocations(updated);
      if (onEditAllocation) updated.forEach(onEditAllocation);
    } catch (e) {
      Alert.alert('Error', 'Failed to save allocations');
    }
  };

  useEffect(() => {
    loadAllocations();
  }, []);

  // --- Edit Monthly Targets ---
  const openEditModal = (allocation: Allocation) => {
    setEditingAllocation(allocation);
    const targets: { [key: string]: string } = {};
    allocation.monthlyTargets.forEach((m) => {
      targets[m.month] = String(m.value);
    });
    setMonthTargets(targets);
  };

  const handleSave = () => {
    if (!editingAllocation) return;
    const updatedMonthly = editingAllocation.monthlyTargets.map((m) => ({
      month: m.month,
      value: parseInt(monthTargets[m.month] || '0', 10),
      achieved: m.achieved || 0,
    }));

    const totalTarget = updatedMonthly.reduce((sum, t) => sum + t.value, 0);
    const totalAchieved = updatedMonthly.reduce((sum, t) => sum + (t.achieved || 0), 0);

    const updatedAllocation = { ...editingAllocation, monthlyTargets: updatedMonthly, totalTarget, totalAchieved };
    const updatedAll = allocations.map((a) => (a.id === updatedAllocation.id ? updatedAllocation : a));
    saveAllocations(updatedAll);

    setEditingAllocation(null);
    setMonthTargets({});
    Alert.alert('Success', 'Allocation updated successfully');
  };

  // --- Edit Total Achieved ---
  const openEditAchModal = (allocation: Allocation) => {
    setEditingAchModal(allocation);
    const totalAch = allocation.totalAchieved ?? allocation.monthlyTargets.reduce((sum, t) => sum + (t.achieved || 0), 0);
    setEditingAchieved(String(totalAch));
  };

  const handleSaveAchieved = () => {
    if (!editingAchModal) return;

    const totalAch = parseInt(editingAchieved || '0', 10);
    const perMonthAch = Math.floor(totalAch / editingAchModal.monthlyTargets.length);

    const updatedMonthly = editingAchModal.monthlyTargets.map((m, idx, arr) => {
      if (idx === arr.length - 1) {
        return { ...m, achieved: totalAch - perMonthAch * (arr.length - 1) };
      }
      return { ...m, achieved: perMonthAch };
    });

    const updatedAllocation = { ...editingAchModal, monthlyTargets: updatedMonthly, totalAchieved: totalAch };
    const updatedAll = allocations.map((a) => (a.id === updatedAllocation.id ? updatedAllocation : a));
    saveAllocations(updatedAll);

    setEditingAchModal(null);
    setEditingAchieved('');
    Alert.alert('Success', 'Total Achieved updated successfully');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📌 Allocations</Text>

      <ScrollView horizontal>
        {/* Monthly Targets Table */}
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, styles.headerCell, { width: 100 }]}>ID</Text>
            <Text style={[styles.cell, styles.headerCell, { width: 100 }]}>Type</Text>
            <Text style={[styles.cell, styles.headerCell, { width: 150 }]}>Name</Text>
            <Text style={[styles.cell, styles.headerCell, { width: 120 }]}>Year</Text>
            <Text style={[styles.cell, styles.headerCell, { width: 120 }]}>Total Target</Text>
            <Text style={[styles.cell, styles.headerCell, { width: 180 }]}>Actions</Text>
          </View>

          <FlatList
            data={allocations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={[styles.cell, { width: 100 }]}>{item.id}</Text>
                <Text style={[styles.cell, { width: 100 }]}>{item.type}</Text>
                <Text style={[styles.cell, { width: 150 }]}>{item.name}</Text>
                <Text style={[styles.cell, { width: 120 }]}>{item.financialYear}</Text>
                <Text style={[styles.cell, { width: 120 }]}>{item.monthlyTargets.reduce((sum, t) => sum + t.value, 0)}</Text>
                <View style={[styles.cell, { width: 180, flexDirection: 'row', justifyContent: 'center' }]}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(item)}>
                    <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#c0392b' }]} onPress={() => onDeleteAllocation?.(item.id)}>
                    <Text style={styles.actionText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      </ScrollView>

      <Text style={[styles.title, { marginTop: 24 }]}>🏆 Total Achievements</Text>

      <ScrollView horizontal>
        {/* Total Achievements Table */}
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, styles.headerCell, { width: 100 }]}>ID</Text>
            <Text style={[styles.cell, styles.headerCell, { width: 100 }]}>Type</Text>
            <Text style={[styles.cell, styles.headerCell, { width: 120 }]}>Person ID</Text>
            <Text style={[styles.cell, styles.headerCell, { width: 150 }]}>Name</Text>
            <Text style={[styles.cell, styles.headerCell, { width: 120 }]}>Year</Text>
            <Text style={[styles.cell, styles.headerCell, { width: 120 }]}>Total Target</Text>
            <Text style={[styles.cell, styles.headerCell, { width: 120 }]}>Total Achieved</Text>
            <Text style={[styles.cell, styles.headerCell, { width: 100 }]}>Edit</Text>
          </View>

          <FlatList
            data={allocations}
            keyExtractor={(item) => item.id + '_ach'}
            renderItem={({ item }) => {
              const totalAchieved = item.totalAchieved ?? item.monthlyTargets.reduce((sum, t) => sum + (t.achieved || 0), 0);
              const totalTarget = item.monthlyTargets.reduce((sum, t) => sum + t.value, 0);

              return (
                <View style={styles.row}>
                  <Text style={[styles.cell, { width: 100 }]}>{item.id}</Text>
                  <Text style={[styles.cell, { width: 100 }]}>{item.type}</Text>
                  <Text style={[styles.cell, { width: 120 }]}>{item.personId}</Text>
                  <Text style={[styles.cell, { width: 150 }]}>{item.name}</Text>
                  <Text style={[styles.cell, { width: 120 }]}>{item.financialYear}</Text>
                  <Text style={[styles.cell, { width: 120 }]}>{totalTarget}</Text>
                  <Text style={[styles.cell, { width: 120 }]}>{totalAchieved}</Text>
                  <View style={[styles.cell, { width: 100 }]}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => openEditAchModal(item)}>
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        </View>
      </ScrollView>

      {/* Modals for Editing */}
      {editingAllocation && (
        <Modal visible transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Edit Allocation - {editingAllocation.name}</Text>
              <ScrollView style={{ maxHeight: 400 }}>
                {editingAllocation.monthlyTargets.map((m) => (
                  <View key={m.month} style={styles.monthRow}>
                    <Text style={styles.monthLabel}>{m.month}</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={monthTargets[m.month]}
                      onChangeText={(val) => setMonthTargets((prev) => ({ ...prev, [m.month]: val }))}
                    />
                  </View>
                ))}
              </ScrollView>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 }}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#27ae60' }]} onPress={handleSave}>
                  <Text style={styles.actionText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#c0392b' }]} onPress={() => setEditingAllocation(null)}>
                  <Text style={styles.actionText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {editingAchModal && (
        <Modal visible transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Edit Total Achieved - {editingAchModal.name}</Text>
              <TextInput
                style={[styles.input, { alignSelf: 'center', width: 120, marginVertical: 16 }]}
                keyboardType="numeric"
                value={editingAchieved}
                onChangeText={setEditingAchieved}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#27ae60' }]} onPress={handleSaveAchieved}>
                  <Text style={styles.actionText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#c0392b' }]} onPress={() => setEditingAchModal(null)}>
                  <Text style={styles.actionText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#05431aff', paddingVertical: 8, borderRadius: 6 },
  headerCell: { color: '#fff', fontWeight: '600', textAlign: 'center' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ddd', paddingVertical: 6 },
  cell: { fontSize: 13, textAlign: 'center' },
  actionBtn: { backgroundColor: '#2980b9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginHorizontal: 2 },
  actionText: { color: '#fff', fontSize: 12 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalCard: { backgroundColor: '#fff', borderRadius: 8, padding: 16, width: '90%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  monthLabel: { fontWeight: 'bold', width: 120 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, textAlign: 'center' },
});

