import { baseApi } from './baseApi';
import {
  RegistrationBody,
  CreateResponse,
  LoginBody,
} from '@francesco-lucania-pizza-models';

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  email: string;
  fullName: string;
  lastActivity: string;
  phone: string;
  id: string;
  isActivated: boolean;
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<CreateResponse, RegistrationBody>({
      query: (body) => ({
        url: '/user/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    login: builder.mutation<LoginResponse, LoginBody>({
      query: (body) => ({
        url: '/user/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    getProfile: builder.query<
      {
        email: string;
        fullName: string;
        lastActivity: string;
        phone: string;
        id: string;
        isActivated: boolean;
        name?: string;
      },
      void
    >({
      query: () => '/user/profile',
      providesTags: ['User'],
    }),
    activate: builder.mutation<
      { activation: boolean; userInfo: { name: string; fullName: string; email: string } },
      string
    >({
      query: (activationId) => ({
        url: `/user/activate?id=${activationId}`,
        method: 'GET',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetProfileQuery,
  useActivateMutation,
} = userApi;
