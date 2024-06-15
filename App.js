import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView, StyleSheet } from 'react-native';

import HomeScreen from './Component/HomeScreen';
// import ItemScreen from './Component/ItemScreen';
// import DashboardScreen from './Component/DashboardScreen';
// import BillScreen from './Component/BillScreen';
import Navbar from './Component/Navbar';

const Stack = createStackNavigator();

export default function App() {
  const [billId, setBillId] = useState('');
  const [billName, setBillName] = useState('');
  const [lop, setLop] = useState(false);
  const [itemss , setitems] = useState([])


  const allSet = (id, name) => {
    setBillId(id);
    setBillName(name);
  };
 


  const setallitems = (item)=>{
setitems(item)
    console.log(item)
  }

  const  clerbill = ()=>{
    setBillId('')
    setBillName('')
  }

const lops = () =>{ setLop(!lop)
console.log(lop)
}
  return (
 
    <SafeAreaView style={styles.container}>
    <NavigationContainer>
     
  <Navbar allSet={allSet} lop={lops} setallitems={setallitems}  billId={billId} billName={billName} setBillName={setBillName}/>
        <Stack.Navigator>
          <Stack.Screen
            name="Main"
            component={HomeScreen}
            options={{ headerShown: false }}
            initialParams={{  billId, billName , lop, clerbill  } }
          />
          {/* <Stack.Screen
            name="Item"
            component={ItemScreen}
            options={{ headerShown: false }}
    
          />
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ headerShown: false }}
           
          />
          <Stack.Screen
            name="BillScreen"
            component={BillScreen}
            options={{ headerShown: false }}
      
          /> */}
        </Stack.Navigator>
      
    </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
backgroundColor:'transparent',
    flex: 1,

    
  },
});
