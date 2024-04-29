import React, { ReactNode } from 'react';
import { StyleSheet, View, TextStyle } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

interface Props {
  bgColor?: string;
  children: ReactNode;
}

const VerifaiSafeAreaView: React.FC<Props> = ({ bgColor, children }) => {
  const safeAreaStyles: TextStyle = StyleSheet.flatten([
    styles.safeArea,
    {
      backgroundColor: bgColor ? bgColor : 'red',
    },
  ]);

  return (
    <SafeAreaProvider
      style={{
        ...safeAreaStyles,
        paddingTop: initialWindowMetrics?.insets.top,
      }}>
      <View style={styles.container}>{children}</View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});

export default VerifaiSafeAreaView;
