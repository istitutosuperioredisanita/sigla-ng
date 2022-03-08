
import {throwError as observableThrowError,  Observable } from 'rxjs';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { SiglaTestModule } from '../../../test.module';
import { PasswordComponent } from '../../../../../../main/webapp/app/account/password/password.component';
import { PasswordService } from '../../../../../../main/webapp/app/account/password/password.service';
import { Principal } from '../../../../../../main/webapp/app/shared/auth/principal.service';
import { AccountService } from '../../../../../../main/webapp/app/shared/auth/account.service';
import { of as observableOf} from 'rxjs';

describe('Component Tests', () => {

    describe('PasswordComponent', () => {

        let comp: PasswordComponent;
        let fixture: ComponentFixture<PasswordComponent>;
        let service: PasswordService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [SiglaTestModule],
                declarations: [PasswordComponent],
                providers: [
                    Principal,
                    AccountService,
                    PasswordService
                ]
            }).overrideTemplate(PasswordComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(PasswordComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(PasswordService);
        });

        it('should show error if passwords do not match', () => {
            // GIVEN
            comp.password = 'password1';
            comp.confirmPassword = 'password2';
            // WHEN
            comp.changePassword();
            // THEN
            expect(comp.doNotMatch).toBe('ERROR');
            expect(comp.error).toBeNull();
            expect(comp.success).toBeNull();
        });

        it('should call Auth.changePassword when passwords match', () => {
            // GIVEN
            spyOn(service, 'save').and.returnValue(observableOf(true));
            comp.password = comp.confirmPassword = 'myPassword';

            // WHEN
            comp.changePassword();

            // THEN
            expect(service.save).toHaveBeenCalledWith('myPassword');
        });

        it('should set success to OK upon success', function() {
            // GIVEN
            spyOn(service, 'save').and.returnValue(observableOf(true));
            comp.password = comp.confirmPassword = 'myPassword';

            // WHEN
            comp.changePassword();

            // THEN
            expect(comp.doNotMatch).toBeNull();
            expect(comp.error).toBeNull();
            expect(comp.success).toBe('OK');
        });

        it('should notify of error if change password fails', function() {
            // GIVEN
            spyOn(service, 'save').and.returnValue(observableThrowError('ERROR'));
            comp.password = comp.confirmPassword = 'myPassword';

            // WHEN
            comp.changePassword();

            // THEN
            expect(comp.doNotMatch).toBeNull();
            expect(comp.success).toBeNull();
            expect(comp.error).toBe('ERROR');
        });
    });
});
