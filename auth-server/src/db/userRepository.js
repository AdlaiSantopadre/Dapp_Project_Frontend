// db/userRepository.js
import { getUsersCollection } from './mongo.js';

export const db = {
  async verifyCredentials(username, password) {
    const users = await getUsersCollection();
    const user = await users.findOne({ username });
    if (!user || user.password !== password) return null;
    return {
      username: user.username,
      role: user.role,
      address: user.address,
    };
  },

  async createUser({ username, password, role, address }) {
    const users = await getUsersCollection();
    const exists = await users.findOne({ username });
    if (exists) throw new Error('Utente già esistente');
    const user = { username, password, role, address };
    await users.insertOne(user);
    return { username, role, address };
  },

  async listUsers() {
    const users = await getUsersCollection();
    return await users.find({}).project({ password: 0 }).toArray();
  }
};
