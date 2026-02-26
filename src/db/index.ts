import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, 'lumichan.json');

// Initialize DB file if not exists
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ agents: [] }, null, 2));
}

class JsonDB {
  private path: string;

  constructor(path: string) {
    this.path = path;
  }

  private read() {
    return JSON.parse(fs.readFileSync(this.path, 'utf-8'));
  }

  private write(data: any) {
    fs.writeFileSync(this.path, JSON.stringify(data, null, 2));
  }

  getAgentsByWallet(walletAddress: string) {
    const data = this.read();
    return data.agents.filter((a: any) => a.wallet_address === walletAddress);
  }

  getAgentByToken(token: string) {
    const data = this.read();
    return data.agents.find((a: any) => a.telegram_token === token);
  }

  createAgent(agent: any) {
    const data = this.read();
    const newAgent = { ...agent, id: Date.now(), created_at: new Date().toISOString() };
    data.agents.push(newAgent);
    this.write(data);
    return { lastInsertRowid: newAgent.id };
  }
}

const db = new JsonDB(dbPath);
export default db;
