import { currencies, userWallets, guildSettings, transactions, type Currency, type UserWallet, type GuildSettings, type Transaction, type InsertCurrency, type InsertUserWallet, type InsertGuildSettings, type InsertTransaction } from "@shared/schema";

export interface IStorage {
  // Currency operations
  getCurrencies(guildId: string): Promise<Currency[]>;
  createCurrency(currency: InsertCurrency): Promise<Currency>;
  deleteCurrency(guildId: string, name: string): Promise<boolean>;

  // User wallet operations
  getUserWallet(guildId: string, userId: string): Promise<UserWallet | undefined>;
  createUserWallet(wallet: InsertUserWallet): Promise<UserWallet>;
  updateUserWallet(id: number, wallet: Record<string, number>): Promise<UserWallet>;

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
}

export class MemStorage implements IStorage {
  private currencies: Map<number, Currency>;
  private wallets: Map<number, UserWallet>;
  private settings: Map<number, GuildSettings>;
  private transactions: Map<number, Transaction>;
  private currencyId: number;
  private walletId: number;
  private transactionId: number;
  private settingsId: number;

  constructor() {
    this.currencies = new Map();
    this.wallets = new Map();
    this.settings = new Map();
    this.transactions = new Map();
    this.currencyId = 1;
    this.walletId = 1;
    this.transactionId = 1;
    this.settingsId = 1;
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
    const newWallet = { ...wallet, id, wallet: {} };
    this.wallets.set(id, newWallet);
    return newWallet;
  }

  async updateUserWallet(id: number, wallet: Record<string, number>): Promise<UserWallet> {
    const userWallet = this.wallets.get(id);
    if (!userWallet) throw new Error("Wallet not found");

    const updated = { ...userWallet, wallet };
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
}

export const storage = new MemStorage();