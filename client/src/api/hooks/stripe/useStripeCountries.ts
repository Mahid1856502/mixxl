import { apiRequest } from "@/lib/queryClient";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

export type StripeCountry = {
  code: string;
  name: string;
  supportedPaymentMethods: string[];
  supportedPaymentCurrencies: string[];
  defaultCurrency: string;
  supportedTransferCountries: string[];
};

export type StripeCountriesResponse = {
  countries: StripeCountry[];
};

export type StripeCountryResponse = {
  country: StripeCountry;
};

/**
 * Fetch all countries or a single country by ID
 */
const fetchStripeCountries = async (
  id?: string
): Promise<StripeCountry[] | StripeCountry> => {
  const url = id ? `/api/stripe/countries?id=${id}` : "/api/stripe/countries";
  const res = await apiRequest("GET", url);
  if (!res.ok) throw new Error("Failed to fetch Stripe countries");

  const data = await res.json();
  return id
    ? (data.country as StripeCountry)
    : (data.countries as StripeCountry[]);
};

/**
 * Custom hook for TanStack Query
 * @param id Optional country ID to fetch a single country
 * @param options Optional query options
 */
export const useStripeCountries = <
  T extends StripeCountry[] | StripeCountry = StripeCountry[]
>(
  id?: string
) => {
  return useQuery<T>({
    queryKey: id ? ["stripeCountries", id] : ["stripeCountries"],
    queryFn: () => fetchStripeCountries(id) as Promise<T>,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
