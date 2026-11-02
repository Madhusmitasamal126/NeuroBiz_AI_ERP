import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const UserAuthApi = createApi({
  reducerPath: "UserAuthApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "http://127.0.0.1:8000/api/",
  }),

  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (user) => ({
        url: "users/register/",
        method: "POST",
        body: user,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
  }),
});

export const { useRegisterUserMutation } = UserAuthApi;