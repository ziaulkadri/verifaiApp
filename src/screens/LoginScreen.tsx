// import React, { useEffect } from 'react';
// import {
//   View,
//   StyleSheet,
//   Keyboard,
//   Image,
//   ScrollView,
//   TouchableWithoutFeedback,
//   KeyboardAvoidingView,
//   Platform,
//   Text,
// } from 'react-native';
// import { connect } from 'react-redux';
// import VerifaiFloatInput from '../components/VerifaiFloatInput';
// import VerifaiSafeAreaView from '../components/VerifaiSafeAreaView';

// // INTERFACES / MODELS
// // import { FleetableAppRootState } from '../../store/store';
// import { verifaiStrings } from '../constants/VerifaiStrings';
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from '../utils/Responsiveness';
// import VerifaiCard from '../components/VerifaiCard';
// import GlobalStyles from '../constants/GlobalStyles';
// import VerifaiButton from '../components/VerifaiButton';

// // ACTIONS & REDUCER ACTIONS
// // import {
// //   actionUpdateLoginInputSaga,
// //   actionLoginRequestSaga,
// //   actionResetLoginInputsReducer,
// // } from '../../store/common/sagas/actions/LoginScreenSagaActions';

// // COMPONENTS
// // import FleetableSafeAreaView from '../components/FleetableSafeAreaView';
// // import FleetableButton from '../components/FleetableButton';
// // import FleetableFloatInput from '../components/FleetableFloatInput';
// // import FleetableCard from '../components/FleetableCard';
// // import LanguageSwitch from '../components/LanguageSwitch';

// // import VersionNumber from 'react-native-version-number';
// // import { APP_FLAVOUR } from '../constants/ReleaseConstants';
// // import { buildNumber } from '../constants/VersionConstants';

// interface Props {
//   loginScreenData: any;
//   updateLoginInput: any;
//   loginRequest: any;
//   resetLoginState: any;
// }

// const LoginScreen: React.FC<Props> = ({
//   loginScreenData,
//   updateLoginInput,
//   loginRequest,
//   resetLoginState,
// }) => {
//   useEffect(() => {
//     return () => {
//       resetLoginState();
//     };
//   }, []);

//   const updateLoginInput: (payload: LoginInputSaga) =>{
//     dispatch(actionUpdateLoginInputSaga(payload))
//   }

//   const changeInputHandler = (name: string, value: string): void => {
//     if (name === 'email') {
//       updateLoginInput({
//         name: 'EMAIL',
//         value: value,
//       });
//     } else if (name === 'password') {
//       updateLoginInput({
//         name: 'PASSWORD',
//         value: value,
//         shouldMaskValue: loginScreenData.password.shouldMaskValue,
//       });
//     }
//   };

//   const togglePassword = (): void => {
//     updateLoginInput({
//       name: 'PASSWORD',
//       value: loginScreenData.password.value,
//       shouldMaskValue: !loginScreenData.password.shouldMaskValue,
//     });
//   };

//   const loginButtonStyles = {
//     ...styles.loginButton,
//     backgroundColor: loginScreenData.isFormValid
//       ? '#000000' // ThemeConfigs.defaultBgColors.backgroundDarkest
//       : '#CCCCCC', // ThemeConfigs.defaultColors.disableColor
//   };

//   const labelStyles = {
//     color: loginScreenData.isFormValid ? '#FFFFFF' : '#CCCCCC', // ThemeConfigs.defaultColors.whiteColor : ThemeConfigs.defaultColors.disableTextColor
//   };

//   return (
//     <KeyboardAvoidingView behavior={'padding'} keyboardVerticalOffset={0}>
//       <ScrollView
//         keyboardShouldPersistTaps="always"
//         showsVerticalScrollIndicator={false}
//       >
//         <VerifaiSafeAreaView>
//           <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//             <View>
//               <VerifaiCard cardStyles={GlobalStyles.fullScreenFormContainer}>
//                 <Text>Hey</Text>
//                 <Image
//                   style={styles.fleetableImage}
//                   source={require('../../assets/images/logo.png')}
//                 />
//                 <View style={styles.fullWidth}>
//                   <VerifaiFloatInput
//                     labelName={verifaiStrings.Email}
//                     inputKeyboardType="email-address"
//                     value={loginScreenData.email.value}
//                     inputName="email"
//                     attachIcon
//                     iconName="envelope"
//                     changeInputHandler={changeInputHandler}
//                     isValid={loginScreenData.email.isValid}
//                     isTouched={loginScreenData.email.isTouched}
//                   />
//                 </View>
//                 <View style={styles.fullWidth}>
//                   <VerifaiFloatInput
//                     labelName={verifaiStrings.Password}
//                     value={loginScreenData.password.value}
//                     inputName="password"
//                     attachIcon
//                     iconName={
//                       loginScreenData.password.shouldMaskValue
//                         ? 'eye-slash'
//                         : 'eye'
//                     }
//                     isSecure={loginScreenData.password.shouldMaskValue}
//                     changeInputHandler={changeInputHandler}
//                     toggleIcon={togglePassword}
//                     isValid={loginScreenData.password.isValid}
//                     isTouched={loginScreenData.password.isTouched}
//                   />
//                 </View>
//                 <View style={styles.fullWidth}>
//                   <VerifaiButton
//                     buttonStyle={loginButtonStyles}
//                     label={verifaiStrings.Login}
//                     labelStyle={labelStyles}
//                     onClick={
//                       loginScreenData.isFormValid
//                         ? loginRequest
//                         : () => {}
//                     }
//                   />
//                 </View>
//               </VerifaiCard>
//             </View>
//           </TouchableWithoutFeedback>
//         </VerifaiSafeAreaView>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   fleetableImage: {
//     width: wp('30%'),
//     height: wp('30%'),
//     marginBottom: hp('3%'),
//   },
//   fullWidth: { width: '100%' },
//   loginButton: {
//     marginTop: hp('2%'),
//   },
//   languageSwitch: {
//     top: 0,
//     right: 0,
//     position: 'absolute',
//     alignSelf: 'flex-end',
//     width: wp('22%'),
//     margin: hp('2%'),
//   },
//   buildNumberText: {
//     minWidth: '100%',
//     color: '#000000', // ThemeConfigs.defaultColors.primaryColor
//     fontSize: hp('1.6%'),
//     alignSelf: 'center',
//     marginTop: hp('2%'),
//     textAlign: 'center',
//   },
// });



// export default LoginScreen;
