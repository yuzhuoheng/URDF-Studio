// This file is generated by Umi automatically
// DO NOT CHANGE IT MANUALLY!
import {
  IntlCache,
  createIntl,
} from 'D:/ant-design-pro/ant-design-pro-master/ant-design-pro-master/node_modules/@umijs/plugins/node_modules/react-intl';
type OptionalIntlConfig = Omit<Parameters<typeof createIntl>[0], 'locale' | 'defaultLocale'>;
export interface IRuntimeConfig {
    locale?: {
      getLocale?: () => string;
      cache?: IntlCache;
    } & OptionalIntlConfig;
};
