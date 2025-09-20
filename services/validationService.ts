
import { DesignRequest } from '../types';

export class ValidationService {
  private static readonly MIN_NAME_LENGTH = 2;
  private static readonly MIN_DESCRIPTION_LENGTH = 10;
  private static readonly MAX_DESCRIPTION_LENGTH = 1000;
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly DISCORD_USERNAME_REGEX = /^[a-zA-Z0-9._]{2,32}#?[0-9]{0,4}$|^[a-zA-Z0-9._]{2,32}$/;

  // Common spam patterns
  private static readonly SPAM_PATTERNS = [
    /(.)\1{4,}/g, // Repeated characters (5+ times)
    /^[^a-zA-Z]*$/g, // Only numbers/symbols
    /test|sample|example|asdf|qwerty|123456/gi, // Common test strings
    /(.{1,3})\1{3,}/g, // Repeated short patterns
  ];

  private static readonly SPAM_WORDS = [
    'test', 'testing', 'sample', 'example', 'asdf', 'qwerty', 
    'lorem', 'ipsum', 'placeholder', 'dummy', 'fake', 'spam',
    'random', 'nothing', 'idk', 'whatever', 'anything', 'something'
  ];

  static validateRequest(request: Partial<DesignRequest>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate name
    if (!request.client_name || request.client_name.trim().length < this.MIN_NAME_LENGTH) {
      errors.push('Name must be at least 2 characters long');
    } else if (this.isSpamText(request.client_name)) {
      errors.push('Please enter a valid name');
    }

    // Validate email
    if (!request.email || !this.EMAIL_REGEX.test(request.email.trim())) {
      errors.push('Please enter a valid email address');
    }

    // Validate Discord username
    if (!request.discord_username || !this.DISCORD_USERNAME_REGEX.test(request.discord_username.trim())) {
      errors.push('Please enter a valid Discord username (e.g., username#1234 or username)');
    }

    // Validate service type
    if (!request.service_type || request.service_type.trim().length === 0) {
      errors.push('Please select a service type');
    }

    // Validate description
    if (!request.description || request.description.trim().length < this.MIN_DESCRIPTION_LENGTH) {
      errors.push(`Description must be at least ${this.MIN_DESCRIPTION_LENGTH} characters long`);
    } else if (request.description.trim().length > this.MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description must be less than ${this.MAX_DESCRIPTION_LENGTH} characters`);
    } else if (this.isSpamText(request.description)) {
      errors.push('Please provide a meaningful project description');
    }

    // Validate contact info
    if (!request.contact_info || request.contact_info.trim().length < 3) {
      errors.push('Please provide valid contact information');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private static isSpamText(text: string): boolean {
    const cleanText = text.toLowerCase().trim();

    // Check for spam patterns
    for (const pattern of this.SPAM_PATTERNS) {
      if (pattern.test(cleanText)) {
        console.log('Spam pattern detected:', pattern);
        return true;
      }
    }

    // Check for spam words
    const words = cleanText.split(/\s+/);
    const spamWordCount = words.filter(word => 
      this.SPAM_WORDS.includes(word) || word.length < 2
    ).length;

    // If more than 30% of words are spam words, consider it spam
    if (spamWordCount / words.length > 0.3) {
      console.log('High spam word ratio detected');
      return true;
    }

    // Check for excessive repetition
    const uniqueWords = new Set(words);
    if (words.length > 5 && uniqueWords.size / words.length < 0.5) {
      console.log('Excessive word repetition detected');
      return true;
    }

    return false;
  }

  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\s@#.,!?()-]/g, '') // Remove special characters except common ones
      .substring(0, 500); // Limit length
  }

  static isValidEmail(email: string): boolean {
    return this.EMAIL_REGEX.test(email.trim());
  }

  static isValidDiscordUsername(username: string): boolean {
    return this.DISCORD_USERNAME_REGEX.test(username.trim());
  }
}
