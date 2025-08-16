export declare function generateTotpSecret(): string;
export declare function generateTOTP(secretBase32: string, time?: number, step?: number, digits?: number): string;
export declare function verifyTOTP(secretBase32: string, token: string, window?: number, step?: number, digits?: number): boolean;
