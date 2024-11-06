import ReactGA from 'react-ga';
import { routes } from './routes';

export function gaInit() {
    ReactGA.initialize('UA-171636839-1');
    gaPageview(routes.root);
}

export function gaPageview(page: string) {
    ReactGA.pageview(page);
}

export function gaEvent(category: string, arg: string) {
    ReactGA.event({
        category,
        action: `${category}_${arg}`,
    });
}
