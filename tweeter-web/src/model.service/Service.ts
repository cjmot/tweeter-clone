import { ServerFacade } from '../network/ServerFacade';

export abstract class Service {
    protected serverFacade: ServerFacade;

    protected constructor() {
        this.serverFacade = new ServerFacade();
    }
}
