import React from 'react';
import { View, StyleSheet, TextStyle } from 'react-native';

// STYLES & CONSTANTS
import { ThemeConfigs } from '../theme';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../utils/Responsiveness';
import GlobalStyles from '../constants/GlobalStyles';

interface Props {
  noShadow?: boolean;
  cardStyles?: TextStyle;
  rootCardStyles?: any;
  children?: React.ReactElement;
}

const VerifaiCard: React.FC<Props> = ({
  noShadow,
  cardStyles,
  rootCardStyles,
  children,
}) => {
  let shadow: TextStyle = {
    ...GlobalStyles.shadow,
    ...styles.shadowContainer,
    ...rootCardStyles,
  };

  if (noShadow) {
    shadow = { ...styles.shadowContainer };
  }

  return (
    <View style={shadow}>
      <View style={{ ...styles.container, ...cardStyles }}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowContainer: {
    flex: 1,
    width: '100%',
  },
  container: {
    backgroundColor: ThemeConfigs.defaultBgColors.backgroundLight,
    padding: wp('5%'),
    borderRadius: ThemeConfigs.defaultBorder.radius,
    overflow: 'hidden',
    elevation: ThemeConfigs.defaultCard.elevation,
  },
});

export default VerifaiCard;
