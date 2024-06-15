import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity } from 'react-native';
import Navbar from './Navbar';
import Footer from './Footwer';
import { Picker } from '@react-native-picker/picker';
const EditItemModal = ({ item, visible, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [gst ,setgst]= useState('')

  useEffect(() => {
    console.log(item)
    if (item) {
      setName(item.name || '');
      setPrice(item.price ? item.price.toString() : '');
      setCode(item.code ? item.code.toString() : '');
      setCategory(item.category || '');
      setgst(item.gst ? item.gst.toString() : '');
      setSellingPrice(item.sellingPrice ? item.sellingPrice.toString() : '');
    }
  }, [item]);

  const handleUpdateItem = () => {
    const updatedItem = {
  
      name : name,
      price: parseFloat(price),
      code: parseInt(code),
      category,
      sellingPrice: parseFloat(sellingPrice),
      gst : parseFloat(gst)
    };
   
    onSave(updatedItem);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text>Edit Item</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Name"
          />
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="Price"
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="Code"
            keyboardType="numeric"
          />
         <Picker
  selectedValue={category}
  style={styles.picker}
  onValueChange={(itemValue, itemIndex) =>
    setCategory(itemValue)
  }
>
  <Picker.Item label="Food" value="Food" />
  <Picker.Item label="Clothing" value="Clothing" />
  <Picker.Item label="Electronics" value="Electronics" />
  <Picker.Item label="Others" value="Others" />
</Picker>
          <TextInput
            style={styles.input}
            value={sellingPrice}
            onChangeText={setSellingPrice}
            placeholder="Selling Price"
            keyboardType="numeric"
          /> 
          
            <TextInput
          style={styles.input}
          value={gst}
          onChangeText={setgst}
          placeholder="GST"
          keyboardType="numeric"
        />
          <TouchableOpacity style={styles.button} onPress={handleUpdateItem}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onCancel}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>

  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width : '50%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  picker: {
    height: 50, // Adjust height as needed
    width: '100%', // Adjust width as needed
    backgroundColor: '#ffffff', // Adjust background color as needed
    borderWidth: 1, // Add border styles if needed
    borderColor: '#ccc', // Adjust border color as needed
    borderRadius: 5, // Adjust border radius as needed
    marginBottom: 10, // Adjust margin as needed
    paddingHorizontal: 10, // Adjust padding as needed
  },
});

export default EditItemModal;
