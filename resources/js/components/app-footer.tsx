import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

export function AppFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-border bg-card mt-auto">
            <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <img
                                src="/images/1.png"
                                alt="CHED XII Logo"
                                className="h-8 w-8"
                            />
                            <img
                                src="/images/2.png"
                                alt="CHED XII Logo"
                                className="h-8 w-8"
                            />
                            <div>
                                <h3 className="font-bold text-foreground text-sm">
                                    CHED XII
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Special-Order
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Commission on Higher Education Region XII Special-Order Appointment System
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-foreground text-sm">
                            Quick Links
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a
                                    href="#"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    About CHED XII
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Services
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Support
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Help Center
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-foreground text-sm">
                            Contact
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <span className="text-muted-foreground">
                                    Region XII Office<br />
                                    General Santos City, Philippines
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                                <a
                                    href="tel:+63832823456"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    (083) 282-3456
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                                <a
                                    href="mailto:ched12@ched.gov.ph"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    ched12@ched.gov.ph
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-foreground text-sm">
                            Resources
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a
                                    href="https://ched.gov.ph"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    CHED Official Website
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://ched.gov.ph/region12"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    CHED XII Website
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Policies
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Terms & Conditions
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-8 border-t border-border pt-6">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <p className="text-sm text-muted-foreground text-center md:text-left">
                            © {currentYear} Commission on Higher Education Region XII. All rights reserved.
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <a
                                href="#"
                                className="hover:text-foreground transition-colors"
                            >
                                Privacy Policy
                            </a>
                            <span className="hidden md:inline">•</span>
                            <a
                                href="#"
                                className="hover:text-foreground transition-colors"
                            >
                                Terms of Service
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

