import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { loginFn, logoutFn, signupFn } from "@/services/auth";

export const useSignUp = () =>
	useMutation({
		mutationFn: useServerFn(signupFn),
	});

export const useLogin = () =>
	useMutation({
		mutationFn: useServerFn(loginFn),
	});

export const useLogout = () =>
	useMutation({
		mutationFn: useServerFn(logoutFn),
	});
