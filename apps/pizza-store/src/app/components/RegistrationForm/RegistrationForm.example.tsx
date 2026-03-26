'use client';

import { useState } from 'react';
import { useRegisterMutation } from '../../../store/api/userApi';
import { useAppDispatch } from '../../../store/hooks';
import { setUser } from '../../../store/slices/userSlice';
import type { RegistrationBody } from '@francesco-lucania-pizza-models';

/**
 * Пример компонента регистрации
 * Используйте этот компонент как основу для вашей формы регистрации
 */
export function RegistrationFormExample() {
  const [formData, setFormData] = useState<RegistrationBody>({
    email: '',
    phone: '',
    name: '',
    fullName: '',
    gender: 'make',
    dateIssue: '',
    password: '',
  });

  const [register, { isLoading, error }] = useRegisterMutation();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await register(formData).unwrap();

      dispatch(
        setUser({
          id: response.id,
          email: response.email,
          isActivated: response.isActivated,
        })
      );

      console.log('Регистрация успешна:', response);
    } catch (err) {
      console.error('Ошибка регистрации:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>
      </div>

      <div>
        <label>
          Телефон:
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </label>
      </div>

      <div>
        <label>
          Имя:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>
      </div>

      <div>
        <label>
          Полное имя:
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </label>
      </div>

      <div>
        <label>
          Пол:
          <select
            name="gender"
            value={formData.gender}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, gender: e.target.value }))
            }
            required
          >
            <option value="make">Мужской</option>
            <option value="female">Женский</option>
          </select>
        </label>
      </div>

      <div>
        <label>
          Дата выдачи:
          <input
            type="date"
            name="dateIssue"
            value={formData.dateIssue}
            onChange={handleChange}
            required
          />
        </label>
      </div>

      <div>
        <label>
          Пароль:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            maxLength={16}
          />
        </label>
      </div>

      {error && (
        <div style={{ color: 'red' }}>
          Ошибка регистрации. Проверьте введенные данные.
        </div>
      )}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
      </button>
    </form>
  );
}
