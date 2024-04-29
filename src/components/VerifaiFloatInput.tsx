import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  KeyboardType,
  TextStyle,
  Platform,
  I18nManager,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

// STYLES & CONSTANTS
import { ThemeConfigs } from '../theme';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../utils/Responsiveness';

interface Props {
  labelName: string;
  value: string;
  inputName: string;
  inputKeyboardType?: KeyboardType;
  attachIcon?: boolean;
  iconName?: string;
  isSecure?: boolean;
  notEditable?: boolean;
  isValid?: boolean;
  isTouched?: boolean;
  inputItemMinHeight?: number;
  inputItemMaxHeight?: number;
  changeInputHandler: (key: string, text: string) => void;
  toggleIcon?: () => void;
  inputStyles?: TextStyle;
  isRequired?: boolean;
}

const VerifaiFloatInput: React.FC<Props> = ({
  labelName,
  value,
  inputName,
  inputKeyboardType,
  attachIcon,
  iconName,
  isSecure,
  notEditable,
  isValid,
  isTouched,
  inputItemMinHeight,
  inputItemMaxHeight,
  changeInputHandler,
  toggleIcon,
  inputStyles,
  isRequired,
}) => {
  const [topAnimation] = useState(new Animated.Value(hp('2.5%')));
  const [opacAnimation] = useState(new Animated.Value(1));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isFocused || value.trim() !== '') {
      animateFloatLabel(hp('-0.5%'));
    } else {
      animateFloatLabel(hp('2.5%'));
    }
  }, [isFocused, value]);

  const animateFloatLabel = (e: number) => {
    Animated.timing(topAnimation, {
      toValue: e,
      duration: 150,
      useNativeDriver: false,
    }).start();
    Animated.timing(opacAnimation, {
      toValue: 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  const updateInputFocus = () => {
    setIsFocused(!isFocused);
  };

  const isActive = isFocused || value.trim() !== '';

  const inputLabelStyles: TextStyle = {
    ...styles.inputLabel,
    paddingHorizontal: isActive ? hp('0.5%') : 0,
    fontSize: isActive ? hp('1.6%') : hp('2%'),
    textAlign: isActive ? 'center' : 'left',
    color: isTouched && !isValid ? ThemeConfigs.defaultColors.errorColor : ThemeConfigs.defaultBorder.primaryColor,
    backgroundColor: isActive ? ThemeConfigs.defaultBgColors.backgroundLight : ThemeConfigs.defaultColors.transparent,
  };

  const inputContainer: TextStyle = {
    ...styles.inputContainer,
    borderColor: isTouched && !isValid ? ThemeConfigs.defaultColors.errorColor : ThemeConfigs.defaultBorder.primaryColor,
  };

  const animatedView: TextStyle = {
    ...styles.animatedView,
    top: topAnimation,
    opacity: opacAnimation,
  };

  const inputItem: TextStyle = {
    ...styles.inputItem,
    minHeight: inputItemMinHeight ? inputItemMinHeight : hp('6%'),
    maxHeight: inputItemMaxHeight ? inputItemMaxHeight : hp('6%'),
  };

  const textInput: TextStyle = {
    ...styles.textInput,
    minWidth: attachIcon ? '90%' : '100%',
    ...inputStyles,
  };

  return (
    <View style={inputContainer}>
      <View style={inputItem}>
        <Animated.View style={animatedView}>
          <Text style={inputLabelStyles}>{`${labelName} ${isRequired ? '*' : ''}`}</Text>
        </Animated.View>
        <TextInput
          keyboardType={inputKeyboardType}
          value={value}
          onChangeText={(text: string) => {
            if (inputKeyboardType === 'number-pad') {
              changeInputHandler(inputName,text);
            } else {
              changeInputHandler(inputName, text);
            }
          }}
          onFocus={updateInputFocus}
          onBlur={updateInputFocus}
          secureTextEntry={isSecure}
          style={textInput}
          editable={!notEditable}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {attachIcon ? (
          <Icon
            name={iconName}
            style={styles.inputIcon}
            onPress={toggleIcon}
          />
        ) : undefined}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    borderColor: ThemeConfigs.defaultBorder.primaryColor,
    borderWidth: 1,
    borderRadius: ThemeConfigs.defaultInput.radius,
    backgroundColor: ThemeConfigs.defaultColors.whiteColor,
    marginBottom: hp('2.5%'),
  },
  animatedView: {
    position: 'absolute',
    paddingTop: undefined,
    paddingBottom: Platform.OS === 'ios' ? undefined : 6,
  },
  inputItem: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: hp('6%'),
    maxHeight: hp('6%'),
  },
  textInput: {
    minWidth: '100%',
    paddingHorizontal: wp('2%'),
    color: ThemeConfigs.defaultColors.blackColor,
    fontSize: hp('1.6%'),
    lineHeight: hp('2.5%'),
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  inputLabel: {
    marginHorizontal: wp('1.5%'),
    marginTop: hp('-0.8%'),
  },
  inputIcon: {
    minWidth: '10%',
    color: ThemeConfigs.defaultColors.greyColor,
    fontSize: hp('2.5%'),
    alignSelf: 'center',
    paddingHorizontal: wp('1.2%'),
    paddingVertical: hp('1.8%'),
  },
});

export default VerifaiFloatInput;
