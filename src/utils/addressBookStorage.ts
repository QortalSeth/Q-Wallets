import { Coin } from 'qapp-core';
import { AddressBookEntry } from './Types';
import { ADDRESSBOOK_NAME_LENGTH, ADDRESSBOOK_NOTE_LENGTH } from '../common/constants';
import { debouncedPublishToQDN } from './addressBookQDN';

const STORAGE_KEY_PREFIX = 'q-wallets-addressbook';

/**
 * Interface for localStorage structure with metadata
 */
interface AddressBookLocalStorage {
  entries: AddressBookEntry[];
  lastUpdated: number;
}

/**
 * Get the localStorage key for a specific coin type
 */
const getStorageKey = (coinType: Coin): string => {
  return `${STORAGE_KEY_PREFIX}-${coinType}`;
};

const hasNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const compareByName = (a: AddressBookEntry, b: AddressBookEntry) =>
  a.name.toLowerCase().localeCompare(b.name.toLowerCase()) ||
  a.address.localeCompare(b.address);

const compareByManualOrder = (a: AddressBookEntry, b: AddressBookEntry) => {
  const aHasOrder = hasNumber(a.sortOrder);
  const bHasOrder = hasNumber(b.sortOrder);

  if (aHasOrder || bHasOrder) {
    const aOrder = aHasOrder
      ? a.sortOrder ?? Number.MAX_SAFE_INTEGER
      : Number.MAX_SAFE_INTEGER;
    const bOrder = bHasOrder
      ? b.sortOrder ?? Number.MAX_SAFE_INTEGER
      : Number.MAX_SAFE_INTEGER;
    return (
      aOrder - bOrder || compareByName(a, b)
    );
  }

  return compareByName(a, b);
};

export const sortAddressBookEntries = (
  entries: AddressBookEntry[]
): AddressBookEntry[] =>
  [...entries].sort((a, b) => {
    const favoriteDelta = Number(Boolean(b.favorite)) - Number(Boolean(a.favorite));
    if (favoriteDelta !== 0) return favoriteDelta;

    if (a.favorite && b.favorite) {
      const favoriteOrder =
        (b.favoriteAt ?? 0) - (a.favoriteAt ?? 0) || compareByManualOrder(a, b);
      return favoriteOrder;
    }

    return compareByManualOrder(a, b);
  });

const saveAddressBookEntries = (
  coinType: Coin,
  entries: AddressBookEntry[],
  shouldPublish = true
) => {
  const key = getStorageKey(coinType);
  const storageData: AddressBookLocalStorage = {
    entries,
    lastUpdated: Date.now(),
  };

  localStorage.setItem(key, JSON.stringify(storageData));

  if (shouldPublish) {
    debouncedPublishToQDN(coinType, entries);
  }
};

/**
 * Retrieve all addresses for a specific coin type
 * Returns addresses sorted by favorite state, manual order, then name
 * Handles both old format (array) and new format (object with metadata)
 */
export const getAddressBook = (coinType: Coin): AddressBookEntry[] => {
  try {
    const key = getStorageKey(coinType);
    const data = localStorage.getItem(key);

    if (!data) {
      return [];
    }

    const parsed = JSON.parse(data);
    let entries: AddressBookEntry[];

    // Handle both old format (array) and new format (object with metadata)
    if (Array.isArray(parsed)) {
      // Old format - migrate to new format.
      // Use lastUpdated:0 so QDN (any valid timestamp > 0) is always considered
      // newer and used to refresh local on the next startup sync.
      entries = parsed;
      const storageData: AddressBookLocalStorage = {
        entries,
        lastUpdated: 0,
      };
      localStorage.setItem(key, JSON.stringify(storageData));
    } else {
      // New format with metadata
      entries = parsed.entries || [];
    }

    return sortAddressBookEntries(entries);
  } catch (error) {
    console.error(`Address Book: Error loading addresses for ${coinType}`, error);
    return [];
  }
};

/**
 * Add a new address to the address book
 * Stores with metadata and triggers QDN sync
 */
export const addAddress = (
  entry: Omit<AddressBookEntry, 'id' | 'createdAt'>
): AddressBookEntry => {
  try {
    // Validate name length
    if (entry.name.length > ADDRESSBOOK_NAME_LENGTH) {
      throw new Error(`Name must be ${ADDRESSBOOK_NAME_LENGTH} characters or less`);
    }

    // Validate note length
    if (entry.note.length > ADDRESSBOOK_NOTE_LENGTH) {
      throw new Error(`Note must be ${ADDRESSBOOK_NOTE_LENGTH} characters or less`);
    }

    // Get existing addresses
    const existingAddresses = getAddressBook(entry.coinType);

    // Check for duplicate address
    const duplicateAddress = existingAddresses.find(
      existing => existing.address === entry.address
    );

    if (duplicateAddress) {
      throw new Error('Address already exists in the address book');
    }

    // Create new entry with ID and timestamp
    const newEntry: AddressBookEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: Date.now(),
    };

    // Add new entry
    const updatedAddresses = sortAddressBookEntries([...existingAddresses, newEntry]);
    saveAddressBookEntries(entry.coinType, updatedAddresses);

    console.log(`Address Book: Added ${entry.name} for ${entry.coinType}`);

    return newEntry;
  } catch (error) {
    console.error('Address Book: Error adding address', error);
    throw error;
  }
};

/**
 * Update an existing address in the address book
 * Returns the updated entry or null if not found
 * Stores with metadata and triggers QDN sync
 */
export const updateAddress = (
  id: string,
  coinType: Coin,
  updates: Partial<Omit<AddressBookEntry, 'id' | 'createdAt' | 'coinType'>>
): AddressBookEntry | null => {
  try {
    // Validate name length if provided
    if (updates.name && updates.name.length > ADDRESSBOOK_NAME_LENGTH) {
      throw new Error(`Name must be ${ADDRESSBOOK_NAME_LENGTH} characters or less`);
    }

    // Validate note length if provided
    if (updates.note && updates.note.length > ADDRESSBOOK_NOTE_LENGTH) {
      throw new Error(`Note must be ${ADDRESSBOOK_NOTE_LENGTH} characters or less`);
    }

    // Get existing addresses
    const addresses = getAddressBook(coinType);

    // Find the entry to update
    const index = addresses.findIndex(entry => entry.id === id);

    if (index === -1) {
      console.warn(`Address Book: Entry with ID ${id} not found for ${coinType}`);
      return null;
    }

    // Update the entry
    const updatedEntry: AddressBookEntry = {
      ...addresses[index],
      ...updates,
      updatedAt: Date.now(),
    };

    addresses[index] = updatedEntry;

    const updatedAddresses = sortAddressBookEntries(addresses);
    saveAddressBookEntries(coinType, updatedAddresses);

    console.log(`Address Book: Updated ${updatedEntry.name} for ${coinType}`);

    return updatedEntry;
  } catch (error) {
    console.error('Address Book: Error updating address', error);
    throw error;
  }
};

/**
 * Delete an address from the address book
 * Returns true if deleted, false if not found
 * Stores with metadata and triggers QDN sync
 */
export const deleteAddress = (id: string, coinType: Coin): boolean => {
  try {
    // Get existing addresses
    const addresses = getAddressBook(coinType);

    // Find the entry to delete
    const index = addresses.findIndex(entry => entry.id === id);

    if (index === -1) {
      console.warn(`Address Book: Entry with ID ${id} not found for ${coinType}`);
      return false;
    }

    // Remove the entry
    addresses.splice(index, 1);

    saveAddressBookEntries(coinType, addresses);

    console.log(`Address Book: Deleted entry for ${coinType}`);

    return true;
  } catch (error) {
    console.error('Address Book: Error deleting address', error);
    throw error;
  }
};

/**
 * Search/filter addresses by name, address or note
 * Returns filtered and sorted results
 */
export const searchAddresses = (
  coinType: Coin,
  query: string
): AddressBookEntry[] => {
  try {
    const addresses = getAddressBook(coinType);

    if (!query.trim()) {
      return addresses;
    }

    const lowerQuery = query.toLowerCase();

    // Filter by name, address or note (case-insensitive, partial match)
    const filtered = addresses.filter(entry =>
      entry.name.toLowerCase().includes(lowerQuery) ||
      entry.address.toLowerCase().includes(lowerQuery) ||
      entry.note.toLowerCase().includes(lowerQuery)
    );

    return filtered;
  } catch (error) {
    console.error('Address Book: Error searching addresses', error);
    return [];
  }
};

export const toggleAddressBookFavorite = (
  id: string,
  coinType: Coin
): AddressBookEntry[] | null => {
  try {
    const addresses = getAddressBook(coinType);
    const index = addresses.findIndex((entry) => entry.id === id);

    if (index === -1) {
      console.warn(`Address Book: Entry with ID ${id} not found for ${coinType}`);
      return null;
    }

    const entry = addresses[index];
    addresses[index] = {
      ...entry,
      favorite: !entry.favorite,
      favoriteAt: entry.favorite ? undefined : Date.now(),
      updatedAt: Date.now(),
    };

    const updatedAddresses = sortAddressBookEntries(addresses);
    saveAddressBookEntries(coinType, updatedAddresses);
    return updatedAddresses;
  } catch (error) {
    console.error('Address Book: Error toggling favorite', error);
    throw error;
  }
};

export const moveAddressBookEntry = (
  coinType: Coin,
  sourceId: string,
  targetId: string
): AddressBookEntry[] | null => {
  try {
    if (sourceId === targetId) return getAddressBook(coinType);

    const addresses = getAddressBook(coinType);
    const sourceIndex = addresses.findIndex((entry) => entry.id === sourceId);
    const targetIndex = addresses.findIndex((entry) => entry.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) {
      console.warn(`Address Book: Unable to reorder entries for ${coinType}`);
      return null;
    }

    const reordered = [...addresses];
    const [movedEntry] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, movedEntry);

    const favoriteTimestampBase = Date.now() + reordered.length;
    const updatedAddresses = reordered.map((entry, index) => ({
      ...entry,
      favoriteAt: entry.favorite ? favoriteTimestampBase - index : undefined,
      sortOrder: index,
      updatedAt: Date.now(),
    }));

    saveAddressBookEntries(coinType, updatedAddresses);
    return sortAddressBookEntries(updatedAddresses);
  } catch (error) {
    console.error('Address Book: Error reordering entries', error);
    throw error;
  }
};
