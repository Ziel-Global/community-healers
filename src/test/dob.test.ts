import { describe, it, expect } from 'vitest';
import { differenceInYears, parseISO, isValid } from 'date-fns';

const validateAge = (dobString: string) => {
    if (!dobString) return null;

    const birthDate = parseISO(dobString);
    if (!isValid(birthDate)) return "Invalid date format";

    const age = differenceInYears(new Date(), birthDate);
    if (age < 16) {
        return "You must be at least 16 years old to register.";
    }
    return null;
};

describe('DOB Validation', () => {
    it('should return an error for age under 16', () => {
        const DOB = new Date();
        DOB.setFullYear(DOB.getFullYear() - 15);
        const dobString = DOB.toISOString().split('T')[0];
        expect(validateAge(dobString)).toBe("You must be at least 16 years old to register.");
    });

    it('should return null for age exactly 16', () => {
        const DOB = new Date();
        DOB.setFullYear(DOB.getFullYear() - 16);
        const dobString = DOB.toISOString().split('T')[0];
        expect(validateAge(dobString)).toBeNull();
    });

    it('should return null for age over 16', () => {
        const DOB = new Date();
        DOB.setFullYear(DOB.getFullYear() - 25);
        const dobString = DOB.toISOString().split('T')[0];
        expect(validateAge(dobString)).toBeNull();
    });

    it('should return error for invalid date', () => {
        expect(validateAge("not-a-date")).toBe("Invalid date format");
    });
});
