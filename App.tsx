// import React, { useEffect, useState } from 'react';
// import { SafeAreaView, View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import HomeScreen from './src/screens/HomeScreen';
// import AllocationScreen from './src/screens/AllocationScreen';
// import AchievementScreen from './src/screens/AchievementScreen';
// import DashboardScreen from "./src/screens/DashboardScreen";
// import SpeedometerScreen from './src/screens/Speedometer';
// import PieChartScreen from './src/screens/PieChartScreen';
// import ChartsScreen from './src/screens/ChartsScreen';
// // Updated Allocation interface to include periodType and periodValue
// export interface Allocation {
//   id: string;
//   type: 'Individual' | 'Team';
//   personId: string;
//   name: string;
//   periodType: 'Month' | 'Quarter' | 'Year';
//   periodValue: string; // Month name, Quarter (Q1-Q4), or Year
//   value: number;
// }

// const App = () => {
//   const [allocations, setAllocations] = useState<Allocation[]>([]);
//   const [currentScreen, setCurrentScreen] = useState<'Home' | 'Allocate' | 'Achievement' | 'Dashboard' | 'speedometer' | 'piechart' |'bar'>('Home');

//   useEffect(() => {
//     loadAllocations();
//   }, []);

//   const loadAllocations = async () => {
//     try {
//       const jsonValue = await AsyncStorage.getItem('@allocations');
//       if (jsonValue != null) {
//         setAllocations(JSON.parse(jsonValue));
//       }
//     } catch (e) {
//       Alert.alert('Error', 'Failed to load allocations');
//     }
//   };

//   const saveAllocations = async (newAllocations: Allocation[]) => {
//     try {
//       await AsyncStorage.setItem('@allocations', JSON.stringify(newAllocations));
//     } catch (e) {
//       Alert.alert('Error', 'Failed to save allocations');
//     }
//   };

//   const handleAddAllocation = (allocation: Allocation) => {
//     const newAllocations = [...allocations, allocation];
//     setAllocations(newAllocations);
//     saveAllocations(newAllocations);
//     setCurrentScreen('Home');
//   };

//   const handleEditAllocation = (updated: Allocation) => {
//     const newAllocations = allocations.map((a) => (a.id === updated.id ? updated : a));
//     setAllocations(newAllocations);
//     saveAllocations(newAllocations);
//   };

//   const handleDeleteAllocation = (id: string) => {
//     const newAllocations = allocations.filter((a) => a.id !== id);
//     setAllocations(newAllocations);
//     saveAllocations(newAllocations);
//   };

//   const renderScreen = () => {
//     switch (currentScreen) {
//       case 'Home':
//         return (
//           <HomeScreen
//             allocations={allocations}
//             onEditAllocation={handleEditAllocation}
//             onDeleteAllocation={handleDeleteAllocation}
//           />
//         );
//       case 'Allocate':
//         return <AllocationScreen onAddAllocation={handleAddAllocation} />;
//       case 'Achievement':
//         return <AchievementScreen allocations={allocations} />; // Pass allocations to AchievementScreen if needed
//       case 'Dashboard':
//   return (
//     <DashboardScreen
//   onNavigate={(screen) => {
//     if (screen === 'speedometer') setCurrentScreen('speedometer');
//     else if (screen === 'piechart') setCurrentScreen('piechart');
//     else if (screen === 'bar') setCurrentScreen('bar');
//     else if (screen === 'line') setCurrentScreen('line');
//   }}
// />

//   );
//         case 'speedometer':
//         return <SpeedometerScreen allocations={allocations} />; // Pass allocations for charts
//         case 'piechart':
//   return <PieChartScreen allocations={allocations} />;
//   case 'bar':
//   return <ChartsScreen allocations={allocations} />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       {renderScreen()}

//       <View style={styles.footer}>
//         <TouchableOpacity style={styles.footerButton} onPress={() => setCurrentScreen('Home')}>
//           <Text style={styles.footerText}>Home</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.footerButton} onPress={() => setCurrentScreen('Allocate')}>
//           <Text style={styles.footerText}>Allocate</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.footerButton} onPress={() => setCurrentScreen('Achievement')}>
//           <Text style={styles.footerText}>Achievement</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.footerButton} onPress={() => setCurrentScreen('Dashboard')}>
//           <Text style={styles.footerText}>Dashboard</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default App;

// const styles = StyleSheet.create({
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     height: 50,
//     backgroundColor: '#eee',
//     alignItems: 'center',
//   },
//   footerButton: {
//     height: 44,
//     paddingHorizontal: 12,
//     backgroundColor: '#2196f3',
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   footerText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
// });


// import React, { useEffect, useState } from 'react';
// import { SafeAreaView, View, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import HomeScreen from './src/screens/HomeScreen';
// import AllocationScreen from './src/screens/AllocationScreen';
// import AchievementScreen from './src/screens/AchievementScreen';
// import DashboardScreen from "./src/screens/DashboardScreen";
// import SpeedometerScreen from './src/screens/Speedometer';
// import PieChartScreen from './src/screens/PieChartScreen';
// import ChartsScreen from './src/screens/ChartsScreen';

// // Updated Allocation interface to include periodType and periodValue
// export interface Allocation {
//   id: string;
//   type: 'Individual' | 'Team';
//   personId: string;
//   name: string;
//   periodType: 'Month' | 'Quarter' | 'Year';
//   periodValue: string; // Month name, Quarter (Q1-Q4), or Year
//   value: number;
// }

// const App = () => {
//   const [allocations, setAllocations] = useState<Allocation[]>([]);
//   const [currentScreen, setCurrentScreen] = useState<'Home' | 'Allocate' | 'Achievement' | 'Dashboard' | 'speedometer' | 'piechart' | 'bar' | 'line'>('Home');

//   useEffect(() => {
//     loadAllocations();
//   }, []);

//   const loadAllocations = async () => {
//     try {
//       const jsonValue = await AsyncStorage.getItem('@allocations');
//       if (jsonValue != null) {
//         setAllocations(JSON.parse(jsonValue));
//       }
//     } catch (e) {
//       Alert.alert('Error', 'Failed to load allocations');
//     }
//   };

//   const saveAllocations = async (newAllocations: Allocation[]) => {
//     try {
//       await AsyncStorage.setItem('@allocations', JSON.stringify(newAllocations));
//     } catch (e) {
//       Alert.alert('Error', 'Failed to save allocations');
//     }
//   };

//   const handleAddAllocation = (allocation: Allocation) => {
//     const newAllocations = [...allocations, allocation];
//     setAllocations(newAllocations);
//     saveAllocations(newAllocations);
//     setCurrentScreen('Home');
//   };

//   const handleEditAllocation = (updated: Allocation) => {
//     const newAllocations = allocations.map((a) => (a.id === updated.id ? updated : a));
//     setAllocations(newAllocations);
//     saveAllocations(newAllocations);
//   };

//   const handleDeleteAllocation = (id: string) => {
//     const newAllocations = allocations.filter((a) => a.id !== id);
//     setAllocations(newAllocations);
//     saveAllocations(newAllocations);
//   };

//   const renderScreen = () => {
//     switch (currentScreen) {
//       case 'Home':
//         return (
//           <HomeScreen
//             allocations={allocations}
//             onEditAllocation={handleEditAllocation}
//             onDeleteAllocation={handleDeleteAllocation}
//           />
//         );
//       case 'Allocate':
//         return <AllocationScreen onAddAllocation={handleAddAllocation} />;
//       case 'Achievement':
//         return <AchievementScreen allocations={allocations} />;
//       case 'Dashboard':
//         return (
//           <DashboardScreen
//             onNavigate={(screen) => {
//               if (screen === 'speedometer') setCurrentScreen('speedometer');
//               else if (screen === 'piechart') setCurrentScreen('piechart');
//               else if (screen === 'bar') setCurrentScreen('bar');
//               else if (screen === 'line') setCurrentScreen('line');
//             }}
//           />
//         );
//       case 'speedometer':
//         return <SpeedometerScreen allocations={allocations} />;
//       case 'piechart':
//         return <PieChartScreen allocations={allocations} />;
//       case 'bar':
//         return <ChartsScreen allocations={allocations} />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       {renderScreen()}

//       <View style={styles.footer}>
//         <TouchableOpacity style={styles.iconButton} onPress={() => setCurrentScreen('Home')}>
//           <Image source={require('./src/assets/home.png')} style={styles.icon} />
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.iconButton} onPress={() => setCurrentScreen('Allocate')}>
//           <Image source={require('./src/assets/resources.png')} style={styles.icon} />
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.iconButton} onPress={() => setCurrentScreen('Achievement')}>
//           <Image source={require('./src/assets/achievement.png')} style={styles.icon} />
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.iconButton} onPress={() => setCurrentScreen('Dashboard')}>
//           <Image source={require('./src/assets/bar-chart.png')} style={styles.icon} />
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default App;

// const styles = StyleSheet.create({
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     height: 80,
//     backgroundColor: '#05431aff',
//     alignItems: 'center',
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: -2 },
//     shadowRadius: 4,
//   },
//   iconButton: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: '#01080eff',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   icon: {
//     width: 28,
//     height: 28,
//     tintColor: '#fff',
//   },
// });


import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './src/screens/HomeScreen';
import AllocationScreen from './src/screens/AllocationScreen';
import AchievementScreen from './src/screens/AchievementScreen';
import DashboardScreen from "./src/screens/DashboardScreen";
import SpeedometerScreen from './src/screens/Speedometer';
import PieChartScreen from './src/screens/PieChartScreen';
import ChartsScreen from './src/screens/ChartsScreen';

// ✅ Updated Allocation interface with totalTarget
export interface Allocation {
  id: string;
  type: 'Individual' | 'Team';
  personId: string;
  name: string;
  financialYear: string; // FY 2024–2025
  monthlyTargets: {
    month: string;   // Apr, May, ..., Mar
    value: number;   // Target value for that month
  }[];
  totalTarget: number; // ✅ NEW: sum of all 12 months
}

const App = () => {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [currentScreen, setCurrentScreen] = useState<
    'Home' | 'Allocate' | 'Achievement' | 'Dashboard' | 'speedometer' | 'piechart' | 'bar' | 'line'
  >('Home');

  useEffect(() => {
    loadAllocations();
  }, []);

  const loadAllocations = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@allocations');
      if (jsonValue != null) {
        let loaded: Allocation[] = JSON.parse(jsonValue);

        // ✅ Ensure backward compatibility (add totalTarget if missing)
        loaded = loaded.map(a => ({
          ...a,
          totalTarget: a.totalTarget ?? a.monthlyTargets.reduce((sum, m) => sum + (m.value || 0), 0)
        }));

        setAllocations(loaded);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to load allocations');
    }
  };

  const saveAllocations = async (newAllocations: Allocation[]) => {
    try {
      await AsyncStorage.setItem('@allocations', JSON.stringify(newAllocations));
    } catch (e) {
      Alert.alert('Error', 'Failed to save allocations');
    }
  };

  // ✅ Add a new allocation (full FY with 12 months)
  const handleAddAllocation = (newAllocation: Allocation) => {
    // Ensure totalTarget is calculated
    const allocationWithTotal: Allocation = {
      ...newAllocation,
      totalTarget: newAllocation.monthlyTargets.reduce((sum, m) => sum + (m.value || 0), 0),
    };

    const newAllocations = [...allocations, allocationWithTotal];
    setAllocations(newAllocations);
    saveAllocations(newAllocations);
    setCurrentScreen('Home');
  };

  // ✅ Edit allocation (including month-wise targets)
  const handleEditAllocation = (updated: Allocation) => {
    const updatedWithTotal: Allocation = {
      ...updated,
      totalTarget: updated.monthlyTargets.reduce((sum, m) => sum + (m.value || 0), 0),
    };

    const newAllocations = allocations.map((a) => (a.id === updated.id ? updatedWithTotal : a));
    setAllocations(newAllocations);
    saveAllocations(newAllocations);
  };

  const handleDeleteAllocation = (id: string) => {
    const newAllocations = allocations.filter((a) => a.id !== id);
    setAllocations(newAllocations);
    saveAllocations(newAllocations);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return (
          <HomeScreen
            allocations={allocations}
            onEditAllocation={handleEditAllocation}
            onDeleteAllocation={handleDeleteAllocation}
          />
        );
      case 'Allocate':
        return <AllocationScreen onAddAllocation={handleAddAllocation} />;
      case 'Achievement':
        return <AchievementScreen allocations={allocations} />;
      case 'Dashboard':
        return (
          <DashboardScreen
            onNavigate={(screen) => {
              if (screen === 'speedometer') setCurrentScreen('speedometer');
              else if (screen === 'piechart') setCurrentScreen('piechart');
              else if (screen === 'bar') setCurrentScreen('bar');
              else if (screen === 'line') setCurrentScreen('line');
            }}
          />
        );
      case 'speedometer':
        return <SpeedometerScreen allocations={allocations} />;
      case 'piechart':
        return <PieChartScreen allocations={allocations} />;
      case 'bar':
        return <ChartsScreen allocations={allocations} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {renderScreen()}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.iconButton} onPress={() => setCurrentScreen('Home')}>
          <Image source={require('./src/assets/home.png')} style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={() => setCurrentScreen('Allocate')}>
          <Image source={require('./src/assets/resources.png')} style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={() => setCurrentScreen('Achievement')}>
          <Image source={require('./src/assets/achievement.png')} style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={() => setCurrentScreen('Dashboard')}>
          <Image source={require('./src/assets/bar-chart.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 80,
    backgroundColor: '#05431aff',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#01080eff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 28,
    height: 28,
    tintColor: '#fff',
  },
});
