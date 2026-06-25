import { AdminRepository } from "../repositories/AdminRepository";

export const AdminAuthService = {
  async login(password: string) {
    const actualPassword =
      await AdminRepository.getPassword();

    return password === actualPassword;
  },
};