import { baseApi } from './baseApi';
import {
  RegistrationBody,
  CreateResponse,
  LoginBody,
} from '@francesco-lucania-pizza-models';

export interface LoginResponse {
  token: string;
  user: CreateResponse & {
    name?: string;
    phone?: string;
  };
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
    getProfile: builder.query<LoginResponse['user'], void>({
      query: () => '/user/profile',
      providesTags: ['User'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetProfileQuery,
} = userApi;
