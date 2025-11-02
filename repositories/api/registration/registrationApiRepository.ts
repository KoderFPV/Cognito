import { IUser } from '@/domain/user';

export interface IRegistrationRequest {
  email: string;
  password: string;
  termsAccepted: boolean;
}

export interface IRegistrationResponse {
  message: string;
  user: Omit<IUser, 'hash'>;
}

export const registerUser = async (
  data: IRegistrationRequest
): Promise<IRegistrationResponse> => {
  const response = await fetch('/api/registration', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Registration failed');
  }

  return responseData;
};
