import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView,Alert } from 'react-native';
import Footwer from './Footwer';
import Navbar from './Navbar';
import * as SQLite from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { SafeAreaView} from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
const db = SQLite.openDatabaseSync('bills.db');







const HomeScreen = ({ navigation }) => {
  const route = useRoute();

  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editPrice, setEditPrice] = useState('');
  const [did, setDid] = useState();
  const [editGst, setEditGst] = useState();
  const [editQuantity, setEditQuantity] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const {  billId, billName,lop, clerbill} = route.params;



const printtable = async () => {
 
  try {
    // Create the table if it doesn't exist
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS printable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        itemname TEXT,
        itemcode TEXT,
        quantity INTEGER,
        price INTEGER,
        withoutgst INTEGER,
        totalpricewithgst INTEGER,
        billname TEXT,
        billid TEXT,
        gst INTEGER,
        createdate DATETIME
      );`
    );

    // Iterate over the items array and insert each item into the table
    const now = new Date().toISOString();
    for (const item of items) {
      console.log(item)
    console.log(item.name)
      const totalPriceWithoutGST = parseFloat(item.quantity) * item.price;
      const gstAmount = totalPriceWithoutGST * (item.gst / 100);
      const totalPriceWithGST = totalPriceWithoutGST + gstAmount;

      await db.runAsync(
        `INSERT INTO printable (itemname, itemcode, quantity, price, withoutgst, totalpricewithgst, billname, billid, createdate, gst) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [item.itemname, item.itemcode, item.quantity, item.price, totalPriceWithoutGST, totalPriceWithGST, billName, billId, now, item.gst]
      );
    }
  } catch (e) {
    console.log(e);
  }
};

  useEffect(() => {

    if (billId) {
      console.log('running form home')
      fetchBillItems();
    }
 
  }, [billId, lop, clerbill, handleClear]);
  useEffect(() => {
    console.log('running form home')
    fetchBillItems();
  }, []);

  const fetchBillItems = async () => {
    try {
      const result = await db.getAllAsync(
        `SELECT * FROM newbilsss WHERE billid = ?;`,
        [billId]
      );
      if (result.length > 0) {
        setItems(result);
        calculateTotalAmount(result);
      } 
    } catch (error) {
      console.error('Error fetching bill items:', error);
    }
  };


  const calculateTotalAmount = (items) => {
    const total = items.reduce((sum, item) => sum + item.totalpricewithgst, 0);
    setTotalAmount(total);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setEditPrice(item.price);
    setEditGst(item.gst);
    setEditQuantity(item.quantity);
    setEditModalVisible(true);
  };

  const handleDeleteItem = async () => {
    try {
      await db.runAsync(
        `DELETE FROM newbilsss WHERE id = ?;`,
        [did]
      );
      setDeleteModalVisible(false);
      fetchBillItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };
  
  const handlnewbilldelete = async () => {

    try {
      console.log('tyr to del')
      await db.runAsync(
        `DELETE FROM newbilsss WHERE billid = ?;`,
        [billId]
      );
    
  
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleUpdateItem = async () => {
    const totalPriceWithoutGST = editQuantity * editPrice;
    const gstAmount = totalPriceWithoutGST * (editGst / 100);
    const totalPriceWithGST = totalPriceWithoutGST + gstAmount;

    try {
      await db.runAsync(
        `UPDATE newbilsss SET totalpricewithgst = ?, withoutgst = ?, quantity = ? WHERE id = ?;`,
        [totalPriceWithGST, totalPriceWithoutGST, editQuantity, selectedItem.id]
      );
      setEditModalVisible(false);
    fetchBillItems()
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handlePrint = async () => {
    if (items.length === 0) {
      Alert.alert(
        'No Item Selected',
        'Please select an item before printing.',
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
      );
      return;
    }

    printtable()
    const htmlContent = `
    <html>
      <head>
        <title>Bill Details</title>
        <style>
          body { 
            font-family: Arial, sans-serif;
            background-color: #fff;
            color: #333;
            margin: 0;
            padding: 0;
          }
          h1 { 
            text-align: center;
            margin-top: 20px;
          }
          .he {
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: space-around;
            padding: 10px;
            border-bottom: 1px solid #ddd;
          }
          .h {
            text-align: center;
            width: 100%;
            display: flex;
            align-items: center;
            margin-top: 20px;
            margin-bottom: 10px;
          }
          .box {
            width: 100%;
            margin: 0 auto;
            padding: 20px;
          }
          .boxmain {
            display: table-row;
          }
          .boxmain > div {
         
            display: table-cell;
            padding: 25px;
            border: 1px solid #ddd;
          }
          .table-header {
            font-weight: bold;
          }
          .overall-total {
            display: flex;
            width:90%;
            justify-content: space-around;
            padding: 8px;
            border: 1px solid #ddd;
          }
        </style>
      </head>
      <body>
        <h1>Bill Details</h1>
        <div class='he'>
          <div>
            <p>Bill ID: ${billId}</p>
            <p>Date and Time: ${new Date().toLocaleString()}</p>
          </div>
          <p>Bill Name: ${billName}</p>
        </div>
        <div class='box'>
          <h2 class='h'>Items:</h2>
          <div class='table-header boxmain'>
            <div>Item Name</div>
            <div>Item Code</div>
            <div>Quantity</div>
            <div>Price</div>
            <div>Price Without GST</div>
            <div>Total Price</div>
          </div>
          ${items.map(
            (item) => `
              <div class='boxmain' key=${item.id}>
                <div>${item.itemname}</div>
                <div>${item.itemcode}</div>
                <div>${item.quantity}</div>
                <div>${item.price}</div>
                <div>${item.withoutgst}</div>
                <div>${item.totalpricewithgst}</div>
              </div>
            `
          ).join('')}
          <div class='overall-total'>
            <div>Overall Total:</div>
            <div>${totalAmount}</div>
          </div>
        </div>
      </body>
    </html>
  `;




    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent, base64: false });
      console.log('Printed successfully:', uri);
      await shareAsync(uri);
      handlnewbilldelete()
      clerbill()
      handleClear()

      setTotalAmount(0)
 

    } catch (error) {
      console.error('Error printing:', error);
    }
  };
  
  const handleClear =  () => {
    setItems([]);
    setSelectedItem(null);
    setTotalAmount(0);
 
      setDeleteModalVisible(false);
      fetchBillItems();
   
    navigation.setParams({ billId: null, billName: null });
  };

  return (

    <View style={styles.container}>
      <View style={styles.container}>
        {/* <Navbar allSet={allSet} lop={() => setLop(!lop)} /> */}
        <ScrollView>
          <View style={styles.header}>
            <Text style={styles.headerText}>Bill ID: {billId}</Text>
            <Text style={styles.headerText}>Bill Name: {billName}</Text>
            
          </View>
          <View style={styles.itemList}>
            <Text style={styles.itemListTitle}>Items:</Text>
            {items.reverse().map((item) => (
              <View key={item.id} style={styles.item}>
                <Text>{item.itemname}</Text>
                <Text>Code: {item.itemcode}</Text>
                <Text>Quantity: {item.quantity}</Text>
                <Text>Price: {item.price}</Text>
                <Text>Price With Out GST: {item.withoutgst}</Text>
                <Text>Total Price: {item.totalpricewithgst}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => handleEditItem(item)}>
                    <Ionicons name="create-outline" size={24} color="blue" style={styles.actionIcon} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setDeleteModalVisible(true), setDid(item.id) }}>
                    <Ionicons name="trash-outline" size={24} color="red" style={styles.actionIcon} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
          <View style={styles.totalAmountContainer}>
              <Text style={styles.totalAmountText}>Total Amount: {totalAmount}</Text>
            </View>
        </ScrollView>
      
        <TouchableOpacity onPress={ handlePrint}>
          <View style={styles.printButton}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Print</Text>
          </View>
        </TouchableOpacity>
      </View>
      <Footwer />
      <Modal visible={editModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Item</Text>
            <TextInput
              placeholder="Quantity"
              value={editQuantity}
              onChangeText={setEditQuantity}
              keyboardType="numeric"
              style={styles.input}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.button} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleUpdateItem}>
                <Text style={styles.buttonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={deleteModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Item?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.button} onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: 'red' }]} onPress={handleDeleteItem}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemList: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  itemListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionIcon: {
    marginRight: 10,
  },
  printButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    margin: 20,
  },
  clearButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    margin: 20,
    position: 'absolute',
    bottom: 66, // Adjusted to be just above the print button
  
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  button: {
    marginLeft: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'blue',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  totalAmountContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  totalAmountText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  
});

export default HomeScreen;
