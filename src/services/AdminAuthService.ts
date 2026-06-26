import { AdminRepository } from "../repositories/AdminRepository";

export const AdminAuthService = {

  async login(password: string) {

    const actualPassword =
      await AdminRepository.getPassword();

    return password === actualPassword;

  },

  async changePassword(
    current: string,
    next: string
  ) {

    const actualPassword =
      await AdminRepository.getPassword();

    if (current !== actualPassword)
      return false;

    await AdminRepository.updatePassword(next);

    return true;

  },

};