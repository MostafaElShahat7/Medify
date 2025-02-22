const prisma = require('../config/prisma');
const { hashPassword } = require('../utils/auth.util');

class UserService {
  static async createUser(userData) {
    const hashedPassword = await hashPassword(userData.password);
    return prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword
      }
    });
  }

  static async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  static async findById(id) {
    return prisma.user.findUnique({
      where: { id }
    });
  }
}

module.exports = UserService;