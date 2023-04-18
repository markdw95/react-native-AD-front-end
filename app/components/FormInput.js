import React from 'react';
import { View, StyleSheet, Text, TextInput } from 'react-native';

const FormInput = props => {
  const { placeholder, label, error, disabled } = props;
  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 5,
        }}
      >
        <Text style={{ fontWeight: 'bold', color: 'black' }}>{label}</Text>
        {error ? (
          <Text style={{ color: 'red', fontSize: 16 }}>{error}</Text>
        ) : null}
      </View>
      <TextInput {...props} placeholder={placeholder} placeholderTextColor="gray" style={styles.input} editable={disabled}/>
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    height: 35,
    borderRadius: 8,
    fontSize: 16,
    paddingLeft: 10,
    marginBottom: 20,
  },
});

export default FormInput;
