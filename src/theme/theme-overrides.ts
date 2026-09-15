import type { GlobalThemeOverrides } from 'naive-ui'
import { darkPalette, fontFamily, palette, radius } from './tokens'

/**
 * Naive UI GlobalThemeOverrides — 统一圆角 / 主色 / 字型。
 * 只放「跨元件共用」的 token；单一元件的特殊样式留在各元件的 <style> 内。
 */
export const themeOverrides: GlobalThemeOverrides = {
  common: {
    fontFamily: fontFamily.base,
    fontFamilyMono: fontFamily.mono,
    borderRadius: radius.base,
    borderRadiusSmall: radius.small,
    fontSize: '15px',

    primaryColor: palette.primary,
    primaryColorHover: palette.primaryHover,
    primaryColorPressed: palette.primaryPressed,
    primaryColorSuppl: palette.primarySuppl,

    infoColor: palette.info,
    infoColorHover: palette.infoHover,
    infoColorPressed: palette.infoPressed,
    infoColorSuppl: palette.infoSuppl,

    successColor: palette.success,
    successColorHover: palette.successHover,
    successColorPressed: palette.successPressed,
    successColorSuppl: palette.successSuppl,

    warningColor: palette.warning,
    warningColorHover: palette.warningHover,
    warningColorPressed: palette.warningPressed,
    warningColorSuppl: palette.warningSuppl,

    errorColor: palette.error,
    errorColorHover: palette.errorHover,
    errorColorPressed: palette.errorPressed,
    errorColorSuppl: palette.errorSuppl,

    textColorBase: palette.textBase,
    textColor1: palette.text1,
    textColor2: palette.text2,
    textColor3: palette.text3,
    textColorDisabled: palette.textDisabled,

    bodyColor: palette.bodyBg,
    cardColor: palette.cardBg,
    borderColor: palette.border,
    dividerColor: palette.divider,
  },

  Card: {
    borderRadius: radius.base,
    color: palette.cardBg,
    colorModal: palette.cardBg,
    borderColor: palette.border,
  },

  Button: {
    borderRadiusMedium: radius.base,
    borderRadiusSmall: radius.small,
    fontWeight: '500',
    fontSizeMedium: '15px',
    fontSizeLarge: '16px',
  },

  Input: {
    borderRadius: radius.small,
    fontSizeMedium: '15px',
  },

  Select: {
    peers: {
      InternalSelection: { borderRadius: radius.small },
    },
  },

  Tag: {
    borderRadius: radius.small,
  },

  Steps: {
    // Stepper 的 done / current / locked 状态颜色由 ApplyStepper.vue 的 CSS 变数补齐
  },

  Alert: {
    borderRadius: radius.base,
  },

  Dialog: {
    borderRadius: radius.base,
  },

  Result: {
    // C10 成功页使用预设，字级/间距在 view 内客制
  },
}

/** 夜森林深色模式：与 App.vue 的深色语意 CSS 变数同步。 */
export const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    fontFamily: fontFamily.base,
    fontFamilyMono: fontFamily.mono,
    borderRadius: radius.base,
    borderRadiusSmall: radius.small,
    fontSize: '15px',

    primaryColor: darkPalette.primary,
    primaryColorHover: darkPalette.primaryHover,
    primaryColorPressed: darkPalette.primaryPressed,
    primaryColorSuppl: darkPalette.primarySuppl,

    infoColor: darkPalette.info,
    infoColorHover: darkPalette.infoHover,
    infoColorPressed: darkPalette.infoPressed,
    infoColorSuppl: darkPalette.infoSuppl,

    successColor: darkPalette.success,
    successColorHover: darkPalette.successHover,
    successColorPressed: darkPalette.successPressed,
    successColorSuppl: darkPalette.successSuppl,

    warningColor: darkPalette.warning,
    warningColorHover: darkPalette.warningHover,
    warningColorPressed: darkPalette.warningPressed,
    warningColorSuppl: darkPalette.warningSuppl,

    errorColor: darkPalette.error,
    errorColorHover: darkPalette.errorHover,
    errorColorPressed: darkPalette.errorPressed,
    errorColorSuppl: darkPalette.errorSuppl,

    textColorBase: darkPalette.textBase,
    textColor1: darkPalette.text1,
    textColor2: darkPalette.text2,
    textColor3: darkPalette.text3,
    textColorDisabled: darkPalette.textDisabled,

    bodyColor: darkPalette.bodyBg,
    cardColor: darkPalette.cardBg,
    borderColor: darkPalette.border,
    dividerColor: darkPalette.divider,
  },

  Card: {
    borderRadius: radius.base,
    color: darkPalette.cardBg,
    colorModal: darkPalette.cardBg,
    borderColor: darkPalette.border,
  },

  Button: {
    borderRadiusMedium: radius.base,
    borderRadiusSmall: radius.small,
    fontWeight: '500',
    fontSizeMedium: '15px',
    fontSizeLarge: '16px',
    textColorPrimary: '#18201A',
    textColorHoverPrimary: '#18201A',
    textColorPressedPrimary: '#18201A',
    textColorFocusPrimary: '#18201A',
  },

  Input: {
    borderRadius: radius.small,
    fontSizeMedium: '15px',
  },

  Select: {
    peers: {
      InternalSelection: { borderRadius: radius.small },
    },
  },

  Tag: { borderRadius: radius.small },
  Alert: { borderRadius: radius.base },
  Dialog: { borderRadius: radius.base },
}
