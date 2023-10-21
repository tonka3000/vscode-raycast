import fetch from "node-fetch";

interface StoreListingExtension {
  id?: string;
  name?: string;
}

interface StoreListings {
  data?: StoreListingExtension[];
}

export async function fetchStoreListings(): Promise<StoreListings> {
  const response = await fetch("https://www.raycast.com/api/v1/store_listings?per_page=2000&include_native=false");
  const data = (await response.json()) as StoreListings;
  return data;
}
