import React from 'react';
import { View, StyleSheet, Text, TextInput } from 'react-native';

const FormRowInput = props => {
  const { placeholder, label, error, disabled, inputWidth, keyboardType } = props;
  return (
    <>
      <View
        style={{
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: inputWidth
        }}
      >
        <TextInput {...props} placeholder={placeholder} keyboardType={keyboardType} placeholderTextColor="gray" style={styles.input} editable={disabled}/>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    height: 35,
    borderRadius: 4,
    fontSize: 16,
    paddingLeft: 10,
  },
});

export default FormRowInput;
