import { GalleryVerticalEnd } from "lucide-react"
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import Bagoph from '@/components/app-logo-icon-bp';


interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    return (
        <>
            <Head title="Log in" />
            <div className="grid min-h-svh lg:grid-cols-2">
                <div className="flex flex-col gap-4 p-6 md:p-10">
                    <div className="flex justify-center gap-2 md:justify-start">
                        <a href="#" className="flex items-center gap-2 font-medium">
                            <AppLogoIcon className="size-5 fill-current text-white  dark:text-black" />
                            <Bagoph className="size-5 fill-current text-white  dark:text-black" />
                            CHED XII SPECIAL-ORDER
                        </a>
                    </div>
                    <div className="flex flex-1 items-center justify-center">
                        <div className="w-full max-w-xs">
                            <div className="flex flex-col items-center gap-1 text-center mb-10">
                                <h1 className="text-2xl font-bold">Login to your account</h1>
                                <p className="text-muted-foreground text-sm text-balance">
                                    Enter your email below to login to your account
                                </p>
                            </div>
                            {status && (
                                <div className="mb-4 text-center text-sm font-medium text-green-600">
                                    {status}
                                </div>
                            )}
                            <Form
                                {...store.form()}
                                resetOnSuccess={['password']}
                                className="flex flex-col gap-6"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-6">
                                            <div className="grid gap-2">
                                                <Label htmlFor="email">Email address</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                    autoFocus
                                                    tabIndex={1}
                                                    autoComplete="email"
                                                    placeholder="email@example.com"
                                                />
                                                <InputError message={errors.email} />
                                            </div>

                                            <div className="grid gap-2">
                                                <div className="flex items-center">
                                                    <Label htmlFor="password">Password</Label>
                                                    {canResetPassword && (
                                                        <TextLink
                                                            href={request()}
                                                            className="ml-auto text-sm"
                                                            tabIndex={5}
                                                        >
                                                            Forgot password?
                                                        </TextLink>
                                                    )}
                                                </div>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    name="password"
                                                    required
                                                    tabIndex={2}
                                                    autoComplete="current-password"
                                                    placeholder="Password"
                                                />
                                                <InputError message={errors.password} />
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <Checkbox
                                                    id="remember"
                                                    name="remember"
                                                    tabIndex={3}
                                                />
                                                <Label htmlFor="remember">Remember me</Label>
                                            </div>

                                            <Button
                                                type="submit"
                                                className="mt-4 w-full"
                                                tabIndex={4}
                                                disabled={processing}
                                                data-test="login-button"
                                            >
                                                {processing && <Spinner />}
                                                Log in
                                            </Button>
                                        </div>

                                        {canRegister && (
                                            <div className="text-center text-sm text-muted-foreground">
                                                Don't have an account?{' '}
                                                <TextLink href={register()} tabIndex={5}>
                                                    Sign up
                                                </TextLink>
                                            </div>
                                        )}
                                    </>
                                )}
                            </Form>
                        </div>
                    </div>
                </div>
                <div className="bg-muted relative hidden lg:block">
                    <img
                        src="/images/3.jpg"
                        alt="Image"
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                </div>
            </div>
        </>
    );
}
