import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface DashboardProps {
  onNavigate: (screen: 'speedometer' | 'piechart' | 'bar' | 'line') => void;
}

const DashboardScreen: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <TouchableOpacity style={styles.cardButton} onPress={() => onNavigate('speedometer')}>
        <Text style={styles.buttonText}>Speedometer</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cardButton} onPress={() => onNavigate('piechart')}>
        <Text style={styles.buttonText}>Pie Chart</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cardButton} onPress={() => onNavigate('bar')}>
        <Text style={styles.buttonText}>Charts</Text>
      </TouchableOpacity>

      {/* <TouchableOpacity style={styles.cardButton} onPress={() => onNavigate('line')}>
        <Text style={styles.buttonText}>Line Chart</Text>
      </TouchableOpacity> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#d9d9d9', // same grey background
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 32 },
  cardButton: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    marginVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    // Card shadow for Android
    elevation: 4,
    // Card shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  buttonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
});

export default DashboardScreen;
