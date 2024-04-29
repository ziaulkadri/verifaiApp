import {StyleSheet, Platform} from 'react-native';
import {ThemeConfigs} from '../theme';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../utils/Responsiveness';

const platform: string = Platform.OS;

export default StyleSheet.create({
  fullScreenFormContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'center',
    width: wp('95%'),
    paddingVertical: hp('23%'),
    height: platform === 'ios' ? hp('89%') : hp('97%'),
    marginVertical: hp('1.5%'),
  },
  fullScreen: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    alignSelf: 'center',
    width: wp('95%'),
    marginVertical: hp('1.5%'),
    padding: wp('1.5%'),
  },
  roundedBtn: {
    height: wp('18%'),
    width: wp('18%'),
    borderRadius: wp('50%'),
  },
  shadow: {
    shadowOffset: ThemeConfigs.defaultCard.shadowOffset,
    shadowColor: ThemeConfigs.defaultCard.shadowColor,
    shadowOpacity: ThemeConfigs.defaultCard.shadowOpacity,
  },
  fullWidth: {
    width: '100%',
  },
});
