const firstPrimaryColor = '#50212F';
const secondPrimaryColor = '#80485B';
const accentColor = '#FFF0DF';
const greyColor = '#8a8a8a';
const errorColor = 'red';
const whiteColor = '#ffffff';
const blackColor = '#000000';
const transparent = 'transparent';
const redColor = 'red';
const greenColor = 'green';
const disableColor = 'rgba(0,0,0,0.12)';
const disableTextColor = 'rgba(0,0,0,0.26)';

const colors = {
  defaultPrimaryColor: firstPrimaryColor,
  primaryColor: secondPrimaryColor,
  accentColor: accentColor,
  greyColor: greyColor,
  errorColor: errorColor,
  whiteColor: whiteColor,
  blackColor: blackColor,
  transparent: transparent,
  redColor: redColor,
  greenColor: greenColor,
  disableColor: disableColor,
  disableTextColor: disableTextColor,
};

const defaultBorderRadius = 15;
const defaultInputRadius = 5;
const defaultButtonRadius = 5;
const defaultCardRadius = 15;
const defaultShadowOpacity = 0.3;
const defaultShadowRadius = 6;
const defaultShadowOffset = {
  height: 1,
  width: 0,
};
const defaultCardElevation = 10;

export const ThemeConfigs = {
  defaultColors: colors,
  defaultBgColors: {
    backgroundDarkest: colors.defaultPrimaryColor,
    backgroundDark: colors.primaryColor,
    backgroundLight: colors.accentColor,
    backgroundTransparent: colors.transparent,
  },
  defaultBorder: {
    defaultWidth: 1,
    radius: defaultBorderRadius,
    primaryColor: greyColor,
  },
  defaultInput: {
    radius: defaultInputRadius,
  },
  defaultButton: {
    radius: defaultButtonRadius,
  },
  defaultCard: {
    elevation: defaultCardElevation,
    shadowColor: colors.blackColor,
    radius: defaultCardRadius,
    shadowOpacity: defaultShadowOpacity,
    shadowRadius: defaultShadowRadius,
    shadowOffset: defaultShadowOffset,
  },
  defaultConst: {
    data: '#000',
  },
};
