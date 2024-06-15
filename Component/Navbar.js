import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';

const db = SQLite.openDatabaseSync('bills.db');

const Navbar = ({ allSet,lop,setallitems, billId ,billName,setBillName}) => {
  const [code, setCode] = useState('');
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  // const [billId, setbillId] = useState('');
  // const [billName, setBillName] = useState('');
  const [quantityModal, setQuantityModal] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);
  const [gst, setGst] = useState();
  const [showGenerateBillPopup, setShowGenerateBillPopup] = useState(false);
  const navigation = useNavigation();
  const [itemmodale,setitemmodel]= useState(false)
  const show =()=>{
    navigation.navigate('Main')
  }
  useEffect(() => {
    // Create table if not exists
    createTable();
  
  }, []);

  const createTable = async () => {
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS newbilsss (
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
   billcounter()
  };
const  billcounter  = async()=>{
  await db.execAsync(`
  CREATE TABLE IF NOT EXISTS BillCounter (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    counter INTEGER );`
  );
  const result = await db.getAllAsync(`SELECT * FROM BillCounter`);
  console.log(result)
  if (result.length === 0) {
    console.log('hey')
    await db.runAsync(`INSERT INTO BillCounter (counter) VALUES (?)`);
    [1]
  }
}

  const handleAddBill = async () => {
    try {
      // Check if a bill with the same bill ID and item code already exists
      const existingBill = await db.getAllSync(
        `SELECT * FROM newbilsss WHERE billid = ? AND itemcode = ?;`,
        [billId, code]
      );
  console.log(existingBill)
      if (existingBill.length > 0) {
        console.log('A bill with the same bill ID and item code already exists');
        return;
      }
      // Calculate prices
      const totalPriceWithoutGST = parseFloat(quantity) * selectedResult.price;
      const gstAmount = totalPriceWithoutGST * (selectedResult.gst / 100);
      const totalPriceWithGST = totalPriceWithoutGST + gstAmount;

      const now = new Date().toISOString();
      await db.runAsync(
        `INSERT INTO newbilsss (itemname, itemcode, quantity, price, withoutgst, totalpricewithgst, billname, billid, createdate, gst) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [selectedResult.name, selectedResult.code, quantity, selectedResult.price, totalPriceWithoutGST, totalPriceWithGST, billName, billId, now, selectedResult.gst]
      );
      setitemmodel(true);
lop()

    } catch (error) {
      console.error('Error adding bill:', error);
    }
  };

  const handleSearch = async (text) => {
    setSearchText(text);
    filterData(text);
  };

  const filterData = async (text) => {
    if (!text) {
      setSearchResults([]);
      return;
    }

    try {
      const result = await db.getAllAsync(
        `SELECT * FROM itemss WHERE name LIKE ? OR code LIKE ?;`,
        [`%${text}%`, `%${text}%`]
      );
      setSearchResults(result);
    } catch (error) {
      console.error('Error filtering data:', error);
      setSearchResults([]);
    }
  };

  const generateBillId = async () => {
    const db = await SQLite.openDatabaseAsync('bills.db');
    const result = await db.getAllAsync(`SELECT counter FROM BillCounter`);
    let counter = result[0].counter;
    console.log(counter)

    // Increment the counter
    counter += 1;

    // Update the counter in the database
    await db.runAsync('UPDATE BillCounter SET counter = ? WHERE id = 1', [counter]);
    const billId = `BYT${String(counter).padStart(6, '0')}`;


    setShowSuccessModal(true);
    allSet(billId , billName);


  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons name="storefront" size={24} color="#333" />
        </View>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={24} color="#333" style={styles.searchIcon} />
          <TextInput
            placeholder="Search..."
            value={searchText}
            onChangeText={handleSearch}
            style={styles.searchInput}
          />
        </View>

        <TouchableOpacity style={styles.billIconContainer} onPress={() => setShowBillModal(true)}>
          <Ionicons name="receipt" size={24} color="#333" />
        </TouchableOpacity>

        <Modal visible={showBillModal} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Enter Bill Name</Text>
              <TextInput
                placeholder="Bill Name"
                value={billName}
                onChangeText={setBillName}
                style={styles.input}
              />
              <TouchableOpacity style={styles.button} onPress={generateBillId}>
                <Text style={styles.buttonText}>Generate Bill ID</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowBillModal(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={showSuccessModal} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Bill ID Generated Successfully</Text>
              <Text style={styles.modalText}>Generated Bill ID: {billId}</Text>
              <TouchableOpacity style={styles.button} onPress={() => {
                setShowSuccessModal(false);
                setShowBillModal(false);
                show()
                lop()
              }}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal visible={itemmodale} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Item ADDED</Text>
              <Text style={styles.modalText}>Generated Bill ID: {billId}</Text>
              <TouchableOpacity style={styles.button} onPress={() => {
                setitemmodel(false);
                setShowBillModal(false);
                show()
                lop()
              }}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={quantityModal} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Enter Quantity</Text>
              <TextInput
                placeholder="Quantity"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                style={styles.input}
              />
              <TouchableOpacity style={styles.button} onPress={() => {
                setQuantityModal(false);
                if (billId && quantity && selectedResult) {
                  handleAddBill();
                  show()
                } else {
                  console.log('Bill ID not generated or quantity not provided');
                }
              }}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={() => setQuantityModal(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={showGenerateBillPopup} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Generate Bill ID</Text>
              <Text style={styles.modalText}>Please generate a Bill ID first</Text>
              <TouchableOpacity style={styles.button} onPress={() => setShowGenerateBillPopup(false)}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
      {searchResults.length > 0 && (
          <View style={styles.parentContainer}>
  <View style={styles.searchResultsContainer}>
    <FlatList
      style={styles.searchResultsBox}
      data={searchResults}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => {
            if (billId) {
              setSelectedResult(item);
setallitems(item)
              setQuantityModal(true);
              setCode(item.code);
            } else {
              setShowGenerateBillPopup(true)
            }
          }}>
        
          <View style={styles.searchResultItem}>
            <Text>{item.name} - {item.code}</Text>
          </View>
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.id.toString()}
    />
    {/* Recommendations or additional content */}
  </View>
  </View> 
)}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#405DE6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    height: 70,
  },
  iconContainer: {
    paddingHorizontal: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flex: 1,
    marginHorizontal: 10,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  billIconContainer: {
    paddingHorizontal: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#405DE6',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#405DE6',
    fontSize: 16,
    fontWeight: 'bold',
  },
   parentContainer: {
   
    position: 'relative', // Ensure the parent container is positioned
  },
  searchResultsBox: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 16,
  },
  searchResultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
}); 

export default Navbar;
