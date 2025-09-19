import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Allocation } from '../../App';

const screenWidth = Dimensions.get('window').width;
const financialMonths = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];

const ChartsScreen: React.FC = () => {
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

  const getUniquePersons = () => {
    const filtered = allocations.filter(a => a.type === viewType);
    const map: { [id: string]: string } = {};
    filtered.forEach(a => { map[a.personId] = a.name || 'Unknown'; });
    return Object.keys(map).map(id => ({ id, name: map[id] }));
  };

  const getFilteredAllocations = (personId?: string) => {
    let filtered = [...allocations];
    if (viewType !== 'Overall') {
      filtered = filtered.filter(a => a.type === viewType);
      if (personId) filtered = filtered.filter(a => a.personId === personId);
    }
    return filtered;
  };

  const prepareChartData = (personId?: string) => {
    const filtered = getFilteredAllocations(personId);
    let labels: string[] = [];
    let allocatedData: number[] = [];
    let achievedData: number[] = [];

    if (timeFilter === 'Month') {
      labels = financialMonths;
      const monthTargetMap: { [key: string]: number } = {};
      labels.forEach(m => { allocatedData.push(0); achievedData.push(0); monthTargetMap[m] = 0; });

      filtered.forEach(a => {
        a.monthlyTargets.forEach(mt => {
          const monthOnly = mt.month.split(' ')[0];
          const idx = labels.indexOf(monthOnly);
          if (idx >= 0) {
            achievedData[idx] += mt.achieved || 0;
            monthTargetMap[monthOnly] += mt.value || 0;
          }
        });
      });

      labels.forEach((m, i) => { allocatedData[i] = monthTargetMap[m]; });

    } else if (timeFilter === 'Quarter') {
      labels = ['Q1', 'Q2', 'Q3', 'Q4'];
      const quarterTargetMap: { [key: string]: number } = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
      labels.forEach(_ => { allocatedData.push(0); achievedData.push(0); });

      filtered.forEach(a => {
        a.monthlyTargets.forEach(mt => {
          const monthOnly = mt.month.split(' ')[0];
          const idxMonth = financialMonths.indexOf(monthOnly);
          let q = '';
          if (idxMonth >= 0 && idxMonth <= 2) q = 'Q1';
          else if (idxMonth <= 5) q = 'Q2';
          else if (idxMonth <= 8) q = 'Q3';
          else q = 'Q4';

          const qIndex = labels.indexOf(q);
          achievedData[qIndex] += mt.achieved || 0;
          quarterTargetMap[q] += mt.value || 0;
        });
      });

      labels.forEach((q, i) => { allocatedData[i] = quarterTargetMap[q]; });

    } else { // Year
      const yearTargetMap: { [key: string]: number } = {};
      const yearAchievedMap: { [key: string]: number } = {};

      filtered.forEach(a => {
        const fyStart = parseInt(a.financialYear.split(' ')[1].split('-')[0]);
        const fyLabel = `${fyStart}-${(fyStart + 1).toString().slice(-2)}`; // compact "2024-25"
        if (!yearTargetMap[fyLabel]) {
          yearTargetMap[fyLabel] = 0;
          yearAchievedMap[fyLabel] = 0;
        }
        yearTargetMap[fyLabel] += a.monthlyTargets.reduce((sum, mt) => sum + (mt.value || 0), 0);
        yearAchievedMap[fyLabel] += a.monthlyTargets.reduce((sum, mt) => sum + (mt.achieved || 0), 0);
      });

      labels = Object.keys(yearTargetMap);
      allocatedData = labels.map(l => yearTargetMap[l]);
      achievedData = labels.map(l => yearAchievedMap[l]);
    }

    const totalAllocated = allocatedData.reduce((a, b) => a + b, 0);
    const totalAchieved = achievedData.reduce((a, b) => a + b, 0);

    return { labels, allocatedData, achievedData, totalAllocated, totalAchieved };
  };

  const renderCharts = () => {
    const persons = viewType === 'Overall'
      ? [{ id: 'overall', name: 'Overall' }]
      : selectedPerson
        ? getUniquePersons().filter(p => p.id === selectedPerson)
        : getUniquePersons();

    return persons.map(p => {
      const { labels, allocatedData, achievedData, totalAllocated, totalAchieved } = prepareChartData(p.id);

      return (
        <View key={p.id} style={styles.chartCard}>
          <Text style={styles.subtitle}>{p.name}</Text>
          <Text style={styles.totalText}>Achieved / Allocated: {totalAchieved} / {totalAllocated}</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View style={{ flexDirection: 'column', paddingBottom: 8 }}>
              {/* BarChart with side-by-side black bars */}
              <BarChart
                data={{
                  labels,
                  datasets: [
                    { data: allocatedData, color: () => '#000' },
                    { data: achievedData, color: () => '#555' }
                  ],
                  legend: ['Allocated', 'Achieved'],
                }}
                width={Math.max(screenWidth - 32, labels.length * 70)}
                height={260}
                chartConfig={chartConfig}
                fromZero
                style={{ borderRadius: 16 }}
                showValuesOnTopOfBars
              />

              {/* LineChart */}
              <LineChart
                data={{
                  labels,
                  datasets: [
                    { data: allocatedData, color: () => '#000', strokeWidth: 2 },
                    { data: achievedData, color: () => '#555', strokeWidth: 3 }
                  ],
                  legend: ['Allocated', 'Achieved']
                }}
                width={Math.max(screenWidth - 32, labels.length * 70)}
                height={240}
                chartConfig={chartConfig}
                bezier
                style={{ marginTop: 16, borderRadius: 16 }}
              />
            </View>
          </ScrollView>
        </View>
      );
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Time Filter */}
      <View style={styles.selectorRow}>
        {['Month', 'Quarter', 'Year'].map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.selectorBtn, timeFilter === t ? styles.selectorSelected : {}]}
            onPress={() => setTimeFilter(t as any)}
          >
            <Text style={{ color: timeFilter === t ? '#fff' : '#000', fontWeight: 'bold' }}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* View Selector */}
      <View style={styles.selectorRow}>
        {['Individual', 'Team', 'Overall'].map(v => (
          <TouchableOpacity
            key={v}
            style={[styles.selectorBtn, viewType === v ? styles.selectorSelected : {}]}
            onPress={() => { setViewType(v as any); setSelectedPerson(null); }}
          >
            <Text style={{ color: viewType === v ? '#fff' : '#000', fontWeight: 'bold' }}>{v}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Select Person */}
      {viewType !== 'Overall' && !selectedPerson && (
        <View style={styles.card}>
          <Text style={styles.subtitle}>Select {viewType}:</Text>
          <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled>
            {getUniquePersons().map(p => (
              <TouchableOpacity key={p.id} style={styles.listItem} onPress={() => setSelectedPerson(p.id)}>
                <Text style={{ fontWeight: '600', color: '#333' }}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Charts */}
      {renderCharts()}
    </ScrollView>
  );
};

const chartConfig = {
  backgroundColor: '#f5f5f5',
  backgroundGradientFrom: '#f5f5f5',
  backgroundGradientTo: '#f5f5f5',
  color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
  labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
  decimalPlaces: 0,
  style: { borderRadius: 16 },
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: '#f5f5f5', alignItems: 'center' },
  selectorRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 6, width: '100%' },
  selectorBtn: { padding: 10, backgroundColor: '#ddd', borderRadius: 8, flex: 1, marginHorizontal: 4, alignItems: 'center' },
  selectorSelected: { backgroundColor: '#000' },
  card: { backgroundColor: '#fff', padding: 16, marginVertical: 10, borderRadius: 14, elevation: 4, width: '92%' },
  chartCard: { backgroundColor: '#fff', padding: 16, marginVertical: 14, borderRadius: 16, elevation: 4, width: '95%' },
  subtitle: { fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  listItem: { padding: 12, backgroundColor: '#eee', borderRadius: 10, marginBottom: 6 },
  totalText: { textAlign: 'center', fontWeight: '700', marginBottom: 12, fontSize: 15 },
});

export default ChartsScreen;
