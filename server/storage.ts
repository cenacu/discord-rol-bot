import { currencies, userWallets, guildSettings, transactions, characters, 
  type Currency, type UserWallet, type GuildSettings, type Transaction, type Character,
  type InsertCurrency, type InsertUserWallet, type InsertGuildSettings, type InsertTransaction, type InsertCharacter 
} from "@shared/schema";

export interface IStorage {
  // Currency operations
  getCurrencies(guildId: string): Promise<Currency[]>;
  createCurrency(currency: InsertCurrency): Promise<Currency>;
  deleteCurrency(guildId: string, name: string): Promise<boolean>;

  // User wallet operations
  getUserWallet(guildId: string, userId: string): Promise<UserWallet | undefined>;
  createUserWallet(wallet: InsertUserWallet): Promise<UserWallet>;
  updateUserWallet(id: number, wallet: Record<string, number>, lastWorked?: Date): Promise<UserWallet>;

  // Guild settings operations
  getGuildSettings(guildId: string): Promise<GuildSettings | undefined>;
  setTransactionLogChannel(guildId: string, channelId: string): Promise<GuildSettings>;

  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactions(guildId: string): Promise<Transaction[]>;
  transferCurrency(
    guildId: string,
    fromUserId: string,
    toUserId: string,
    currencyName: string,
    amount: number
  ): Promise<Transaction>;

  // Character operations
  createCharacter(character: InsertCharacter): Promise<Character>;
  getCharacter(guildId: string, userId: string): Promise<Character | undefined>;
  getCharacters(guildId: string): Promise<Character[]>;
  updateCharacter(id: number, character: Partial<InsertCharacter>): Promise<Character>;
  deleteCharacter(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private currencies: Map<number, Currency>;
  private wallets: Map<number, UserWallet>;
  private settings: Map<number, GuildSettings>;
  private transactions: Map<number, Transaction>;
  private characters: Map<number, Character>;
  private currencyId: number;
  private walletId: number;
  private transactionId: number;
  private settingsId: number;
  private characterId: number;

  constructor() {
    this.currencies = new Map();
    this.wallets = new Map();
    this.settings = new Map();
    this.transactions = new Map();
    this.characters = new Map();
    this.currencyId = 1;
    this.walletId = 1;
    this.transactionId = 1;
    this.settingsId = 1;
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

  async getUserWallet(guildId: string, userId: string): Promise<UserWallet | undefined> {
    return Array.from(this.wallets.values()).find(
      w => w.guildId === guildId && w.userId === userId
    );
  }

  async createUserWallet(wallet: InsertUserWallet): Promise<UserWallet> {
    const id = this.walletId++;
    const newWallet = { ...wallet, id, wallet: {}, lastWorked: null };
    this.wallets.set(id, newWallet);
    return newWallet;
  }

  async updateUserWallet(id: number, wallet: Record<string, number>, lastWorked?: Date): Promise<UserWallet> {
    const userWallet = this.wallets.get(id);
    if (!userWallet) throw new Error("Wallet not found");

    const updated = { 
      ...userWallet, 
      wallet,
      lastWorked: lastWorked || userWallet.lastWorked 
    };
    this.wallets.set(id, updated);
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
    fromUserId: string,
    toUserId: string,
    currencyName: string,
    amount: number
  ): Promise<Transaction> {
    const fromWallet = await this.getUserWallet(guildId, fromUserId);
    const toWallet = await this.getUserWallet(guildId, toUserId);

    if (!fromWallet) {
      throw new Error("Source wallet not found");
    }

    if (!toWallet) {
      throw new Error("Destination wallet not found");
    }

    const currentBalance = fromWallet.wallet[currencyName] || 0;
    if (currentBalance < amount) {
      throw new Error("Insufficient funds");
    }

    // Update wallets
    const fromUpdated = { ...fromWallet.wallet };
    const toUpdated = { ...toWallet.wallet };

    fromUpdated[currencyName] = (fromUpdated[currencyName] || 0) - amount;
    toUpdated[currencyName] = (toUpdated[currencyName] || 0) + amount;

    await this.updateUserWallet(fromWallet.id, fromUpdated);
    await this.updateUserWallet(toWallet.id, toUpdated);

    // Create transaction record
    return this.createTransaction({
      guildId,
      fromUserId,
      toUserId,
      currencyName,
      amount
    });
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const id = this.characterId++;
    const newCharacter = { 
      ...character, 
      id,
      createdAt: new Date(),
      imageUrl: character.imageUrl ?? null,
      rank: character.rank || 'Rango E' 
    };
    this.characters.set(id, newCharacter);
    return newCharacter;
  }

  async getCharacter(guildId: string, userId: string): Promise<Character | undefined> {
    return Array.from(this.characters.values()).find(
      c => c.guildId === guildId && c.userId === userId
    );
  }

  async getCharacters(guildId: string): Promise<Character[]> {
    return Array.from(this.characters.values())
      .filter(c => c.guildId === guildId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateCharacter(id: number, character: Partial<InsertCharacter>): Promise<Character> {
    const existing = this.characters.get(id);
    if (!existing) throw new Error("Character not found");

    const updated = { ...existing, ...character };
    this.characters.set(id, updated);
    return updated;
  }

  async deleteCharacter(id: number): Promise<boolean> {
    return this.characters.delete(id);
  }

  reset() {
    this.currencies.clear();
    this.wallets.clear();
    this.settings.clear();
    this.transactions.clear();
    this.characters.clear();
    this.currencyId = 1;
    this.walletId = 1;
    this.transactionId = 1;
    this.settingsId = 1;
    this.characterId = 1;
  }
}

export const storage = new MemStorage();