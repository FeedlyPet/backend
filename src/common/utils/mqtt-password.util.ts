import * as crypto from 'crypto';

export class MqttPasswordUtil {
  static generatePassword(length: number = 32): string {
    return crypto.randomBytes(length).toString('base64').slice(0, length);
  }

  static hashPassword(password: string, salt: string = ''): string {
    const hash = crypto.createHash('sha256');
    hash.update(password + salt);
    return hash.digest('hex');
  }

  static generateAndHash(): { plainPassword: string; hashedPassword: string } {
    const plainPassword = this.generatePassword();
    const hashedPassword = this.hashPassword(plainPassword);
    return { plainPassword, hashedPassword };
  }
}
