import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

export const useAuth = () => {
  const loginStore = useAuthStore((s) => s.login);

  const loginMutation = useMutation({
    mutationFn: ({ phone, password }: { phone: string; password: string }) =>
      authApi.login(phone, password),
    onSuccess: async (data) => {
      await loginStore(data.token, data.user);
    },
  });

  return { loginMutation };
};
