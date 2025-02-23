import { characters, currencies, type Character, type Currency, type InsertCharacter, type InsertCurrency } from "@shared/schema";

export interface IStorage {
  // Currency operations
  getCurrencies(guildId: string): Promise<Currency[]>;
  createCurrency(currency: InsertCurrency): Promise<Currency>;
  deleteCurrency(guildId: string, name: string): Promise<boolean>;
  
  // Character operations
  getCharacter(guildId: string, userId: string): Promise<Character | undefined>;
  getCharacters(guildId: string): Promise<Character[]>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacterWallet(id: number, wallet: Record<string, number>): Promise<Character>;
}

export class MemStorage implements IStorage {
  private currencies: Map<number, Currency>;
  private characters: Map<number, Character>;
  private currencyId: number;
  private characterId: number;

  constructor() {
    this.currencies = new Map();
    this.characters = new Map();
    this.currencyId = 1;
    this.characterId = 1;
  }

  async getCurrencies(guildId: string): Promise<Currency[]> {
    return Array.from(this.currencies.values()).filter(c => c.guildId === guildId);
  }

  async createCurrency(currency: InsertCurrency): Promise<Currency> {
    const id = this.currencyId++;
    const newCurrency = { ...currency, id };
    this.currencies.set(id, newCurrency);
    return newCurrency;
  }

  async deleteCurrency(guildId: string, name: string): Promise<boolean> {
    const currency = Array.from(this.currencies.values()).find(
      c => c.guildId === guildId && c.name === name
    );
    if (currency) {
      this.currencies.delete(currency.id);
      return true;
    }
    return false;
  }

  async getCharacter(guildId: string, userId: string): Promise<Character | undefined> {
    return Array.from(this.characters.values()).find(
      c => c.guildId === guildId && c.userId === userId
    );
  }

  async getCharacters(guildId: string): Promise<Character[]> {
    return Array.from(this.characters.values()).filter(c => c.guildId === guildId);
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const id = this.characterId++;
    const newCharacter = { ...character, id, wallet: {} };
    this.characters.set(id, newCharacter);
    return newCharacter;
  }

  async updateCharacterWallet(id: number, wallet: Record<string, number>): Promise<Character> {
    const character = this.characters.get(id);
    if (!character) throw new Error("Character not found");
    
    const updated = { ...character, wallet };
    this.characters.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
