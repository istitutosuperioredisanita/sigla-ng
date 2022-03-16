import { ActivatedRoute } from '@angular/router';
import { of as observableOf} from 'rxjs';

export class MockActivatedRoute extends ActivatedRoute {

    constructor(parameters?: any) {
        super();
        this.queryParams = observableOf(parameters);
        this.params = observableOf(parameters);
    }
}

export class MockRouter {
    navigate = jasmine.createSpy('navigate');
}
