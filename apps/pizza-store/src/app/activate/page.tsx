'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useActivateMutation } from '../../store/api/userApi';
import { PizzaReactInput, PizzaReactButton } from '@francesco-lucania-pizza/react-ui';
import styles from './page.module.scss';

function ActivateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activate, { isLoading }] = useActivateMutation();

  const [activationCode, setActivationCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleActivate = useCallback(async (code: string) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await activate(code.trim()).unwrap();
      
      if (response.activation) {
        setSuccessMessage('Активация успешна! Ваш аккаунт активирован.');
        // Перенаправляем на страницу входа через 2 секунды
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Ошибка активации:', err);
      
      if (err?.data?.error) {
        setErrorMessage('Неверный код активации. Проверьте код и попробуйте еще раз.');
      } else if (err?.status === 'FETCH_ERROR') {
        setErrorMessage('Ошибка соединения. Проверьте подключение к интернету.');
      } else {
        setErrorMessage('Произошла ошибка при активации. Попробуйте еще раз.');
      }
    }
  }, [activate, router]);

  // Проверяем, есть ли код активации в URL
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setActivationCode(idFromUrl);
      // Автоматически активируем, если код есть в URL
      handleActivate(idFromUrl);
    }
  }, [searchParams, handleActivate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activationCode || activationCode.trim() === '') {
      setErrorMessage('Введите код активации');
      return;
    }

    await handleActivate(activationCode);
  };

  const handleCodeChange = (value: string) => {
    setActivationCode(value);
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className={styles['activate-page']}>
      <div className={styles['activate-container']}>
        <h1 className={styles['activate-title']}>Активация аккаунта</h1>

        {successMessage && (
          <div className={styles['success-message']}>
            {successMessage}
          </div>
        )}

        {errorMessage && !isLoading && (
          <div className={styles['error-message']}>
            {errorMessage}
          </div>
        )}

        {!successMessage && (
          <>
            <p className={styles['activate-description']}>
              Введите код активации, который был отправлен на ваш email, или перейдите по ссылке из письма.
            </p>

            <form onSubmit={handleSubmit} className={styles['activate-form']}>
              <div className={styles['form-group']}>
                <label htmlFor="activationCode" className={styles['form-label']}>
                  Код активации
                </label>
                <div className={styles['input-wrapper']}>
                  <PizzaReactInput
                    type="text"
                    value={activationCode}
                    onInput={handleCodeChange}
                    name="activationCode"
                    id="activationCode"
                    placeholder="Введите код активации"
                    size="large"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>

              <PizzaReactButton
                buttonType="submit"
                label={isLoading ? 'Активация...' : 'Активировать'}
                theme="brand"
                fullWidth
                disabled={isLoading || !activationCode.trim()}
                showLoader={isLoading}
              />

              <div className={styles['links']}>
                <Link href="/login" className={styles['link']}>
                  Вернуться к входу
                </Link>
                <span className={styles['separator']}>|</span>
                <Link href="/registration" className={styles['link']}>
                  Зарегистрироваться
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={<div className={styles['activate-page']}>Загрузка...</div>}>
      <ActivateForm />
    </Suspense>
  );
}
