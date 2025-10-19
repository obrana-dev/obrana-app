import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
	fetchUserFn,
	loginFn,
	loginWithGoogleFn,
	logoutFn,
	signupFn,
} from "@/services/auth";

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

export const useLoginWithGoogle = () =>
	useMutation({
		mutationFn: useServerFn(loginWithGoogleFn),
	});

export const useUser = () =>
	useQuery({
		queryKey: ["user"],
		queryFn: useServerFn(fetchUserFn),
	});
