// Currency utilities for Mixxl platform

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

// List of supported currencies with flags
export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", flag: "🇸🇪" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", flag: "🇳🇴" },
  { code: "DKK", name: "Danish Krone", symbol: "kr", flag: "🇩🇰" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "🇧🇷" },
  { code: "MXN", name: "Mexican Peso", symbol: "$", flag: "🇲🇽" },
  { code: "KRW", name: "South Korean Won", symbol: "₩", flag: "🇰🇷" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", flag: "🇳🇿" },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽", flag: "🇷🇺" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", flag: "🇭🇰" },
];

// Default currency (UK-based)
export const DEFAULT_CURRENCY = "GBP";

// Get currency symbol by code
export const getCurrencySymbol = (currencyCode: string): string => {
  const currency = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);
  return currency?.symbol || "£";
};

// Get currency name by code
export const getCurrencyName = (currencyCode: string): string => {
  const currency = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);
  return currency?.name || "British Pound";
};

// Get currency flag by code
export const getCurrencyFlag = (currencyCode: string): string => {
  const currency = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);
  return currency?.flag || "🇬🇧";
};

// Format currency amount
export const formatCurrency = (
  amount: number,
  currencyCode: string = DEFAULT_CURRENCY
): string => {
  const symbol = getCurrencySymbol(currencyCode);

  // Handle special formatting for different currencies
  switch (currencyCode) {
    case "JPY":
    case "KRW":
      // No decimal places for Yen and Won
      return `${symbol}${Math.round(amount).toLocaleString()}`;
    case "USD":
    case "CAD":
    case "AUD":
    case "NZD":
    case "SGD":
    case "HKD":
    case "MXN":
      return `${symbol}${amount.toFixed(2)}`;
    case "EUR":
      return `${amount.toFixed(2)}${symbol}`;
    case "CHF":
      return `${symbol} ${amount.toFixed(2)}`;
    default:
      return `${symbol}${amount.toFixed(2)}`;
  }
};

// Convert currency amounts (simplified - in production you'd use live exchange rates)
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number => {
  // Simplified conversion rates (in production, use live exchange rates API)
  const exchangeRates: { [key: string]: number } = {
    GBP: 1.0, // Base currency
    USD: 1.27, // 1 GBP = 1.27 USD
    EUR: 1.17, // 1 GBP = 1.17 EUR
    CAD: 1.71, // 1 GBP = 1.71 CAD
    AUD: 1.89, // 1 GBP = 1.89 AUD
    JPY: 188.0, // 1 GBP = 188 JPY
    CHF: 1.13, // 1 GBP = 1.13 CHF
    SEK: 13.7, // 1 GBP = 13.7 SEK
    NOK: 13.8, // 1 GBP = 13.8 NOK
    DKK: 8.72, // 1 GBP = 8.72 DKK
    INR: 106.0, // 1 GBP = 106 INR
    BRL: 7.65, // 1 GBP = 7.65 BRL
    MXN: 25.8, // 1 GBP = 25.8 MXN
    KRW: 1685.0, // 1 GBP = 1685 KRW
    SGD: 1.71, // 1 GBP = 1.71 SGD
    NZD: 2.07, // 1 GBP = 2.07 NZD
    ZAR: 23.1, // 1 GBP = 23.1 ZAR
    RUB: 120.0, // 1 GBP = 120 RUB
    CNY: 9.15, // 1 GBP = 9.15 CNY
    HKD: 9.88, // 1 GBP = 9.88 HKD
  };

  if (fromCurrency === toCurrency) return amount;

  // Convert to GBP first, then to target currency
  const gbpAmount =
    fromCurrency === "GBP" ? amount : amount / exchangeRates[fromCurrency];
  return toCurrency === "GBP"
    ? gbpAmount
    : gbpAmount * exchangeRates[toCurrency];
};

// Get minimum tip amounts by currency (equivalent to £1 GBP)
export const getMinimumTipAmount = (currencyCode: string): number => {
  const minInGBP = 1.0;
  return convertCurrency(minInGBP, "GBP", currencyCode);
};

// Currency selector options for forms
export const CURRENCY_OPTIONS = SUPPORTED_CURRENCIES.map((currency) => ({
  value: currency.code,
  label: `${currency.flag} ${currency.code} - ${currency.name}`,
  symbol: currency.symbol,
}));

export const getCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount / 100);
