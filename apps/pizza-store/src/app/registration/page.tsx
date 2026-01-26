'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRegisterMutation } from '../../store/api/userApi';
import { useAppDispatch } from '../../store/hooks';
import { setUser } from '../../store/slices/userSlice';
import type { RegistrationBody, Gender } from '@francesco-lucania-pizza-models';
import { PizzaReactInput, PizzaReactButton } from '@francesco-lucania-pizza/react-ui';
import { MaskitoOptions } from '@maskito/core';
import styles from './page.module.scss';

interface FieldErrors {
  email?: string;
  phone?: string;
  name?: string;
  fullName?: string;
  gender?: string;
  dateIssue?: string;
  password?: string;
}

function RegistrationForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [register, { isLoading }] = useRegisterMutation();

  const [formData, setFormData] = useState<RegistrationBody>({
    email: '',
    phone: '',
    name: '',
    fullName: '',
    gender: '' as Gender,
    dateIssue: '',
    password: '',
  });

  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  // Маска для российского телефона
  const phoneMaskOptions: MaskitoOptions = {
    mask: [
      '+',
      '7',
      ' ',
      '(',
      /\d/,
      /\d/,
      /\d/,
      ')',
      ' ',
      /\d/,
      /\d/,
      /\d/,
      '-',
      /\d/,
      /\d/,
      '-',
      /\d/,
      /\d/,
    ],
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'email':
        if (!value) return 'Это поле обязательно для заполнения';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return 'Введите корректный email адрес';
        return '';
      case 'phone':
        if (!value) return 'Это поле обязательно для заполнения';
        return '';
      case 'name':
        if (!value) return 'Это поле обязательно для заполнения';
        return '';
      case 'fullName':
        if (!value) return 'Это поле обязательно для заполнения';
        return '';
      case 'gender':
        if (!value) return 'Это поле обязательно для заполнения';
        return '';
      case 'dateIssue':
        if (!value) return 'Это поле обязательно для заполнения';
        return '';
      case 'password':
        if (!value) return 'Это поле обязательно для заполнения';
        if (value.length < 8) return 'Минимальная длина 8 символов';
        if (value.length > 16) return 'Максимальная длина 16 символов';
        return '';
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof RegistrationBody]);
      if (error) {
        newErrors[key as keyof FieldErrors] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const markFieldTouched = (fieldName: string) => {
    setTouchedFields((prev) => new Set(prev).add(fieldName));
    const error = validateField(fieldName, formData[fieldName as keyof RegistrationBody]);
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  const shouldShowError = (fieldName: string): boolean => {
    return (
      (submitted || touchedFields.has(fieldName)) && !!errors[fieldName as keyof FieldErrors]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (!validateForm()) {
      return;
    }

    try {
      const response = await register(formData).unwrap();

      // Сохраняем данные пользователя в store
      dispatch(
        setUser({
          id: response.id,
          email: response.email,
          isActivated: response.isActivated,
        })
      );

      // Перенаправляем на страницу входа
      router.push('/login');
    } catch (err: any) {
      console.error('Ошибка регистрации:', err);

      // Обработка ошибок от сервера
      if (err?.data?.error?.message) {
        const errorMessage = err.data.error.message;
        const newErrors: FieldErrors = {};

        // Маппинг ошибок сервера на поля формы
        if (errorMessage.includes('EMAIL')) {
          newErrors.email = 'Этот email уже используется';
        }
        if (errorMessage.includes('PHONE')) {
          newErrors.phone = 'Этот телефон уже используется';
        }

        setErrors(newErrors);
      }
    }
  };

  const handleChange = (field: keyof RegistrationBody) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Автоматически помечаем поле как touched при первом изменении
    if (!touchedFields.has(field)) {
      setTouchedFields((prev) => new Set(prev).add(field));
    }
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleGenderChange = (value: Gender) => {
    setFormData((prev) => ({ ...prev, gender: value }));
    markFieldTouched('gender');
  };

  const isFormValid = () => {
    return Object.values(errors).every((error) => !error) && Object.values(formData).every((value) => value !== '');
  };

  return (
    <div className={styles['registration-page']}>
      <div className={styles['registration-container']}>
        <h1 className={styles['registration-title']}>Регистрация</h1>

        <form onSubmit={handleSubmit} className={styles['registration-form']}>
          {/* Email */}
          <div className={styles['form-group']}>
            <label htmlFor="email" className={styles['form-label']}>
              Email
            </label>
            <div className={styles['input-wrapper']}>
              <PizzaReactInput
                type="email"
                value={formData.email}
                onInput={(value) => {
                  handleChange('email')(value);
                  if (!touchedFields.has('email')) {
                    markFieldTouched('email');
                  }
                }}
                name="email"
                id="email"
                placeholder="Введите email"
                size="large"
                invalid={shouldShowError('email')}
              />
            </div>
            {shouldShowError('email') && (
              <div className={styles['error-message']}>{errors.email}</div>
            )}
          </div>

          {/* Phone */}
          <div className={styles['form-group']}>
            <label htmlFor="phone" className={styles['form-label']}>
              Телефон
            </label>
            <div className={styles['input-wrapper']}>
              <PizzaReactInput
                type="phone"
                value={formData.phone}
                onInput={handleChange('phone')}
                name="phone"
                id="phone"
                placeholder="+7 (___) ___-__-__"
                size="large"
                phoneMask={phoneMaskOptions}
                invalid={shouldShowError('phone')}
                commitOnInput={true}
              />
            </div>
            {shouldShowError('phone') && (
              <div className={styles['error-message']}>{errors.phone}</div>
            )}
          </div>

          {/* Name */}
          <div className={styles['form-group']}>
            <label htmlFor="name" className={styles['form-label']}>
              Имя
            </label>
            <div className={styles['input-wrapper']}>
              <PizzaReactInput
                type="text"
                value={formData.name}
                onInput={handleChange('name')}
                name="name"
                id="name"
                placeholder="Введите имя"
                size="large"
                invalid={shouldShowError('name')}
              />
            </div>
            {shouldShowError('name') && (
              <div className={styles['error-message']}>{errors.name}</div>
            )}
          </div>

          {/* Full Name */}
          <div className={styles['form-group']}>
            <label htmlFor="fullName" className={styles['form-label']}>
              Полное имя
            </label>
            <div className={styles['input-wrapper']}>
              <PizzaReactInput
                type="text"
                value={formData.fullName}
                onInput={handleChange('fullName')}
                name="fullName"
                id="fullName"
                placeholder="Введите полное имя"
                size="large"
                invalid={shouldShowError('fullName')}
              />
            </div>
            {shouldShowError('fullName') && (
              <div className={styles['error-message']}>{errors.fullName}</div>
            )}
          </div>

          {/* Gender */}
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>Пол</label>
            <div className={styles['radio-group']}>
              <label className={styles['radio-label']}>
                <input
                  type="radio"
                  name="gender"
                  value="make"
                  checked={formData.gender === 'make'}
                  onChange={(e) => handleGenderChange(e.target.value as Gender)}
                  className={styles['radio-input']}
                />
                <span>Мужской</span>
              </label>
              <label className={styles['radio-label']}>
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={(e) => handleGenderChange(e.target.value as Gender)}
                  className={styles['radio-input']}
                />
                <span>Женский</span>
              </label>
            </div>
            {shouldShowError('gender') && (
              <div className={styles['error-message']}>{errors.gender}</div>
            )}
          </div>

          {/* Date Issue */}
          <div className={styles['form-group']}>
            <label htmlFor="dateIssue" className={styles['form-label']}>
              Дата выдачи
            </label>
            <div className={styles['input-wrapper']}>
              <PizzaReactInput
                type="date"
                value={formData.dateIssue}
                onInput={handleChange('dateIssue')}
                name="dateIssue"
                id="dateIssue"
                placeholder="Выберите дату"
                size="large"
                invalid={shouldShowError('dateIssue')}
              />
            </div>
            {shouldShowError('dateIssue') && (
              <div className={styles['error-message']}>{errors.dateIssue}</div>
            )}
          </div>

          {/* Password */}
          <div className={styles['form-group']}>
            <label htmlFor="password" className={styles['form-label']}>
              Пароль
            </label>
            <div className={styles['input-wrapper']}>
              <PizzaReactInput
                type="password"
                value={formData.password}
                onInput={handleChange('password')}
                name="password"
                id="password"
                placeholder="Введите пароль"
                size="large"
                minlength={8}
                maxlength={16}
                invalid={shouldShowError('password')}
              />
            </div>
            {shouldShowError('password') && (
              <div className={styles['error-message']}>{errors.password}</div>
            )}
            {(submitted || touchedFields.has('password')) && (
              <div className={styles['password-hint']}>
                Пароль должен содержать от 8 до 16 символов
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className={styles['form-actions']}>
            <PizzaReactButton
              buttonType="submit"
              label={isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
              theme="brand"
              fullWidth
              disabled={isLoading}
              showLoader={isLoading}
            />
          </div>

          <div className={styles['login-link']}>
            <span>Уже есть аккаунт? </span>
            <Link href="/login" className={styles['link']}>
              Войти
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RegistrationPage() {
  return <RegistrationForm />;
}
