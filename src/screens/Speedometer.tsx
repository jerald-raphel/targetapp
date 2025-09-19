import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Allocation } from '../../App';

const { width } = Dimensions.get('window');
const cardWidth = (width - 16 * 2 - 16) / 3; // padding + margin spacing for 3 cards
const cardHeight = 180;
const circleSize = 90;
const circleWidth = 10;

const financialMonths = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];

const SpeedometerScreen: React.FC = () => {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [timeFilter, setTimeFilter] = useState<'Month'|'Quarter'|'Year'>('Month');
  const [viewType, setViewType] = useState<'Individual'|'Team'|'Overall'>('Overall');
  const [selectedPerson, setSelectedPerson] = useState<string|null>(null);

  useEffect(() => {
    (async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('@allocations');
        const data: Allocation[] = jsonValue ? JSON.parse(jsonValue) : [];
        setAllocations(data);
      } catch {
        Alert.alert('Error','Failed to load allocations');
      }
    })();
  }, []);

  const getFilteredAllocations = () => {
    let filtered = [...allocations];
    if (viewType !== 'Overall') {
      filtered = filtered.filter(a => a.type === viewType);
      if (selectedPerson) filtered = filtered.filter(a => a.personId === selectedPerson);
    }
    return filtered;
  };

  const getSpeedometerData = () => {
    const filtered = getFilteredAllocations();
    const map: {[key:string]: number} = {};

    if (timeFilter==='Month') {
      const monthTargetMap: {[key:string]: number} = {};
      financialMonths.forEach(m=>{ map[m]=0; monthTargetMap[m]=0; });

      filtered.forEach(a=>{
        a.monthlyTargets.forEach(mt=>{
          const monthOnly = mt.month.split(' ')[0];
          if(financialMonths.includes(monthOnly)){
            map[monthOnly] += mt.achieved || 0;
            monthTargetMap[monthOnly] += mt.value || 0;
          }
        });
      });

      financialMonths.forEach(m=>{
        const target = monthTargetMap[m];
        map[m] = target ? Math.round((map[m]/target)*100) : 0;
      });

    } else if(timeFilter==='Quarter'){
      const quarters = ['Q1','Q2','Q3','Q4'];
      const quarterTargetMap: {[key:string]:number} = {Q1:0,Q2:0,Q3:0,Q4:0};
      quarters.forEach(q=>map[q]=0);

      filtered.forEach(a=>{
        a.monthlyTargets.forEach(mt=>{
          const monthOnly = mt.month.split(' ')[0];
          const idx = financialMonths.indexOf(monthOnly);
          let q='';
          if(idx>=0 && idx<=2) q='Q1';
          else if(idx<=5) q='Q2';
          else if(idx<=8) q='Q3';
          else q='Q4';
          map[q]+=mt.achieved || 0;
          quarterTargetMap[q]+=mt.value || 0;
        });
      });

      quarters.forEach(q=>{
        const target = quarterTargetMap[q];
        map[q] = target ? Math.round((map[q]/target)*100) : 0;
      });

    } else {
      const fyMap: {[key:string]: {ach: number, target: number}} = {};

      filtered.forEach(a=>{
        const fyStart = parseInt(a.financialYear.split(' ')[1].split('-')[0]);
        const fyLabel = `Apr ${fyStart} - Mar ${fyStart+1}`;

        if(!fyMap[fyLabel]) fyMap[fyLabel] = {ach:0,target:0};

        const totalAch = a.monthlyTargets.reduce((sum,mt)=>sum+(mt.achieved||0),0);
        const totalTarget = a.monthlyTargets.reduce((sum,mt)=>sum+(mt.value||0),0);

        fyMap[fyLabel].ach += totalAch;
        fyMap[fyLabel].target += totalTarget;
      });

      Object.keys(fyMap).forEach(fy=>{
        const {ach,target} = fyMap[fy];
        map[fy] = target ? Math.round((ach/target)*100) : 0;
      });
    }

    return map;
  };

  const getUniquePersons = () => {
    const filtered = allocations.filter(a=>a.type===viewType);
    const map:{[id:string]:string}={};
    filtered.forEach(a=>{ map[a.personId]=a.name||'Unknown'; });
    return Object.keys(map).map(id=>({id,name:map[id]}));
  };

  const speedometerData = getSpeedometerData();

  // Split cards into rows of 3
  const rows = [];
  const keys = Object.keys(speedometerData);
  for (let i=0; i<keys.length; i+=3) {
    rows.push(keys.slice(i, i+3));
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Time Filters */}
      <View style={styles.selectorRow}>
        {['Month','Quarter','Year'].map(t=>(
          <TouchableOpacity key={t} style={[styles.selectorBtn,timeFilter===t?styles.selectorSelected:{}]} onPress={()=>setTimeFilter(t as any)}>
            <Text style={[styles.selectorText,timeFilter===t?styles.selectorTextSelected:{}]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* View Type Filters */}
      <View style={styles.selectorRow}>
        {['Individual','Team','Overall'].map(v=>(
          <TouchableOpacity key={v} style={[styles.selectorBtn,viewType===v?styles.selectorSelected:{}]} onPress={()=>{ setViewType(v as any); setSelectedPerson(null); }}>
            <Text style={[styles.selectorText,viewType===v?styles.selectorTextSelected:{}]}>{v}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Person Selector */}
      {viewType !== 'Overall' && !selectedPerson && (
        <View style={styles.card}>
          <Text style={styles.subtitle}>Select {viewType}:</Text>
          <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled showsVerticalScrollIndicator>
            {getUniquePersons().map(p => (
              <TouchableOpacity key={p.id} style={styles.listItem} onPress={() => setSelectedPerson(p.id)}>
                <Text style={{fontWeight:'600', color:'#333'}}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Speedometer Rows */}
      {rows.map((rowKeys, rowIndex) => (
        <View key={rowIndex} style={{ flexDirection:'row', justifyContent:'space-between', width:'100%', marginBottom:16 }}>
          {rowKeys.map(k=>(
            <View key={k} style={[styles.chartCard, { width: cardWidth, height: cardHeight, alignItems:'center' }]}>
              <AnimatedCircularProgress
                size={circleSize}
                width={circleWidth}
                fill={speedometerData[k]}
                tintColor="#6a1b9a"
                backgroundColor="#eee"
              >
                {()=><Text style={{ fontWeight:'bold', color:'#6a1b9a' }}>{speedometerData[k]}%</Text>}
              </AnimatedCircularProgress>
              <Text style={{marginTop:8, fontWeight:'700', fontSize:14, color:'#333', textAlign:'center'}}>{k}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: '#f5f5f5', alignItems: 'center' },
  selectorRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 6, width: '100%' },
  selectorBtn: { padding: 10, backgroundColor: '#ddd', borderRadius: 8, flex: 1, marginHorizontal: 4, alignItems: 'center' },
  selectorSelected: { backgroundColor: '#000' },
  selectorText: { fontWeight: 'bold', color: '#333' },
  selectorTextSelected: { color: '#fff' },
  card: { backgroundColor: '#fff', padding: 16, marginVertical: 10, borderRadius: 14, elevation: 4, width: '92%' },
  chartCard: { backgroundColor: '#fff', padding: 16, marginVertical: 0, borderRadius: 16, elevation: 4 },
  subtitle: { fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  listItem: { padding: 12, backgroundColor: '#eee', borderRadius: 10, marginBottom: 6 },
});

export default SpeedometerScreen;
