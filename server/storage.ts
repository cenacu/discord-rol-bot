import { characters, currencies, guildSettings, transactions, type Character, type Currency, type GuildSettings, type Transaction, type InsertCharacter, type InsertCurrency, type InsertGuildSettings, type InsertTransaction } from "@shared/schema";

export interface IStorage {
  // Currency operations
  getCurrencies(guildId: string): Promise<Currency[]>;
  createCurrency(currency: InsertCurrency): Promise<Currency>;
  deleteCurrency(guildId: string, name: string): Promise<boolean>;

  // Character operations
  getCharacter(guildId: string, userId: string): Promise<Character | undefined>;
  getCharacters(guildId: string): Promise<Character[]>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacterWallet(id: string, wallet: Record<string, number>): Promise<Character>;

  // Guild settings operations
  getGuildSettings(guildId: string): Promise<GuildSettings | undefined>;
  setTransactionLogChannel(guildId: string, channelId: string): Promise<GuildSettings>;

  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactions(guildId: string): Promise<Transaction[]>;
  transferCurrency(
    guildId: string,
    fromCharacterId: string,
    toCharacterId: string,
    currencyName: string,
    amount: number
  ): Promise<Transaction>;
}

export class MemStorage implements IStorage {
  private currencies: Map<string, Currency>;
  private characters: Map<string, Character>;
  private settings: Map<number, GuildSettings>;
  private transactions: Map<number, Transaction>;
  private currencyId: number;
  private characterId: number;
  private transactionId: number;
  private settingsId: number;

  constructor() {
    this.currencies = new Map();
    this.characters = new Map();
    this.settings = new Map();
    this.transactions = new Map();
    this.currencyId = 1;
    this.characterId = 1;
    this.transactionId = 1;
    this.settingsId = 1;
  }

  async getCurrencies(guildId: string): Promise<Currency[]> {
    return Array.from(this.currencies.values()).filter(c => c.guildId === guildId);
  }

  async createCurrency(currency: InsertCurrency): Promise<Currency> {
    const id = this.currencyId++.toString();
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
    const id = this.characterId++.toString();
    const newCharacter = { ...character, id, wallet: {} };
    this.characters.set(id, newCharacter);
    return newCharacter;
  }

  async updateCharacterWallet(id: string, wallet: Record<string, number>): Promise<Character> {
    const character = this.characters.get(id);
    if (!character) throw new Error("Character not found");

    const updated = { ...character, wallet };
    this.characters.set(id, updated);
    return updated;
  }

  async getGuildSettings(guildId: string): Promise<GuildSettings | undefined> {
    return Array.from(this.settings.values()).find(s => s.guildId === guildId);
  }

  async setTransactionLogChannel(guildId: string, channelId: string): Promise<GuildSettings> {
    const existing = await this.getGuildSettings(guildId);
    if (existing) {
      const updated = { ...existing, transactionLogChannel: channelId };
      this.settings.set(existing.id, updated);
      return updated;
    }

    const id = this.settingsId++;
    const newSettings: GuildSettings = {
      id,
      guildId,
      transactionLogChannel: channelId
    };
    this.settings.set(id, newSettings);
    return newSettings;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionId++;
    const newTransaction = {
      ...transaction,
      id,
      timestamp: new Date()
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async getTransactions(guildId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(t => t.guildId === guildId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async transferCurrency(
    guildId: string,
    fromCharacterId: string,
    toCharacterId: string,
    currencyName: string,
    amount: number
  ): Promise<Transaction> {
    const fromCharacter = this.characters.get(fromCharacterId);
    const toCharacter = this.characters.get(toCharacterId);

    if (!fromCharacter || !toCharacter) {
      throw new Error("Character not found");
    }

    const currentBalance = fromCharacter.wallet[currencyName] || 0;
    if (currentBalance < amount) {
      throw new Error("Insufficient funds");
    }

    // Update wallets
    const fromWallet = { ...fromCharacter.wallet };
    const toWallet = { ...toCharacter.wallet };

    fromWallet[currencyName] = (fromWallet[currencyName] || 0) - amount;
    toWallet[currencyName] = (toWallet[currencyName] || 0) + amount;

    await this.updateCharacterWallet(fromCharacterId, fromWallet);
    await this.updateCharacterWallet(toCharacterId, toWallet);

    // Create transaction record
    return this.createTransaction({
      guildId,
      fromCharacterId,
      toCharacterId,
      currencyName,
      amount
    });
  }
}

export const storage = new MemStorage();