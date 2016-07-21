import { Control, ControlGroup } from "@angular/common";

interface ValidationResult {
    [key: string]: boolean;
}

export class FormValidator {

    public static checkFirstCharacterValidator(control: Control): ValidationResult {
        var valid = /^\d/.test(control.value);
        if (valid) {
            return {checkFirstCharacterValidator: true};
        }
        return null;
    }
}
