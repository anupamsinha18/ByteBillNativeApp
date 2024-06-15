import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert,Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons
import * as SQLite from 'expo-sqlite';
import EditItemModal from './EditItemModal';
import Navbar from './Navbar';
import Footer from './Footwer';
import { SafeAreaView } from 'react-native-safe-area-context'
const db = SQLite.openDatabaseSync('bills.db');

const ItemScreen = () => {
  const [items, setItems] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  
  const fetchItems = async () => {
    try {
      const result = await db.getAllAsync('SELECT * FROM itemss;');
      const itemsArray = result; // Extract items from the result
      
      setItems(itemsArray); // Update state with the fetched items
    } catch (error) {
      console.error(error);
    }
  };
  

  const handleEditItem = (item) => {
    setSelectedItemId(item);
    setEditModalVisible(true);
  };

  const handleCancelEdit = () => {
    setSelectedItemId(null);
    setEditModalVisible(false);
  };

  const handleSaveEdit = async (updatedItem) => {
    console.log(updatedItem)
    try {
      await db.runAsync('UPDATE itemss SET name = ?, price = ?, code = ?, category = ?, sellingPrice = ?, gst=? WHERE id = ?;', [
        updatedItem.name,
        updatedItem.price,
        updatedItem.code,
        updatedItem.category,
        updatedItem.sellingPrice,
        updatedItem.gst,
        selectedItemId.id
      ]);
      
      setSelectedItemId(null);
      setEditModalVisible(false);
      fetchItems();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = (itemId) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await db.runAsync('DELETE FROM itemss WHERE id = ?;', [itemId]);
              fetchItems();
            } catch (error) {
              console.error('Error deleting item:', error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };
  
  return (
    <>
 
      
      <View style={styles.container}>

        <FlatList
          data={items}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>Price: {item.price} </Text>
                <Text style={styles.itemCategory}>Category: {item.category}</Text>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => handleEditItem(item)}>
                  <Ionicons name="create-outline" size={24} color="blue" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
                  <Ionicons name="trash-outline" size={24} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={() => (
            <View style={styles.header}>
              <Text style={styles.headerText}>Name</Text>
              <Text style={styles.headerText}>Price</Text>
              <Text style={styles.headerText}>Category</Text>
              <Text style={styles.headerText}>Actions</Text>
            </View>
          )}
        />
        
        <EditItemModal
          visible={editModalVisible}
          item={selectedItemId}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      </View>
      <Footer />

    </>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
      android: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    color: '#333',
  },
  itemCategory: {
    fontSize: 14,
    color: '#666',
  },
  itemDetails: {
    flex: 1,
    marginRight: 10,
  },
  itemActions: {
    flexDirection: 'row',
  },
});


export default ItemScreen;
