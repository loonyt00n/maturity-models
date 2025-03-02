import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  },
  colors: {
    brand: {
      50: '#E6F6FF',
      100: '#CCE9FF',
      200: '#99D1FF',
      300: '#66BAFF',
      400: '#33A3FF',
      500: '#008CFF',
      600: '#0070CC',
      700: '#005499',
      800: '#003866',
      900: '#001C33',
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    Link: {
      baseStyle: {
        fontWeight: 'medium',
      },
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

export default theme;

