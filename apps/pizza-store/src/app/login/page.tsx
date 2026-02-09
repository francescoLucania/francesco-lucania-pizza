'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLoginMutation } from '../../store/api/userApi';
import { useAppDispatch } from '../../store/hooks';
import { setUser, setToken } from '../../store/slices/userSlice';
import type { LoginBody, LoginType } from '@francesco-lucania-pizza-models';
import { PizzaReactInput, PizzaReactButton } from '@francesco-lucania-pizza/react-ui';
import { normalizePhone } from '@francesco-lucania-pizza/utils';
import styles from './page.module.scss';

function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [formData, setFormData] = useState<LoginBody>({
    login: '',
    password: '',
    loginType: 'email',
  });

  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      // Нормализуем телефон перед отправкой, если вход по телефону
      const normalizedFormData = {
        ...formData,
        login: formData.loginType === 'phone' ? normalizePhone(formData.login) : formData.login,
      };
      const response = await login(normalizedFormData).unwrap();

      // Сохраняем accessToken и данные пользователя одновременно
      if (response.accessToken) {
        dispatch(setToken(response.accessToken));
      }

      // Сохраняем данные пользователя (setUser также устанавливает isAuthenticated = true)
      dispatch(
        setUser({
          id: response.id,
          email: response.email,
          isActivated: response.isActivated,
          name: response.fullName,
          phone: response.phone,
        })
      );

      // Небольшая задержка перед редиректом, чтобы состояние успело обновиться
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Перенаправляем на главную страницу
      router.push('/');
    } catch (err: any) {
      console.error('Ошибка входа:', err);

      // Обработка ошибок
      if (err?.data?.message) {
        setErrorMessage(err.data.message);
      } else if (err?.error) {
        setErrorMessage('Ошибка входа. Проверьте введенные данные.');
      } else {
        setErrorMessage('Произошла ошибка. Попробуйте еще раз.');
      }
    }
  };

  const handleLoginChange = (value: string) => {
    // Автоматически определяем тип входа (email или phone)
    const isEmail = value.includes('@');
    setFormData((prev) => ({
      ...prev,
      login: value,
      loginType: (isEmail ? 'email' : 'phone') as LoginType,
    }));
  };

  const handlePasswordChange = (value: string) => {
    setFormData((prev) => ({ ...prev, password: value }));
  };

  return (
    <div className={styles['login-page']}>
      <div className={styles['login-container']}>
        <h1 className={styles['login-title']}>Вход</h1>

        <form onSubmit={handleSubmit} className={styles['login-form']}>
          <div className={styles['form-group']}>
            <label htmlFor="login" className={styles['form-label']}>
              Email или телефон
            </label>
            <PizzaReactInput
              type={formData.loginType === 'email' ? 'email' : 'phone'}
              value={formData.login}
              onInput={handleLoginChange}
              name="login"
              size={'large'}
              placeholder="Введите email или телефон"
              autoFocus
              required
            />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="password" className={styles['form-label']}>
              Пароль
            </label>
            <PizzaReactInput
              type="password"
              value={formData.password}
              onInput={handlePasswordChange}
              size={'large'}
              name="password"
              placeholder="Введите пароль"
              required
              minlength={8}
              maxlength={16}
            />
          </div>

          {errorMessage && (
            <div className={styles['error-message']}>
              {errorMessage}
            </div>
          )}

          <PizzaReactButton
            buttonType="submit"
            label={isLoading ? 'Вход...' : 'Войти'}
            theme="brand"
            fullWidth
            size={'large'}
            disabled={isLoading}
            showLoader={isLoading}
          />

          <div className={styles['register-link']}>
            <span>Нет аккаунта? </span>
            <Link href="/registration" className={styles['link']}>
              Зарегистрироваться
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginForm />;
}
