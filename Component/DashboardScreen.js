import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput,Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConfirmDialog } from 'react-native-simple-dialogs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Navbar from './Navbar';
import Footer from './Footwer';

const db = SQLite.openDatabaseSync('bills.db');

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [billIds, setBillIds] = useState([]);
  const [filteredBillIds, setFilteredBillIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBillId, setSelectedBillId] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  useEffect(() => {
    fetchBillIds();
  }, []);

  // Function to fetch unique bill IDs
  const fetchBillIds = async () => {
    try {
      const result = await db.getAllAsync('SELECT DISTINCT billId FROM  printable', []);
      console.log(result);
      const billIds = result.map((item) => item.billid);
      setBillIds(billIds);
      setFilteredBillIds(billIds);
    } catch (error) {
      console.error('Error fetching bill IDs:', error);
    }
  };

  // Function to handle bill ID click
  const handleBillIdClick = (billId) => {
    navigation.navigate('BillScreen', { billId });
  };

  // Function to handle delete icon click
  const handleDeleteIconClick = (billId) => {
    setSelectedBillId(billId);
    setDialogVisible(true);
  };

  // Function to confirm deletion
  const confirmDelete = async () => {
    try {
      await db.runAsync('DELETE FROM printable WHERE billId = ?', [selectedBillId]);
      const updatedBillIds = billIds.filter(id => id !== selectedBillId);
      setBillIds(updatedBillIds);
      setFilteredBillIds(updatedBillIds);
      setDialogVisible(false);
    } catch (error) {
      console.error('Error deleting bill:', error);
    }
  };

  // Function to handle search query change
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filtered = billIds.filter(billId => billId.toLowerCase().includes(query.toLowerCase()));
      setFilteredBillIds(filtered);
    } else {
      setFilteredBillIds(billIds);
    }
  };

  // Render each bill ID as a list item
  const renderBillIdItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity onPress={() => handleBillIdClick(item)}>
        <Text style={styles.itemText}>{item}</Text>
      </TouchableOpacity>
      <Icon
        name="delete"
        size={24}
        color="red"
        onPress={() => handleDeleteIconClick(item)}
        style={styles.deleteIcon}
      />
    </View>
  );

  return (
  
      <View style={styles.container}>
        <Text style={styles.title}>Dashboard Screen</Text>
        <TextInput
          style={styles.searchBar}
          placeholder="Search Bill ID"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <FlatList
          data={filteredBillIds}
          renderItem={renderBillIdItem}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.listContainer}
        />
        <Footer />
        <ConfirmDialog
          title="Confirm Delete"
          message="Are you sure you want to delete this bill?"
          visible={dialogVisible}
          onTouchOutside={() => setDialogVisible(false)}
          positiveButton={{
            title: "YES",
            onPress: confirmDelete
          }}
          negativeButton={{
            title: "NO",
            onPress: () => setDialogVisible(false)
          }}
        />
      </View>
  
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    marginHorizontal: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
      android: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 18,
    color: '#333',
  },
  deleteIcon: {
    marginLeft: 10,
  },
});

export default DashboardScreen;
