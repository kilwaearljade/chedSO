import AppLogoIcon from './app-logo-icon';
import Bagoph from './app-logo-icon-bp';

export default function AppLogo() {
    return (
        <>
            <AppLogoIcon className="size-5 fill-current text-white  dark:text-black" />
            <Bagoph className="size-5 fill-current text-white  dark:text-black" />
            <div className="ml-1 grid flex-1 text-left  text-sm">
                <span className="truncate leading-tight font-semibold">
                    CHED XII SPECIAL-ORDER
                </span>
            </div>
        </>
    );
}
