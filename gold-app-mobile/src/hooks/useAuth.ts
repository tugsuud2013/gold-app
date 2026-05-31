import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { establishSession } from '../services/authSession';

export const useAuth = () => {
  const loginMutation = useMutation({
    mutationFn: ({ phone, password }: { phone: string; password: string }) =>
      authApi.login(phone, password),
    onSuccess: async (tokens) => {
      await establishSession(tokens);
    },
  });

  return { loginMutation };
};
