import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart } from 'react-native-chart-kit';
import { Allocation } from '../../App';

const screenWidth = Dimensions.get('window').width;
const financialMonths = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
const pieColors = ['#4A90E2', '#50E3C2', '#F5A623', '#BD10E0', '#FF5733', '#C70039', '#900C3F', '#581845'];

const PieChartScreen: React.FC = () => {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [timeFilter, setTimeFilter] = useState<'Month' | 'Quarter' | 'Year'>('Month');
  const [viewType, setViewType] = useState<'Individual' | 'Team' | 'Overall'>('Overall');
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('@allocations');
        setAllocations(jsonValue ? JSON.parse(jsonValue) : []);
      } catch {
        Alert.alert('Error', 'Failed to load allocations');
      }
    })();
  }, []);

  const getFilteredAllocations = (personId?: string) => {
    let filtered = [...allocations];
    if (viewType !== 'Overall') {
      filtered = filtered.filter(a => a.type === viewType);
      if (personId) filtered = filtered.filter(a => a.personId === personId);
    }
    return filtered;
  };

  const getUniquePersons = () => {
    const filtered = allocations.filter(a => a.type === viewType);
    const map: { [id: string]: string } = {};
    filtered.forEach(a => { map[a.personId] = a.name || 'Unknown'; });
    return Object.keys(map).map(id => ({ id, name: map[id] }));
  };

  const preparePieData = (personId?: string) => {
    const filtered = getFilteredAllocations(personId);
    const map: { [key: string]: number } = {};
    const targetMap: { [key: string]: number } = {};

    if (timeFilter === 'Month') {
      financialMonths.forEach(m => { map[m] = 0; targetMap[m] = 0; });
      filtered.forEach(a => {
        a.monthlyTargets.forEach(mt => {
          const monthOnly = mt.month.split(' ')[0];
          if (financialMonths.includes(monthOnly)) {
            map[monthOnly] += mt.achieved || 0;
            targetMap[monthOnly] += mt.value || 0;
          }
        });
      });
    } else if (timeFilter === 'Quarter') {
      const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
      quarters.forEach(q => { map[q] = 0; targetMap[q] = 0; });
      filtered.forEach(a => {
        a.monthlyTargets.forEach(mt => {
          const monthOnly = mt.month.split(' ')[0];
          const idx = financialMonths.indexOf(monthOnly);
          let q = '';
          if (idx >= 0 && idx <= 2) q = 'Q1';
          else if (idx <= 5) q = 'Q2';
          else if (idx <= 8) q = 'Q3';
          else q = 'Q4';
          map[q] += mt.achieved || 0;
          targetMap[q] += mt.value || 0;
        });
      });
    } else { // Year
      filtered.forEach(a => {
        const fyStart = parseInt(a.financialYear.split(' ')[1].split('-')[0]);
        // Short year label: 24-25
        const fyLabel = `${fyStart.toString().slice(-2)}-${(fyStart + 1).toString().slice(-2)}`;
        
        if (!map[fyLabel]) map[fyLabel] = 0;
        if (!targetMap[fyLabel]) targetMap[fyLabel] = 0;
        
        const totalAch = a.monthlyTargets.reduce((sum, mt) => sum + (mt.achieved || 0), 0);
        const totalTarget = a.monthlyTargets.reduce((sum, mt) => sum + (mt.value || 0), 0);
        
        map[fyLabel] += totalAch;
        targetMap[fyLabel] += totalTarget;
      });
    }

    const pieData = Object.keys(map).map((key, index) => {
      const achieved = map[key];
      const allocated = targetMap[key] || 0;
      if (allocated === 0) return null;
      return {
        name: key,
        achieved,
        remaining: Math.max(allocated - achieved, 0),
        colorAchieved: pieColors[index % pieColors.length],
        colorRemaining: '#ddd',
      };
    }).filter(d => d !== null);

    const totalAchieved = Object.keys(map).reduce((sum, k) => sum + (map[k] || 0), 0);
    const totalAllocated = Object.keys(targetMap).reduce((sum, k) => sum + (targetMap[k] || 0), 0);

    return { pieData, totalAchieved, totalAllocated };
  };

  const renderCharts = () => {
    const persons = viewType === 'Overall'
      ? [{ id: 'overall', name: 'Overall' }]
      : (selectedPerson
        ? getUniquePersons().filter(p => p.id === selectedPerson)
        : getUniquePersons());

    return persons.map(p => {
      const { pieData, totalAchieved, totalAllocated } = preparePieData(p.id === 'overall' ? undefined : p.id);
      if (!pieData || pieData.length === 0) {
        return (
          <View key={p.id} style={styles.chartCard}>
            <Text style={styles.chartTitle}>{p.name}</Text>
            <Text>No data available</Text>
          </View>
        );
      }

      const chartDataForLib = pieData.map(item => ({
        name: `${item.name}`,
        population: item.achieved,
        color: item.colorAchieved,
        legendFontColor: '#333',
        legendFontSize: 13,
      }));

      return (
        <View key={p.id} style={styles.chartCard}>
          <Text style={styles.chartTitle}>{p.name}</Text>

          <PieChart
            data={chartDataForLib}
            width={screenWidth - 64}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
            <View style={styles.dataContainer}>
              {pieData.map((item, index) => (
                <View key={index} style={styles.dataRow}>
                  <View style={[styles.colorBadge, { backgroundColor: item.colorAchieved }]} />
                  <Text style={styles.dataLabel}>{item.name}</Text>
                  <Text style={styles.dataValue}>Achieved: {item.achieved}</Text>
                  <Text style={[styles.dataValue, { color: '#888' }]}>Remaining: {item.remaining}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.totalBox}>
            <Text style={styles.totalText}>🎯 Total Achieved: {totalAchieved}</Text>
            <Text style={styles.totalText}>📊 Total Allocated: {totalAllocated}</Text>
          </View>
        </View>
      );
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.screenTitle}>📈 Allocation Analysis</Text>

      <View style={styles.selectorRow}>
        {['Month', 'Quarter', 'Year'].map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.selectorBtn, timeFilter === t ? styles.selectorSelected : {}]}
            onPress={() => setTimeFilter(t as any)}>
            <Text style={[styles.selectorText, timeFilter === t && { color: '#fff' }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.selectorRow}>
        {['Individual', 'Team', 'Overall'].map(v => (
          <TouchableOpacity
            key={v}
            style={[styles.selectorBtn, viewType === v ? styles.selectorSelected : {}]}
            onPress={() => { setViewType(v as any); setSelectedPerson(null); }}>
            <Text style={[styles.selectorText, viewType === v && { color: '#fff' }]}>{v}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {viewType !== 'Overall' && !selectedPerson && (
        <View style={styles.card}>
          <Text style={styles.selectTitle}>Select {viewType}:</Text>
          <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled contentContainerStyle={{ paddingVertical: 6 }}>
            {getUniquePersons().map(p => (
              <TouchableOpacity key={p.id} style={styles.listItem} onPress={() => setSelectedPerson(p.id)}>
                <Text style={styles.listItemText}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {renderCharts()}
    </ScrollView>
  );
};

const chartConfig = {
  backgroundColor: '#fff',
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(33,150,243,${opacity})`,
  labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: '#f5f5f5', alignItems: 'center' },
  screenTitle: { fontSize: 20, fontWeight: '800', marginBottom: 12, color: '#333' },

  selectorRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 8, width: '100%' },
  selectorBtn: {
    paddingVertical: 10,
    backgroundColor: '#eee',
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 6,
    alignItems: 'center',
    elevation: 2,
  },
  selectorSelected: { backgroundColor: '#2196f3', elevation: 4 },
  selectorText: { fontWeight: '700', fontSize: 14, color: '#333' },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 10,
    borderRadius: 16,
    width: '95%',
    elevation: 3,
  },
  chartCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 14,
    borderRadius: 18,
    width: '95%',
    alignItems: 'center',
    elevation: 4,
  },
  chartTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 16, color: '#222' },

  selectTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: '#444' },
  listItem: {
    padding: 12,
    backgroundColor: '#f0f4f8',
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
  },
  listItemText: { fontSize: 14, fontWeight: '600', color: '#333' },

  dataContainer: { flexDirection: 'row' },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginRight: 20,
  },
  colorBadge: { width: 14, height: 14, borderRadius: 7, marginRight: 6 },
  dataLabel: { fontWeight: '600', fontSize: 14, color: '#333', marginRight: 6 },
  dataValue: { fontSize: 13, marginLeft: 4, fontWeight: '500', color: '#333' },

  totalBox: {
    marginTop: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    elevation: 2,
  },
  totalText: { fontWeight: '700', fontSize: 15, color: '#1565c0', marginVertical: 2 },
});

export default PieChartScreen;
