import { Clock, AlertCircle } from "lucide-react";
import { Head } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import TextLink from "@/components/text-link";
import AppLogoIcon from "@/components/app-logo-icon";
import Bagoph from "@/components/app-logo-icon-bp";
import { logout } from "@/routes";

interface WaitingPageProps {
    status?: string;
    canLogout?: boolean;
}

export default function WaitingPage({
    status,
    canLogout = true,
}: WaitingPageProps) {
    return (
        <>
            <Head title="Account Pending Approval" />
            <div className="grid min-h-svh lg:grid-cols-2">
                <div className="flex flex-col gap-4 p-6 md:p-10">
                    <div className="flex justify-center gap-2 md:justify-start">
                        <a href="#" className="flex items-center gap-2 font-medium">
                            <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                            <Bagoph className="size-5 fill-current text-white dark:text-black" />
                            CHED XII SPECIAL-ORDER
                        </a>
                    </div>
                    <div className="flex flex-1 items-center justify-center">
                        <div className="w-full max-w-md">
                            <Card className="border-2">
                                <CardHeader className="text-center space-y-4 pb-6">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                        <Clock className="h-8 w-8 text-muted-foreground animate-pulse" />
                                    </div>
                                    <div className="space-y-2">
                                        <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
                                        <CardDescription className="text-base">
                                            Your account is currently under review by our administrators.
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
                                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                        <AlertTitle className="text-amber-900 dark:text-amber-100">
                                            What happens next?
                                        </AlertTitle>
                                        <AlertDescription className="text-amber-800 dark:text-amber-200">
                                            <ul className="list-disc list-inside space-y-1 mt-2">
                                                <li>An administrator will review your registration</li>
                                                <li>You'll receive an email notification once your account is approved</li>
                                                <li>This process typically takes 1-3 business days</li>
                                            </ul>
                                        </AlertDescription>
                                    </Alert>

                                    {status && (
                                        <div className="rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                                {status}
                                            </p>
                                        </div>
                                    )}

                                    <div className="rounded-md border bg-muted/50 p-4">
                                        <p className="text-sm text-muted-foreground text-center">
                                            Need assistance? Please contact the administrator for more information about your account status.
                                        </p>
                                    </div>

                                    {canLogout && (
                                        <div className="pt-4 border-t">
                                            <TextLink
                                                href={logout()}
                                                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                Sign out and return later
                                            </TextLink>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
                <div className="bg-muted relative hidden lg:block">
                    <img
                        src="/images/3.jpg"
                        alt="Background"
                        className="absolute inset-0 h-full w-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center p-10">
                        <div className="text-center space-y-4 text-white">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                                <Clock className="h-10 w-10" />
                            </div>
                            <h2 className="text-2xl font-semibold">We're reviewing your account</h2>
                            <p className="text-white/90 max-w-md">
                                Thank you for your patience. We're working to get you access as soon as possible.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

