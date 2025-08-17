// db/userRepository.js
import { getUsersCollection } from './mongo.js';
import bcrypt from 'bcryptjs';

export const db = {
  async verifyCredentials(username, password) {
    const users = await getUsersCollection();
    const user = await users.findOne({ username });
    if (!user ) return null;

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;
    return {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      address: user.address,
    };
  },

  async createUser({ username, password, role, address }) {    
    const users = await getUsersCollection();

    const exists = await users.findOne({ username });
    if (exists) throw new Error('Utente già esistente');

    const passwordHash = await bcrypt.hash(password, 10);
    const userToInsert = { username, passwordHash, role, address,createdAt:new Date() }
    ;
    const { insertedId } = await users.insertOne(userToInsert);
    return {
      id: insertedId.toString(),
      username,
      role,
      address,
    };
  },
  async listUsers() {
    const users = await getUsersCollection();
    return await users.find({}).project({ password: 0,passwordHash: 0 }).toArray();
  }
};
