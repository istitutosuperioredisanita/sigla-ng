import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Leaf } from './leaf.model';

@Injectable()
export class WorkspaceService {

    private resourceUrl = 'api/tree';
    constructor(
        private http: Http
    ) { }

    getTree(): Observable<Map<String, Leaf[]>> {
        return this.http.get(this.resourceUrl).map((res: Response) => res.json());
    }

}
