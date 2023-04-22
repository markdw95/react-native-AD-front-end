import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

const FormDeleteButton = ({ title, submitting, onPress }) => {
  const backgroundColor = submitting
    ? 'rgba(242, 72, 75,0.4)'
    : 'rgba(242, 72, 75,1)';

  return (
    <TouchableOpacity
      onPress={!submitting ? onPress : null}
      style={[styles.container, { backgroundColor }]}
    >
      <Text style={{ fontSize: 18, color: '#fff' }}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FormDeleteButton;
