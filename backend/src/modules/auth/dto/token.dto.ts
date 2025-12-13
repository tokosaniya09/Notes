export class TokenDto {
  accessToken: string;
  expiresIn: number; // in seconds
  tokenType: string;
  user: {
    id: string;
    email: string;
    tier: string;
  };
}
