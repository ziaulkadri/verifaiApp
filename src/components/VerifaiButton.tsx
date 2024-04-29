import React, {Component, ReactNode} from 'react';
import {TouchableOpacity, Text, StyleSheet, View} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import FoundationIcon from 'react-native-vector-icons/Foundation';

// STYLES & CONSTANTS
import {ThemeConfigs} from '../theme';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../utils/Responsiveness';

// OTHERS
interface Props {
  label?: string;
  labelStyle?: any;
  buttonStyle?: any;
  activeOpacity?: number;
  attachOnlyIcon?: boolean;
  iconName?: string;
  iconStyles?: any;
  labelIconContainer?: any;
  onClick(): void;
  isDisabled?: boolean;
  permissions?: string[];
  iconCmp?: ReactNode;
}
class VerifaiButton extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

//   hasNoAccess = (): boolean => {
//     if (this.props.permissions?.length) {
//       return !hasAccessInCurrentLocation(this.props.permissions);
//     } else {
//       return false;
//     }
//   };

 
  hasNoAccess = (): boolean => {
    return false
  };


  render() {
    return (
      <View>
        <TouchableOpacity
          activeOpacity={
            this.props.activeOpacity ? this.props.activeOpacity : 0.8
          }
          style={
            this.props.isDisabled
              ? {
                  ...styles.buttonStyle,
                  ...this.props.buttonStyle,
                  ...styles.disableBtnStyle,
                }
              : {...styles.buttonStyle, ...this.props.buttonStyle}
          }
          onPress={
            this.props.isDisabled || this.hasNoAccess()
              ? () => {}
              : this.props.onClick
          }>
          {this.props.attachOnlyIcon ? (
            this.props.iconName ? (
              <Icon
                name={this.props.iconName}
                style={
                  this.props.isDisabled
                    ? {
                        ...styles.iconStyle,
                        ...this.props.iconStyles,
                        ...styles.disableBtnLabelAndIcon,
                      }
                    : {...styles.iconStyle, ...this.props.iconStyles}
                }
              />
            ) : this.props.iconCmp ? (
              this.props.iconCmp
            ) : undefined
          ) : this.props.label &&
            (this.props.iconName || this.props.iconCmp) ? (
            <View
              style={{
                ...styles.labelIconContainer,
                ...this.props.labelIconContainer,
              }}>
              <Text
                style={
                  this.props.isDisabled
                    ? {
                        ...styles.labelStyle,
                        ...this.props.labelStyle,
                        ...styles.disableBtnLabelAndIcon,
                      }
                    : {...styles.labelStyle, ...this.props.labelStyle}
                }>
                {this.props.label}
              </Text>
              {this.props.iconCmp ? (
                this.props.iconCmp
              ) : (
                <Icon
                  name={this.props.iconName}
                  style={
                    this.props.isDisabled
                      ? {
                          ...styles.labelIconStyle,
                          ...this.props.iconStyles,
                          ...styles.disableBtnLabelAndIcon,
                        }
                      : {...styles.labelIconStyle, ...this.props.iconStyles}
                  }
                />
              )}
            </View>
          ) : this.props.label ? (
            <Text
              style={
                this.props.isDisabled
                  ? {
                      ...styles.labelStyle,
                      ...this.props.labelStyle,
                      ...styles.disableBtnLabelAndIcon,
                    }
                  : {...styles.labelStyle, ...this.props.labelStyle}
              }>
              {this.props.label}
            </Text>
          ) : undefined}
        </TouchableOpacity>
        {this.hasNoAccess() ? (
          <View
            style={{
              ...styles.buttonStyle,
              ...this.props.buttonStyle,
              ...styles.disableBtnStyle,
              ...{
                position: 'absolute',
                backgroundColor: 'rgba(255, 240, 223, 0.4)',
              },
            }}>
            <FoundationIcon
              name={'shield'}
              style={{
                color: ThemeConfigs.defaultColors.defaultPrimaryColor,
                fontSize: hp('5%'),
              }}
            />
          </View>
        ) : undefined}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  buttonStyle: {
    backgroundColor: ThemeConfigs.defaultBgColors.backgroundDarkest,
    width: '100%',
    height: hp('5%'),
    borderRadius: ThemeConfigs.defaultButton.radius,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelStyle: {
    color: ThemeConfigs.defaultColors.whiteColor,
    fontSize: hp('2.3%'),
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  iconStyle: {
    color: ThemeConfigs.defaultColors.whiteColor,
    textAlign: 'center',
    fontSize: hp('2.3%'),
  },
  labelIconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  labelIconStyle: {
    fontSize: hp('2.3%'),
  },
  disableBtnStyle: {
    backgroundColor: ThemeConfigs.defaultColors.disableColor,
  },
  disableBtnLabelAndIcon: {
    color: ThemeConfigs.defaultColors.disableTextColor,
  },
});

export default VerifaiButton;
